# 00 - Overview and Conventions

## Contents
- [Audience and goals](#audience-and-goals)
- [What is Mongoose](#what-is-mongoose)
- [Conventions used here](#conventions-used-here)
- [Glossary](#glossary)
- [Version support and compatibility](#version-support-and-compatibility)
- [Enterprise and support](#enterprise-and-support)
- [How to validate your usage](#how-to-validate-your-usage)
- [AI agent checklist](#ai-agent-checklist)


This documentation targets Mongoose 9.x and MongoDB server deployments supported by Mongoose 9.x.
It assumes you are a developer (not a DBA) and need safe, repeatable patterns.

## Audience and goals
- You want practical, production-ready examples.
- You want to validate AI output with clear good/bad patterns.
- You need end-to-end coverage from beginner to advanced topics.

## What is Mongoose
Mongoose is an ODM (Object Data Modeling) library for MongoDB in Node.js. It provides:
- Schemas with types, defaults, validation, and middleware.
- Models for queries, CRUD, and aggregation.
- Document instances with change tracking and helpers.

## Conventions used here
- All code examples are Node.js with ESM or CommonJS indicated inline.
- "Good" examples show robust, production-safe patterns.
- "Bad" examples highlight common pitfalls or anti-patterns.
- "Checklist" blocks summarize what the AI agent should enforce.

## Glossary
- Document: an instance of a model stored in MongoDB.
- Schema: a definition of document structure and behavior.
- Model: a compiled schema used for queries and CRUD.
- Subdocument: a nested document inside another document.

## Version support and compatibility
- Mongoose 9.x targets modern MongoDB servers and Node.js versions.
- Always confirm your MongoDB server version and driver compatibility.
- Use `mongoose.version` and `mongoose.mongo` to inspect versions at runtime.
- The original docs include a version support matrix; keep it in sync with your deployment plan.

Good example: check versions at startup
```js
import mongoose from 'mongoose';

console.log('Mongoose:', mongoose.version);
console.log('MongoDB driver:', mongoose.mongo?.version);
```

Bad example: assuming version compatibility without checks
```js
// This is risky in long-lived deployments.
// You may be on a server version not supported by your Mongoose/driver combo.
connect(process.env.MONGO_URL);
```

## Enterprise and support
If your organization needs enterprise support, check the official Mongoose support and sponsorship channels.

## How to validate your usage
- Favor explicit schema definitions over loose `Mixed`.
- Keep connection logic isolated and reused.
- Validate inputs before writing to MongoDB.
- Use strict query casting to prevent silent type bugs.

## AI agent checklist
- Ensure all examples compile with your Node.js version.
- Confirm the MongoDB server version for advanced features (transactions, change streams, FLE).
- Avoid silently disabling validation or middleware unless documented.
- Prefer deterministic patterns (explicit fields, explicit indexes).
