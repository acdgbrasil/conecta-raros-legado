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
│   ├── docker/              # Arquivos Docker Compose e configs Nginx
│   └── scripts/             # Scripts de automação (commits, testes, etc)
├── report/                  # Relatórios de PRs, auditorias e histórico
├── tooling/                 # Guias e tooling interno
└── Makefile                 # Central de comando (Atalhos de desenvolvimento)
```

## Requisitos
- **Docker** + **Docker Compose**
- **Bun** (v1.x+)
- **Make** (Opcional, mas recomendado para usar os atalhos)

## Setup Rápido

1. **Backend + Infraestrutura (Sem Frontend):**
   Ideal para trabalhar apenas na API ou banco de dados.
   ```bash
   make back
   ```

2. **Ambiente Completo (Back + Front + Infra):**
   Sobe tudo com Hot Reload ativado.
   ```bash
   make dev
   ```

## Comandos Principais (`Makefile`)

| Comando | Descrição |
| :--- | :--- |
| `make commit` | **Novo!** Assistente interativo para criar commits semânticos padronizados. |
| `make back` | Sobe apenas Backend, Postgres, Mongo e Nginx (economiza recursos). |
| `make dev` | Sobe o ambiente completo (Front + Back + Infra) em modo Watch. |
| `make down` | Para e remove os containers ativos. |
| `make clean` | **Reset Total**: Para containers e remove volumes (bancos de dados zerados). |
| `make logs` | Exibe logs dos containers em tempo real. |
| `make migrate` | Executa as migrações do banco de dados (Postgres/IAM). |
| `make seed` | Popula o banco com dados iniciais (Seeds). |
| `make test` | Roda a bateria de testes de API (via Bruno CLI). |

## Onde olhar primeiro
- **Backend**: `conecta-social/src/` (Módulos: `iam`, `notifications`, `social`)
- **Front-end**: `conecta-social-front/src/`
- **Infraestrutura**: `ops/docker/`
- **Padrões de Commit**: `Agents/Git_Commit_Reviewer.md`

## Notas de Desenvolvimento
- **Portas**:
  - Frontend: `http://localhost:3000`
  - API (via Nginx): `http://localhost/api`
  - Banco Postgres: `5432`
  - Banco Mongo: `27017`
- **Variáveis de Ambiente**: Os arquivos `.env` são injetados automaticamente pelo Docker Compose. Verifique `ops/docker/compose.yml` para detalhes.

## Licença
Este projeto é licenciado sob **CC BY-NC-SA 4.0**. O uso comercial é proibido.
Veja `LICENSE`.