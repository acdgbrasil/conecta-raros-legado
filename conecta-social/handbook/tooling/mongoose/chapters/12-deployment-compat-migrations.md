# 12 - Deployment, Compatibility, and Migrations

## Contents
- [Deployment notes](#deployment-notes)
- [AWS Lambda](#aws-lambda)
- [Next.js](#nextjs)
- [Browser usage](#browser-usage)
- [Compatibility and version support](#compatibility-and-version-support)
- [Deprecations and incompatible packages](#deprecations-and-incompatible-packages)
- [MongoDB server migration ladder](#mongodb-server-migration-ladder)
- [6.x -> 7.0](#6x---70)
- [7.0 -> 7.2](#70---72)
- [7.2 -> 8.x](#72---8x)
- [General server upgrade checklist](#general-server-upgrade-checklist)
- [Migrations overview (5.x to 9.x)](#migrations-overview-5x-to-9x)
- [5.x to 6.x](#5x-to-6x)
- [6.x to 7.x](#6x-to-7x)
- [7.x to 8.x](#7x-to-8x)
- [8.x to 9.x](#8x-to-9x)
- [Mongoose migration ladder (major versions)](#mongoose-migration-ladder-major-versions)
- [5.x -> 6.x](#5x---6x)
- [6.x -> 7.x](#6x---7x)
- [7.x -> 8.x](#7x---8x)
- [8.x -> 9.x](#8x---9x)
- [AI agent checklist](#ai-agent-checklist)


## Deployment notes
### AWS Lambda
- Reuse connections across invocations.
- Avoid `disconnect()` between requests.

### Next.js
- Use a shared connection module in API routes or server components.
- Avoid re-creating models on hot reload by checking `mongoose.models`.

Good example: Next.js model guard
```js
export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

Bad example: re-register model on every request
```js
// Throws OverwriteModelError in dev.
export const User = mongoose.model('User', userSchema);
```

### Browser usage
Mongoose is primarily a server library. Use with caution in the browser (bundling, size, security).

## Compatibility and version support
- Use a supported Node.js version.
- Use a MongoDB server version compatible with Mongoose 9.x.
 - Validate driver and server feature compatibility (transactions, change streams, CSFLE).

## Deprecations and incompatible packages
- Track deprecations before upgrading.
- Some legacy packages are incompatible with Mongoose 9.x.
 - Avoid outdated plugins that depend on removed hooks or query behavior.

## MongoDB server migration ladder
Use this ladder when you want incremental server upgrades.

### 6.x -> 7.0
- Review server release notes for index and query planner changes.
- Validate transactions and change streams behavior in staging.
- Rebuild or verify critical indexes.

### 7.0 -> 7.2
- Re-check aggregation pipelines for behavior changes.
- Validate `$search` or Atlas features if you use them.

### 7.2 -> 8.x
- Confirm driver support and wire protocol compatibility.
- Re-test performance critical queries with explain plans.

### General server upgrade checklist
- Run a full test suite against a staging cluster.
- Capture and compare slow query logs before and after.
- Ensure backup/restore procedures are current.

## Migrations overview (5.x to 9.x)
This section summarizes common upgrade themes. Always read official migration notes when upgrading.

### 5.x to 6.x
- Default to `strictQuery` and updated query behavior.
- Driver upgrades may change connection defaults.

### 6.x to 7.x
- Stricter `strictPopulate` behavior.
- Changes to `lean()` options and default behaviors.

### 7.x to 8.x
- Deprecations removed; update code paths accordingly.
- TypeScript types tightened.

### 8.x to 9.x
- Updated defaults for schema and query strictness.
- Driver changes may affect connection options.

## Mongoose migration ladder (major versions)
Use this ladder if you are upgrading Mongoose itself.

### 5.x -> 6.x
- Arrays became proxies; avoid `cloneDeep()` and use `toObject()` + `init()`.
- Evaluate `strictQuery` and default query casting behavior.

### 6.x -> 7.x
- `strictPopulate` behavior changed; audit populate paths.
- Re-test `lean()` behavior and custom getters/setters.

### 7.x -> 8.x
- Remove deprecated APIs before upgrading.
- TypeScript types tightened; update custom generics.

### 8.x -> 9.x
- Review connection options changes and driver defaults.
- Verify middleware execution order if using plugins.

Good example: upgrade with tests
```js
// Run a regression test suite after each upgrade.
```

Bad example: upgrade without checking deprecations
```js
// Skipping migration notes can break production.
```

## AI agent checklist
- Do not open and close connections per request in serverless.
- Guard model creation in hot-reload environments.
- Review deprecation logs before upgrading.
