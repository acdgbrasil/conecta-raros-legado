# ♻️ Data Lifecycle Guide

**Foco:** Gerenciamento, Auditoria e Descarte Seguro.

Dados têm ciclo de vida: nascem, evoluem e morrem. O sistema deve rastrear quem fez o que e permitir o "desfazer" ou auditoria de ações destrutivas.

---

## ❌ O Problema: Hard Delete e Falta de Rastro
Apagar registros fisicamente (`DELETE FROM`) destrói o histórico. Alterar dados sem salvar quem alterou (`updatedBy`) impede auditoria.

### Bad Practice 👎
```typescript
// Repository
async deleteUser(id: string) {
  // PERIGO: Removeu, perdeu para sempre.
  await pg`DELETE FROM users WHERE id = ${id}`; 
}

async updateUser(id: string, data: any) {
  // Quem alterou? Quando? Não sabemos.
  await pg`UPDATE users SET name = ${data.name} WHERE id = ${id}`;
}
```

---

## ✅ A Solução: Soft Delete e Auditoria
Use deleção lógica (marcar como deletado) e colunas de auditoria padrão.

### Good Practice 👍
```typescript
// Repository
async deleteUser(id: string, adminId: string) {
  const now = new Date();
  
  // SOFT DELETE: Dados preservados, apenas ocultos
  await pg`
    UPDATE users 
    SET 
      deleted_at = ${now}, 
      deleted_by = ${adminId},
      is_active = false
    WHERE id = ${id}
  `;

  // Evento de Domínio para side-effects (ex: cancelar assinaturas)
  eventBus.publish("UserDeleted", { userId: id, deletedBy: adminId });
}

async updateUser(id: string, data: any, modifierId: string) {
  await pg`
    UPDATE users 
    SET 
      name = ${data.name},
      updated_at = NOW(),
      updated_by = ${modifierId} -- Rastreabilidade
    WHERE id = ${id}
  `;
}
```

---

## 📋 Checklist do Reviewer (Code Review)

Ao revisar um PR, verifique:

- [ ] **Soft Delete:** A remoção de entidades de negócio é Lógica (`deletedAt`) ou Física (`DELETE`)? Hard delete só é aceito em tabelas de ligação/temp.
- [ ] **Auditoria:** As tabelas possuem `createdAt`, `updatedAt` e, se aplicável, `createdBy`/`updatedBy`?
- [ ] **Side Effects:** A deleção dispara eventos para limpar dados órfãos em outros módulos?
- [ ] **Imutabilidade:** Registros históricos (ex: Log de Acesso, Transação Financeira) estão sendo alterados? (Não deveriam).
