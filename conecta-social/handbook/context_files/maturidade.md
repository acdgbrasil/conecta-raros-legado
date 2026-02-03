# Modelo de Maturidade de Dados (MMD) - Conecta Social

Este documento rastreia a evolução da maturidade de dados do projeto com base no DAMA-DMBOK e nos Manuais de Governança.

## 📊 Status Geral: Nível 3 (Definido)

> **Última Atualização:** 03/02/2026
> **Responsável:** Data-Maturity-Reviewer

---

## Dimensões de Maturidade

### 1. Qualidade de Dados (Nível 3 - Definido)
- [x] Uso de Schemas Zod para todas as entradas e saídas.
- [x] Validação de tipos complexos (Email, UUIDv7, Senhas Fortes).
- [ ] **Ponto de Atenção:** Respostas de erro estruturadas existem, mas dependem de `JSON.parse(error.message)` para erros de validação.
- [ ] Implementação de *Branded Types* para identificadores de domínio.

### 2. Conhecimento sobre os Dados (Nível 4 - Gerenciado)
- [x] Documentação Viva: Integração total com `hono-zod-openapi`.
- [x] Metadados Semânticos: Uso sistemático de `.describe()` e `.meta()` nos Schemas.
- [x] Glossário Técnico: Enums de domínio (`NotificationStatus`, `NotificationChannel`) refletidos no banco de dados.

### 3. Ética e Privacidade (Nível 2 - Básico)
- [x] Minimização de Dados: DTOs de saída filtram campos sensíveis (`passwordHash`).
- [🚨] **Risco Crítico:** Logs de PII identificados no módulo de notificações.
- [🚨] **Risco Crítico:** Geração de códigos OTP usando `Math.random()` (Inseguro).
- [ ] Anonimização de dados pessoais em fluxos de deleção.

### 4. Ciclo de Vida e Auditoria (Nível 3 - Definido)
- [x] Soft Delete implementado (`isActive`).
- [x] Colunas de Auditoria: `createdAt`, `updatedAt`, `createdBy`.
- [x] Integridade Referencial: Migração concluída para vincular códigos de recuperação a `user_id` (FK).
- [ ] Tabela de Log de Auditoria (`audit_logs`) estruturada, mas com baixa granularidade de eventos.

---

## 📝 Histórico de Evolução
- **03/02/2026**: BFF web/mobile para IAM; respostas HTTP padronizadas e cookies seguros.
- **23/01/2026**: Auditoria de Erros e Segurança. Identificada falha na geração de OTP e na formatação de mensagens do Zod.
- **20/01/2026**: Monorepo Refactor. Consolidação da infraestrutura baseada em Clean Architecture.
