# 17 - Security, Multi-tenant, and Ops

## Goal

Avoid data leaks and scale with multiple tenants, with safe ops practices.

## Security and multi-tenant

### Concepts

- Always filter by `tenantId` in queries.
- Create composite indexes with `tenantId`.
- Avoid `findById` without tenant context.

### Good example

```ts
import { Schema, model } from "mongoose";

const projectSchema = new Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
});

projectSchema.index({ tenantId: 1, name: 1 });

export const ProjectModel = model("Project", projectSchema);

export async function listProjects(tenantId: string) {
  return ProjectModel.find({ tenantId })
    .select("name")
    .lean()
    .exec();
}
```

Why it is good:

- Tenant filter on every query.
- Index supports the filter.

### Bad example

```ts
export async function getProject(id: string) {
  return ProjectModel.findById(id).exec();
}
```

Why it is bad:

- No tenant restriction.
- Cross-tenant access risk.

### Checklist

- `tenantId` present on all multi-tenant schemas?
- Composite indexes by tenant?
- Services prevent cross-tenant access?

## Sensitive fields

```ts
const userSchema = new Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
});

export async function getUserSafe(id: string, tenantId: string) {
  return UserModel.findOne({ _id: id, tenantId })
    .select("email")
    .lean()
    .exec();
}
```

### Extra checklist

- Sensitive fields with `select: false`?
- Explicit projection in public responses?

## Security and ops

### Principles

- Validate input before building queries.
- Never expose internal errors to the client.
- Control returned fields.

### Good examples

```js
// Allowed field list
const allowedSort = ["createdAt", "name"];
const sortField = allowedSort.includes(req.query.sort) ? req.query.sort : "createdAt";

const users = await User.find()
  .sort({ [sortField]: 1 })
  .select("name email")
  .lean();
```

### Bad examples

```js
// Query built directly from request
const users = await User.find(req.query);
```

### Quick checklist

- Whitelist of fields and ordering?
- Errors standardized in responses?
- Logs do not expose sensitive data?
