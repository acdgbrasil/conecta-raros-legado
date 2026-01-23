# 19 - Architecture and Agent Guide

## Project architecture

### Goal

Organize code to separate domain, persistence, and transport.

### Suggested structure

```
src/
  db/
    connect.ts
  models/
    user.model.ts
  repositories/
    user.repo.ts
  services/
    user.service.ts
  api/
    user.controller.ts
```

### Good example

```ts
// repositories/user.repo.ts
import { UserModel } from "../models/user.model";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).lean().exec();
}
```

```ts
// services/user.service.ts
import { findUserByEmail } from "../repositories/user.repo";

export async function getUserProfile(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("user not found");
  return user;
}
```

Why it is good:

- Repository isolated from domain rules.
- Service centralizes rules.

### Bad example

```ts
// controllers/user.controller.ts
import { UserModel } from "../models/user.model";

export async function handler(req: any) {
  return UserModel.find({}).exec();
}
```

Why it is bad:

- Controller accesses DB directly.
- Mixed responsibilities.

### Checklist

- Business rules outside controllers?
- Repository only handles persistence?
- Services have unit tests?

### Repository with global filters

```ts
// repositories/project.repo.ts
import { ProjectModel } from "../models/project.model";

export function listProjectsByTenant(tenantId: string) {
  return ProjectModel.find({ tenantId }).lean().exec();
}
```

### Extra checklist

- Repositories receive context (tenantId, userId)?
- Controllers do not access models directly?

## AI agent guide

### Goal

Help AI agents use this documentation with safe, predictable code.

### How an agent should read

- Identify the relevant chapter.
- Read good and bad examples to compare.
- Confirm the checklist at the end.

### Suggested prompt for agents

```
Read the related chapter and propose a solution with Mongoose in TypeScript.
Show a good and a bad example. Summarize risks and required indexes.
```

### Anti-patterns to avoid

- Queries without `limit` and `select`.
- Updates without `runValidators`.
- Populate without field selection.
- `findById` without tenant restriction.

### When to ask for clarification

- It is not clear whether data should be embedded or referenced.
- No information about data volume.
- No domain definition (enum, status, etc).

### Checklist

- Agent applied `lean` when appropriate?
- Agent suggested indexes?
- Agent showed good and bad examples?

### Agent checklist before responding

- Confirmed embed vs reference?
- Checked index needs?
- Applied `limit`, `select`, and `lean`?
- Mentioned `runValidators` in updates?

### Suggested agent output

- Short approach plan.
- TypeScript code with Mongoose.
- Good and bad example.
- Risks and trade-offs.
