# Relatório de Auditoria LGPD: Módulo IAM

**Data:** 22/01/2026
**Responsável:** Agente Revisor LGPD (LGPD-Reviewer)
**Escopo:** Módulo de Gestão de Identidade e Acesso (`src/modules/iam/**`)
**Status Geral:** 🟡 Em Conformidade Parcial (Ajustes de Segurança e Governança Necessários)

---

## 1. Resumo Executivo
A análise do módulo de IAM revelou um nível de maturidade técnica elevado em relação a segurança (Privacy by Design), com implementação correta de hashing de senhas, gestão de tokens e sanitização de respostas. No entanto, foram identificados riscos relacionados à gestão de segredos (hardcoded fallback), tratamento de dados cadastrais (CPF) e definição formal das bases legais para o tratamento.

## 2. Inventário de Dados Pessoais (Data Mapping)

O módulo trata os seguintes dados pessoais, identificados nas entidades e DTOs:

| Dado Pessoal | Categoria (Guia LGPD) | Classificação | Finalidade |
| :--- | :--- | :--- | :--- |
| **Nome** | Atributo Biográfico | Pessoal | Identificação do usuário no sistema. |
| **E-mail** | Atributo Biográfico | Pessoal | Login, recuperação de senha e comunicações. |
| **CPF** | Dado Cadastral | Pessoal (Alto Risco*) | Identificação única e fiscal. |
| **Cargo/Depto** | Atributo Biográfico | Pessoal | Controle de acesso e organização hierárquica. |
| **Senha** | Credencial | Confidencial | Autenticação (Armazenada apenas como HASH). |

*> Embora o CPF não seja "Sensível" (Art. 5º, II) per se, é um dado de alta criticidade no contexto brasileiro, exigindo salvaguardas adicionais.*

## 3. Análise de Conformidade e Princípios

### 3.1. Princípio da Segurança e Privacy by Design (Art. 6º, VII; Art. 46)
*   ✅ **Pontos Fortes:**
    *   **Hashing Seguro:** Uso de `Bun.password` (Argon2/Bcrypt) para senhas (`CreateUser`, `ResetPassword`).
    *   **Gestão de Sessão:** Implementação robusta de Refresh Tokens com rotação e revogação em eventos críticos (Logout, Alteração de Cargo, Bloqueio).
    *   **Sanitização:** O DTO `UserResponse` remove explicitamente o `passwordHash` antes de devolver ao cliente (`DataQuality.test.ts` confirma isso).
    *   **Silent Fail:** O caso de uso `ForgotPassword` implementa proteção contra enumeração de usuários (retorna mensagem genérica).
*   🚨 **Riscos Identificados:**
    *   **Segredos Padrão:** O serviço `HonoJwtService.ts` possui um fallback para `'DEFAULT_SECRET_CHANGE_ME'`. Embora emita um alerta, isso representa um risco severo se for para produção sem a variável de ambiente `JWT_SECRET`.
    *   **Logs:** O uso de `ConsoleNotificationProvider` sugere que e-mails e códigos de recuperação podem estar sendo printados no console (`stdout`), o que viola princípios de segurança de logs.

### 3.2. Princípio da Necessidade e Minimização (Art. 6º, III)
*   ✅ **Conforme:** O `UpdateUserUseCase` restringe a atualização apenas a campos cadastrais (Nome, CPF, Cargo), impedindo alteração indevida de permissões ou dados sensíveis de auditoria por essa rota.
*   ⚠️ **Atenção:** A coleta de CPF é opcional no Schema (`User.entity.ts`). Recomenda-se avaliar se o CPF é *estritamente necessário* para todos os usuários ou se pode ser removido para perfis que não necessitam (Minimização).

### 3.3. Direitos do Titular (Art. 18)
*   ✅ **Acesso:** Garantido via `GetUserProfile` e `ListUsers`.
*   ✅ **Retificação:** Garantido via `UpdateUser`.
*   ⚠️ **Eliminação:** O sistema implementa apenas **Soft Delete** (`UpdateUserStatus` inativa o usuário).
    *   *Recomendação:* Definir política de retenção. Usuários inativos há X anos devem ser anonimizados ou excluídos fisicamente, conforme "Término do Tratamento" (Seção 2.6 do Guia).

## 4. Hipóteses de Tratamento (Bases Legais)

Com base no contexto de "Conecta Social" (Assistência Social/Governo), as bases legais sugeridas para documentação são:

*   **Gestão de Usuários (Funcionários/Agentes):**
    *   *Hipótese:* **Execução de Contrato** (Art. 7º, V) ou **Cumprimento de Obrigação Legal** (Art. 7º, II - para registros funcionais).
*   **Autenticação e Segurança:**
    *   *Hipótese:* **Legítimo Interesse** (Art. 7º, IX) e **Prevenção à Fraude** (Art. 11, II, g - se houver biometria/dados sensíveis no futuro).

## 5. Recomendações e Plano de Ação

1.  **[CRÍTICO] Correção de Segredos:** Remover o valor default do `JWT_SECRET` em produção ou garantir que o deploy falhe se a variável não existir.
2.  **[ALTO] Auditoria de Logs:** Verificar `ConsoleNotificationProvider`. Garantir que ele mascare o e-mail (ex: `j***@email.com`) e NÃO logue o código de recuperação (OTP).
3.  **[MÉDIO] Documentação:** Adicionar JSDoc nos UseCases informando explicitamente a Base Legal utilizada.
4.  **[MÉDIO] Ciclo de Vida:** Criar uma política ou rotina automatizada para anonimização de usuários inativos após o período legal de guarda.

---
*Relatório gerado automaticamente por LGPD-Reviewer em 22/01/2026.*
