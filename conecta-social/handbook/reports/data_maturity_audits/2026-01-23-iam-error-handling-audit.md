# Auditoria de Maturidade de Dados: Tratamento de Erros e Semântica

**Data:** 23/01/2026
**Responsável:** Data-Maturity-Reviewer
**Escopo:** Módulo IAM (Controllers e Validação)

## 1. Diagnóstico Técnico
A análise dos logs de erro reportados pelo usuário revelou uma falha na **Dimensão de Qualidade (Medição e Controle)**.

### 🔴 Bad Practice Identificada
O `AuthController` está capturando `ZodError` e retornando `error.message`. O Zod, por padrão, retorna uma string JSON escapada quando múltiplas falhas ocorrem.
- **Evidência:** `{ "message": "[\n  {\n    \"expected\": \"string\", ...", "details": [...] }`
- **Impacto:** Nível de Maturidade rebaixado para 2 nesta dimensão por dificultar o consumo programático pelo front-end.

## 2. Plano de Ação (MMD Nível 4)
Para elevar a maturidade, o sistema deve:
1.  **Estruturar a Resposta:** Não retornar a string crua do Zod.
2.  **Centralização:** Criar um `formatZodError` utility ou usar um middleware de erro que transforme `ZodIssue[]` em um array amigável de mensagens traduzidas.

## 3. Checklist de Verificação
- [x] Dados fortemente tipados (Zod).
- [ ] Tratamento de erro programático amigável (Pendente).
- [x] Documentação OpenAPI sincronizada (Hono-Zod-OpenAPI).

---
*Relatório gerado em conformidade com o DATA_QUALITY_GUIDE.md.*
