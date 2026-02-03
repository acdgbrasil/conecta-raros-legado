# Arquitetura — Bun Native Server

Este documento descreve o padrão atual de servidor HTTP usando `Bun.serve` e roteamento nativo.

## Objetivos
- Rotas planas (flat) e previsíveis para o runtime do Bun.
- Separação de BFFs (web/mobile) dentro do módulo IAM.
- Respostas padronizadas com mappers e payloads consistentes.

## Componentes
- **Bootstrap:** `src/server-bun.ts` inicializa módulos e agrega rotas.
- **Módulo IAM:** expõe `IamModule.routes` com prefixos `/iam/web/*` e `/iam/mobile/*`.
- **Roteamento:** `prefixRoutes` é usado para compor namespaces.

## Padrão de Rotas
- `GET /health` (global)
- `POST /iam/web/auth/login`
- `POST /iam/web/auth/refresh`
- `POST /iam/mobile/login`
- `POST /iam/mobile/refresh`

## Erros
- Erros de autenticação e validação devem passar por `authHttpErrorMapper` para padronizar payloads.
- Erros não tratados devem responder com `application/problem+json` no fallback global.
