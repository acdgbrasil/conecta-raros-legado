---
title: "12 - Deploy, compatibilidade e migracoes"
chapter: "12"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 12 - Deploy, compatibilidade e migracoes

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Orientar sobre versoes, rollout seguro e migracoes de schema/dados.

## Conceitos principais

- Compatibilidade entre MongoDB, driver e Mongoose.
- Migracoes devem ser planejadas e testadas.
- Deploy seguro considera rollback e backups.

## Quando usar

- Ao atualizar versoes de Mongoose/MongoDB.
- Quando muda o schema em producao.

## Armadilhas comuns

- Atualizar sem ler as migracoes oficiais.
- Mudancas de schema sem backfill.
- Deploy sem plano de rollback.

## Checklist humano

- Notas de migracao revisadas.
- Backups e testes antes do deploy.
- Processos idempotentes de atualizacao.

## Exemplos e reforco

### Exemplo bom

```js
export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

### Exemplo ruim

```js
// Throws OverwriteModelError in dev.
export const User = mongoose.model('User', userSchema);
```

### Exemplo bom

```js
// Run a regression test suite after each upgrade.
```

### Exemplo ruim

```js
// Skipping migration notes can break production.
```

## Referencias

- Versao para IA: [[../ai/chapters/12-deployment-compat-migrations.md
- Capitulo original: [[../chapters/12-deployment-compat-migrations.md]]
