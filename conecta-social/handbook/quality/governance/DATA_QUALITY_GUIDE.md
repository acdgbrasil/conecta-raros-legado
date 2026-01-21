# 💎 Data Quality Guide (DAMA-DMBOK)

**Foco:** Qualidade Semântica e Validação Preventiva.

Este guia define os padrões para garantir que os dados que entram no sistema respeitem não apenas tipos técnicos (string, number), mas as **regras de negócio** reais do Conecta Social.

---

## ❌ O Problema: Tipagem "Preguiçosa"
Usar tipos primitivos genéricos permite que dados inválidos trafeguem pelo domínio, explodindo erros apenas na hora de salvar no banco ou, pior, gerando relatórios inconsistentes.

### Bad Practice 👎
```typescript
// Zod Schema genérico
const UserInput = z.object({
  cpf: z.string(), // Aceita "123", "abc", "00000000000"
  age: z.number(), // Aceita -5, 2000
  status: z.string() // Aceita "qualquer_coisa"
});
```

---

## ✅ A Solução: Semântica e Refinements
Utilize o poder do Zod para garantir integridade **antes** do dado tocar o Core do domínio.

### Good Practice 👍
```typescript
import { z } from "zod";

// Enum explícito para Status (Domínio finito de valores)
enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED"
}

const UserInput = z.object({
  // Validação de formato e regra de negócio (CPF válido)
  cpf: z.string()
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "Apenas números")
    .refine((val) => isValidCPF(val), { // Função utilitária externa
      message: "CPF inválido conforme regra da Receita Federal" 
    }),

  // Validação de intervalo (Regra de Negócio: Maioridade)
  age: z.number()
    .int()
    .min(18, "Usuário deve ser maior de idade")
    .max(120, "Idade inválida"),

  // Domínio finito de valores
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE)
});
```

---

## 📋 Checklist do Reviewer (Code Review)

Ao revisar um PR, verifique:

- [ ] **Primitivos Nus:** Existem campos `z.string()` ou `z.number()` que representam conceitos complexos (Email, CPF, CEP, Dinheiro) sem validação extra?
- [ ] **Enums:** Campos de escolha única (Status, Tipo, Categoria) estão usando `z.enum` ou estão como strings soltas?
- [ ] **Refinements:** Regras de negócio essenciais (ex: data de início < data de fim) estão validadas no Schema?
- [ ] **Mensagens de Erro:** Os erros (`.min(1, "Msg")`) são amigáveis para o usuário final ou expõem detalhes técnicos?
