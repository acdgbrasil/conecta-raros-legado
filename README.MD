# Conecta Social Monorepo

Plataforma **Conecta Social** com backend modular, front-end web e infraestrutura local via Docker. Este repositório concentra o código, documentação e tooling para desenvolvimento e operação.

## Conteúdo Rápido
- **Backend**: APIs e domínios (IAM, Notificações, Social) - *Bun + Hono*
- **Frontend**: App web (Next.js)
- **Infra**: Docker Compose, Nginx, Postgres 18, Mongo 8
- **Docs**: Handbooks, auditorias e relatórios técnicos

## Estrutura do Projeto
```
.
├── conecta-social/          # Backend (Bun Workspaces + Hono)
├── conecta-social-front/    # Frontend (Next.js)
├── ops/                     # Central de DevOps e Infraestrutura
│   ├── config/              # Configurações (ex: Bitwarden IDs)
│   ├── docker/              # Arquivos Docker Compose, Nginx e Secrets
│   └── scripts/             # Scripts de automação (secrets, commits, tests)
├── report/                  # Relatórios de PRs, auditorias e histórico
├── tooling/                 # Guias e tooling interno
└── Makefile                 # Central de comando (Atalhos de desenvolvimento)
```

## Requisitos
- **Docker** + **Docker Compose**
- **Bun** (v1.x+)
- **Make** (Recomendado)
- **Bitwarden Secrets CLI** (`bws`) - Para gestão de segredos

## Setup e Uso (`Makefile`)

O projeto utiliza um `Makefile` robusto para gerenciar todos os cenários. **As senhas são configuradas automaticamente** ao rodar os comandos de ambiente.

### 1. Desenvolvimento (Dia a Dia)

| Comando | Descrição |
| :--- | :--- |
| **`make dev`** | **(Recomendado)** Sobe TUDO (Back, Front, DBs) no Docker em modo *Watch*. |
| **`make dev-infra`** | Sobe APENAS a infraestrutura (Postgres, Mongo, Nginx). Você roda o `bun run dev` localmente. |

### 2. Outros Ambientes

| Comando | Descrição |
| :--- | :--- |
| `make homolog` | Sobe ambiente de Homologação (Staging) com logs de debug e restart policy. |
| `make prod` | Sobe ambiente de **Produção** real, usando Docker Secrets e imagens de build. |
| `make ci` | Roda o pipeline de CI localmente (bancos em memória, encerra ao fim). |

### 3. Utilitários e Testes

| Comando | Descrição |
| :--- | :--- |
| `make commit` | Assistente interativo para criar commits semânticos padronizados. |
| `make migrate` | Executa as migrações do banco de dados (Postgres/IAM). |
| `make seed` | Popula o banco com dados iniciais (Seeds). |
| `make test` | Roda a bateria de testes de API (via Bruno CLI). |
| `make down` | Para todos os containers (Graceful shutdown). |
| `make clean-all` | **CUIDADO**: Remove containers, redes E VOLUMES (zera os bancos). |

## Gestão de Segredos
O setup de segredos é automático. O script `ops/scripts/setup_secrets.sh` é chamado pelo Make e busca as credenciais no **Bitwarden Secrets Manager** com base no arquivo `ops/config/bitwarden.ids`.
- Em DEV: Gera um `.env` local.
- Em PROD: Gera arquivos em `ops/docker/secrets/`.

## Onde olhar primeiro
- **Backend**: `conecta-social/src/`
- **Front-end**: `conecta-social-front/src/`
- **Infraestrutura**: `ops/docker/`
- **Padrões de Commit**: `Agents/Git_Commit_Reviewer.md`

## Licença
Este projeto é licenciado sob **CC BY-NC-SA 4.0**. O uso comercial é proibido.
Veja `LICENSE`.