# 📊 Relatório de Maturidade de Dados (MMD - Gov.br)

**Data da Análise:** 21 de Janeiro de 2026
**Escopo:** Código Fonte (IAM, Notifications, Shared) e Documentação (Handbook).
**Responsável:** Arquiteto de Software Sênior (IA).

Este relatório avalia a aderência do projeto Conecta Social ao **Modelo de Maturidade de Dados (MMD)**, identificando o nível atual e o caminho prático para a evolução.

---

## 1. DIMENSÃO: Conhecimento sobre os Dados

Capacidade da organização de identificar, documentar e gerir o significado dos seus dados.

| ID | Tema | Nível Atual (1-5) | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| **5.1** | **Documentação dos Ativos** | **Nível 3 (Definido)** | A estrutura `handbook/` centraliza o conhecimento. O `api_reference` documenta endpoints. | **Do Nível 3 para 4 (Gerenciado):**<br>Automatizar a geração de documentação.<br><br>🔴 **Bad (Manual):** Escrever `iam.md` manualmente.<br>🟢 **Good (Auto):** Usar `@hono/zod-openapi` para gerar o Swagger JSON direto das rotas. |
| **5.2** | **Glossário de Negócio** | **Nível 2 (Básico)** | Existem pastas `domain_questions`, mas o código em si (Schemas) ainda carece de descrições ricas. | **Do Nível 2 para 3 (Definido):**<br>Enriquecer os Schemas Zod com metadados.<br><br>🔴 **Bad:** `status: z.enum(['A', 'I'])`<br>🟢 **Good:** `status: z.enum(['A', 'I']).describe("Ciclo de vida do usuário: A=Ativo (pode logar), I=Inativo")` |

---

## 2. DIMENSÃO: Qualidade de Dados

Capacidade de garantir que os dados sejam precisos, completos, consistentes e atuais.

| ID | Tema | Nível Atual (1-5) | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| **11.1** | **Gestão da Qualidade** | **Nível 3 (Definido)** | Uso extensivo de **Zod** nos `*.input.ts` para blindar a entrada de dados. Uso de tipos estritos no `tsconfig.json`. | **Do Nível 3 para 4 (Monitorado):**<br>Criar testes de regressão de qualidade de dados.<br><br>🔴 **Bad:** Confiar apenas que o Zod vai barrar.<br>🟢 **Good:** Testes unitários (`bun test`) que tentam injetar dados sujos (Fuzzing) para garantir que as regras de negócio barram. |
| **11.3** | **Medição e Controle** | **Nível 2 (Básico)** | Erros de validação estouram exceções, mas não geram métricas de qualidade. | **Do Nível 2 para 3 (Definido):**<br>Estruturar o Log de Erros de Validação.<br><br>🔴 **Bad:** `console.error(e)` (Texto solto)<br>🟢 **Good:** `logger.warn("Data Quality Incident", { field: "cpf", error: "invalid_checksum", value_masked: "***" })` |

---

## 3. DIMENSÃO: Ética e Privacidade

Conformidade com LGPD e proteção de dados sensíveis.

| ID | Tema | Nível Atual (1-5) | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| **10.1** | **Ética e Tratamento** | **Nível 3 (Definido)** | Uso de **Output Mappers** (`*.output.ts`) que filtram senhas e dados internos antes de retornar à API. Guia `DATA_PRIVACY_GUIDE.md` criado. | **Do Nível 3 para 4 (Gerenciado):**<br>Auditoria automática de acesso a dados sensíveis.<br><br>🔴 **Bad:** Acesso ao perfil não deixa rastro.<br>🟢 **Good:** Middleware que registra: `AuditLog.create({ action: "VIEW_PII", targetUser: id, actor: currentUser })` |

---

## 4. DIMENSÃO: Interoperabilidade

Capacidade de trocar dados com outros sistemas de forma padronizada.

| ID | Tema | Nível Atual (1-5) | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| **9.1** | **Padrões e Normas** | **Nível 3 (Definido)** | Uso de **UUID** para identificadores. Datas em formato ISO 8601 (via Zod). API JSON padrão. | **Do Nível 3 para 4 (Gerenciado):**<br>Contratos de API estritos (Contract Testing).<br><br>🔴 **Bad:** Mudar o nome de um campo e quebrar o frontend.<br>🟢 **Good:** Validar mudanças no CI/CD contra um Schema Registry (ex: Buf, Apollo ou diff de OpenAPI). |

---

## 📝 Conclusão e Próximos Passos

O projeto Conecta Social apresenta uma **maturidade técnica elevada (Nível 3)** nas camadas de infraestrutura e segurança (IAM/Shared), graças à adoção de Clean Architecture e Zod.

Entretanto, a **maturidade de governança (Nível 2)** ainda precisa evoluir. Temos as ferramentas, mas falta a cultura de:
1.  **Descrever** o dado no código (`.describe()`).
2.  **Monitorar** a qualidade (Métricas de erro de validação).
3.  **Auditar** o ciclo de vida (Logs estruturados de acesso).

**Ação Imediata Recomendada:**
Refatorar os arquivos `mapper/*.input.ts` do módulo IAM para incluir `.describe()` em todos os campos, servindo de piloto para a elevação ao Nível 3 na dimensão 5.2.
