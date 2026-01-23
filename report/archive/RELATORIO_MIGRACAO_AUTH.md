# Relatório de Migração e Isolamento de Autenticação

**Data:** 18 de Janeiro de 2026
**Status:** Parcialmente Concluído (Autenticação Isolada, Mongo Intocado)

## 1. Visão Geral
Este relatório detalha o processo de migração do backend de Express para Hono (Bun) e o subsequente isolamento da camada de autenticação (PostgreSQL) da camada de regras de negócio (MongoDB). O objetivo principal foi garantir a estabilidade das funcionalidades legadas enquanto se moderniza a infraestrutura de autenticação.

## 2. Diagnóstico de Falhas Iniciais

Durante os testes iniciais de migração, foram identificados os seguintes problemas críticos:

### 2.1. Conflito de Variáveis de Ambiente (Critical)
- **Problema:** O token JWT gerado durante o login estava sendo rejeitado pelo middleware de verificação com `JsonWebTokenError: invalid signature`.
- **Causa Raiz:** O container Docker estava utilizando uma versão em cache ou pré-existente do `.env` com uma `JWT_PASS_KEY` antiga/longa, enquanto o código atualizado (`.env` local) usava `secret_pass_key`. Reiniciar o container nem sempre recarregava as variáveis corretamente devido à precedência do `docker-compose.yml`.
- **Impacto:** Loop infinito de logins válidos gerando tokens que o próprio servidor considerava inválidos.

### 2.2. Roteamento Nginx vs. Hono (Major)
- **Problema:** Rotas como `/reference-persons` retornavam 404 (HTML do Frontend).
- **Causa Raiz:** O `nginx.conf` estava configurado para encaminhar apenas `/api` para o backend. As rotas no `index.ts` estavam montadas na raiz `/`, fazendo com que o Nginx as enviasse para o Frontend (Next.js).
- **Correção:** Reestruturação do `index.ts` para montar todas as rotas protegidas sob o prefixo `/api`, alinhando com a configuração do Nginx.

### 2.3. "God Object" DatabaseService (Architectural)
- **Problema:** A classe `DatabaseService` implementava interfaces de Auth, Adm e User (Postgres) E interfaces de Negócio (Mongo).
- **Impacto:** Qualquer alteração na lógica de login (ex: hash de senha) arriscava quebrar a injeção de dependência ou a inicialização das conexões do Mongo.

## 3. Arquitetura de Isolamento Implementada

Para resolver os problemas arquiteturais e garantir a segurança da migração, a seguinte estrutura foi adotada:

### 3.1. Camada de Autenticação (PostgreSQL) - `src/lib/auth` & `src/services`
Criamos uma "ilha" de autenticação que não depende do restante do sistema legado.

*   **`src/lib/auth/jwt.ts`**:
    *   Uma biblioteca estática independente para geração e validação de tokens.
    *   Possui seu próprio Middleware Hono (`AuthLib.middleware`), eliminando a dependência do antigo `jwtToken.ts`.
    *   Lê variáveis de ambiente com fallbacks seguros.

*   **`src/services/AuthService.ts`**:
    *   Serviço dedicado exclusivamente a operações no PostgreSQL (`users` table).
    *   Gerencia Login, Registro e Desativação de usuários.
    *   Substitui o uso do `DatabaseService` nos controllers `AuthController` e `UserManagementController`.

### 3.2. Camada de Negócio (MongoDB) - `src/infra/database` (Intocada)
A lógica de negócio sensível foi preservada integralmente para evitar regressão.

*   **`DatabaseService`**: Continua existindo, mas agora é utilizado apenas pelos controladores de negócio (`FamilyController`, `ConditionsController`, etc.).
*   **Conexão Mongo**: Mantida no `src/index.ts` e iniciada em paralelo ao Postgres.

### 3.3. Roteamento Unificado
O arquivo `src/index.ts` agora atua como um Gateway, direcionando o tráfego:

```typescript
// Rotas Públicas (AuthService)
app.route('/api', authRouter);

// Rotas Protegidas (Middleware Isolado)
protectedApp.use('*', AuthLib.middleware);

// Rotas de Negócio (Legado/Mongo)
protectedApp.route('/', referencePersonRouter);
protectedApp.route('/', familyRouter);
// ...
```

## 4. Próximos Passos Recomendados

1.  **Validação de Ambiente:**
    *   Certificar-se de que o arquivo `.env` de produção contenha `JWT_PASS_KEY` e `JWT_EMAIL_KEY` fortes e consistentes.
    *   Executar `docker-compose up -d --force-recreate` para garantir que as novas variáveis sejam carregadas.

2.  **Limpeza de Código:**
    *   Remover arquivos obsoletos: `src/infra/jwt/jwtToken.ts` (substituído por `AuthLib`), `src/useCase/controllers/authController.ts` (lógica movida para `AuthService`).
    *   Refatorar `DatabaseService` para remover os métodos mortos de autenticação (interface segregation).

3.  **Testes de Integração:**
    *   Testar o fluxo completo: Login -> Token -> Criar Pessoa de Referência (Mongo).
    *   Isso validará se o `user` injetado pelo `AuthLib` no contexto do Hono (`c.get('user')`) está sendo lido corretamente pelos controladores legados (que podem esperar `res.locals.user`). *Atenção: Controladores legados precisam ser adaptados para ler do Contexto Hono.*

## 5. Conclusão
A autenticação foi desacoplada com sucesso. O sistema agora opera em um modelo híbrido onde o Postgres gerencia o acesso e o Mongo gerencia os dados, sem acoplamento direto no código. Isso facilita a manutenção e futuras migrações para microsserviços se necessário.
