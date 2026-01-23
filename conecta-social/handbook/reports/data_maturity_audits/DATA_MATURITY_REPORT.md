# Relatório de Maturidade de Dados - Conecta Social

**Data:** 22/01/2026
**Responsável:** Data-Maturity-Reviewer
**Escopo:** Módulos `iam`, `notifications`, `shared` (Excluindo legado `social`)
**Status Geral:** 🟢 Nível 3 - Definido (Com pontos críticos de privacidade a corrigir)

---

## 1. Resumo Executivo

O projeto demonstra uma arquitetura sólida e moderna, utilizando **Clean Architecture** e **Domain-Driven Design (DDD)**. A maturidade de dados é alta em termos de modelagem e documentação, graças ao uso extensivo de `Zod` com metadados para OpenAPI. No entanto, foram identificados **riscos severos de privacidade** no módulo de notificações e **falhas de usabilidade técnica** no tratamento de erros de validação (Zod) que impactam a experiência do desenvolvedor front-end.

---

## 2. Avaliação por Dimensão

### DIMENSÃO: Conhecimento sobre os Dados
**Nível Atual:** 4 (Gerenciado)

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 5.1 | Documentação dos Ativos | 4 | Uso extensivo de `.meta({ description, example })` nos Schemas Zod (`User.entity.ts`, `Notification.entity.ts`) integrados ao `hono-zod-openapi`. | **Manter:** Continuar exigindo `.meta()` em todos os DTOs.<br>**Próximo:** Automatizar a geração de dicionário de dados estático (HTML/PDF) no CI/CD a partir do JSON do OpenAPI. |
| 5.2 | Glossário de Negócio | 3 | Enums explícitos (`NotificationChannel`, `NotificationStatus`) e nomes de use cases semânticos (`ChangeUserRole`). | **Bad:** `status: string` (sem enum).<br>**Good:** `status: z.nativeEnum(StatusEnum)` com JSDoc explicando cada estado. |

### DIMENSÃO: Qualidade de Dados
**Nível Atual:** 2 (Básico) ⚠️ *Rebaixado temporariamente*

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 11.1 | Gestão de Qualidade | 3 | Validação forte na entrada (`User.input.ts`) e regras de negócio encapsuladas. | **Good:** `id: z.string().uuid()`. |
| 11.3 | Medição e Controle | 2 | **Crítico:** Erros de validação Zod são retornados como strings JSON escapadas no `AuthController`, dificultando o consumo programático. | **Bad (Atual):** Retornar `error.message` direto.<br>**Good:** Implementar formatador de `ZodIssue[]`. |

### DIMENSÃO: Ética e Privacidade
**Nível Atual:** 2 (Básico) ⚠️ *Ponto de Atenção Crítico*

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 10.1 | Ética e Tratamento | 2 | **Crítico:** `ConsoleNotificationProvider` loga conteúdo sensível. Geração de OTP via `Math.random()` identificada como insegura em 23/01/2026. | **Bad (Atual):** `Math.random()` para OTP.<br>**Good:** `crypto.randomInt()`. |

### DIMENSÃO: Ciclo de Vida e Auditoria
**Nível Atual:** 3 (Definido)

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| - | Auditoria e Rastreio | 3 | Colunas `createdAt`, `updatedAt`, `createdBy`. | **Mapeado:** Necessidade de corrigir FK de `recovery_codes` para `user_id` para manter integridade histórica. |

---

## 3. Plano de Action Imediato (Correções)

1.  **[CRÍTICO] Sanitização de Logs e OTP:** Migrar para `crypto.randomInt` e remover logs de conteúdo.
2.  **[MÉDIO] Refatoração de Erros:** Implementar formatador de erros Zod no `AuthController` para evitar strings JSON escapadas.
3.  **[MÉDIO] Migração de Banco:** Corrigir esquema da tabela `recovery_codes`.

---
*Relatório atualizado por Data-Maturity-Reviewer em 23/01/2026.*