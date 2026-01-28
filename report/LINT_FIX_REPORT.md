# 🤖 Relatório de Ajustes Automáticos (Lint Fix)

**Data:** 27 de Janeiro de 2026
**Responsável:** IA (Gemini CLI)
**Motivo:** Desbloqueio da Pipeline de CD Interna (`make pipeline`).

> ⚠️ **ATENÇÃO:** Estas alterações foram realizadas de forma automatizada para satisfazer as regras do ESLint/TypeScript. Um humano deve revisar estas mudanças para garantir que o comportamento desejado foi mantido.

## 📝 Alterações Realizadas

### 1. `conecta-social-front/src/app/not-found.tsx`
- **O que foi feito:** Removido o import `Link` que não estava sendo utilizado.
- **Risco:** Nenhum. Limpeza de código morto.

### 2. `conecta-social-front/src/features/auth/actions/auth.actions.ts`
- **O que foi feito:** Substituído o tipo `any` no bloco `catch` por `unknown`. Adicionada verificação `instanceof Error` para acessar a propriedade `message` de forma segura.
- **Risco:** Baixo. Se o erro lançado não for um objeto `Error`, a mensagem padrão será utilizada.

### 3. `conecta-social-front/src/features/auth/hooks/useAuthViewModel.ts`
- **O que foi feito:** 
    - Removido o import `loginAction` não utilizado.
    - Substituído `any` no `catch` por `unknown` com tratamento seguro de erro.
- **Risco:** Baixo. Melhora a tipagem e segurança do código.

### 4. `conecta-social-front/src/shared/models/user.model.ts`
- **O que foi feito:** Alterado o tipo da propriedade `isActive` de `Boolean` (Objeto) para `boolean` (Primitivo).
- **Risco:** Nenhum. Segue as convenções recomendadas pelo TypeScript.

---
*Este documento deve ser deletado após a revisão humana.*
