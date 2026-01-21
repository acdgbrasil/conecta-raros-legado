# 📚 Data Dictionary Guide (Glossário)

**Foco:** Conhecimento sobre os Dados e Contexto de Negócio.

Código é lido muito mais vezes do que é escrito. Este guia visa eliminar a ambiguidade e transformar nossos Schemas Zod em documentação viva.

---

## ❌ O Problema: Nomes Mágicos e Ambiguidade
Desenvolvedores novos (ou você mesmo daqui a 6 meses) não saberão o que significa um campo obscuro ou um "número mágico".

### Bad Practice 👎
```typescript
const TransactionSchema = z.object({
  t_type: z.number(), // O que é 1? O que é 2?
  val: z.number(), // É centavos? Reais? Dólar?
  flag: z.boolean() // Flag de que?
});
```

---

## ✅ A Solução: Documentação Viva com `.describe()`
O método `.describe()` do Zod é exportado automaticamente para o Swagger/OpenAPI e serve como documentação inline.

### Good Practice 👍
```typescript
const TransactionSchema = z.object({
  /**
   * Tipo da transação financeira.
   * 1 = Crédito (Entrada)
   * 2 = Débito (Saída)
   * @see https://confluence.conectasocial.com.br/financeiro/tipos
   */
  transactionType: z.nativeEnum(TransactionType)
    .describe("Classificação contábil da movimentação."),

  amountInCents: z.number()
    .int()
    .nonnegative()
    .describe("Valor monetário da transação representado em CENTAVOS (BRL) para evitar erros de ponto flutuante."),

  isReconciled: z.boolean()
    .describe("Indica se esta transação já foi conciliada com o extrato bancário.")
});
```

---

## 📋 Checklist do Reviewer (Code Review)

Ao revisar um PR, verifique:

- [ ] **Nomes Significativos:** Os nomes das variáveis explicam o conteúdo? (ex: `amountInCents` vs `val`).
- [ ] **.describe():** Campos com regras específicas ou unidades de medida possuem `.describe()` preenchido?
- [ ] **Números Mágicos:** Existem comparações com números literais (`status === 9`) sem explicação ou constante nomeada?
- [ ] **Links de Contexto:** Regras complexas possuem link para a documentação oficial ou issue do Jira/Linear?
