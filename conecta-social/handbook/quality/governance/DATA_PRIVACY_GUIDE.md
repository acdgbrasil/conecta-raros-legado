# 🛡️ Data Privacy Guide (LGPD/GDPR)

**Foco:** Privacidade, Ética e Privacy by Design.

A proteção de dados pessoais (PII - Personally Identifiable Information) deve ser a configuração padrão do sistema, não uma reflexão tardia.

---

## ❌ O Problema: Vazamento de PII e Coleta Excessiva
Logar dados sensíveis ou retornar o objeto completo do banco de dados expõe senhas, CPFs e dados médicos desnecessariamente.

### Bad Practice 👎
```typescript
// Controller
async getUser(req, res) {
  const user = await db.users.findById(req.params.id);
  
  // PERIGO: Logando dados sensíveis em texto plano
  console.log("Buscando usuário:", user); 

  // PERIGO: Retornando tudo (incluindo password_hash, soft_delete flags, etc)
  return res.json(user);
}
```

---

## ✅ A Solução: Minimização e Mascaramento
Use DTOs de Saída (Output Mappers) para filtrar estritamente o que o frontend precisa ver. Nunca confie no objeto do banco.

### Good Practice 👍
```typescript
// 1. Output Mapper (Filtro)
const UserPublicProfile = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  // Email e CPF removidos intencionalmente para visualização pública
  createdAt: z.date()
});

// 2. Logger Seguro
import { logger } from "@modules/shared/infra/logger";

async getUser(req, res) {
  const userEntity = await repo.findById(req.params.id);

  // LOG SEGURO: Apenas IDs ou dados anonimizados
  logger.info("Usuário recuperado com sucesso", { 
    userId: userEntity.id,
    hasCrm: !!userEntity.crm // Loga se TEM CRM, não o número
  });

  // RETORNO SEGURO: Passa pelo Zod para limpar campos extras
  const safeOutput = UserPublicProfile.parse(userEntity);
  
  return res.json(safeOutput);
}
```

---

## 📋 Checklist do Reviewer (Code Review)

Ao revisar um PR, verifique:

- [ ] **Over-fetching:** O endpoint está retornando campos que o frontend não usa? (Princípio da Minimização).
- [ ] **Logs Limpos:** Existem `console.log` ou `logger.info` expondo CPF, Email, Senha, Token ou Dados de Saúde?
- [ ] **Output Mapper:** O retorno da API está tipado com um Schema Zod de saída (`.output.ts`)?
- [ ] **Dados Sensíveis:** Se há tratamento de dados sensíveis (Senha, Saúde), eles estão sendo mascarados ou encriptados corretamente?
