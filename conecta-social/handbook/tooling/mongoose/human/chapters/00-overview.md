# 00 - Visao geral e convencoes

## Objetivo

Apresentar o escopo da documentacao, o papel do Mongoose e os padroes de uso que evitam erros em producao.

## Conceitos principais

- Mongoose e um ODM que define schemas, modelos e instancias de documentos.
- Conceitos basicos (schema, model, document, subdocument) orientam toda a modelagem.
- Exemplos bons/ruins mostram escolhas seguras e armadilhas comuns.
- Checklist final serve para validar a solucao antes de publicar.

## Quando usar

- Ao iniciar um projeto ou revisar padroes existentes.
- Quando a equipe precisa alinhar convencoes e boas praticas.
- Ao integrar agentes de IA no fluxo de desenvolvimento.

## Armadilhas comuns

- Assumir compatibilidade de versoes sem validar driver/servidor.
- Usar schemas muito permissivos (Mixed) sem necessidade.
- Ignorar validacao e casting explicito em entradas externas.

## Checklist humano

- Versoes de Node, MongoDB e Mongoose conferidas.
- Schemas com tipos, defaults e validadores claros.
- Conexao centralizada e reutilizavel.

## Exemplos e reforco

### Exemplo bom

```js
import mongoose from 'mongoose';

console.log('Mongoose:', mongoose.version);
console.log('MongoDB driver:', mongoose.mongo?.version);
```

### Exemplo ruim

```js
// This is risky in long-lived deployments.
// You may be on a server version not supported by your Mongoose/driver combo.
connect(process.env.MONGO_URL);
```

## Referencias

- Versao para IA: ../../ai/chapters/00-overview.md
- Capitulo original: ../../chapters/00-overview.md
