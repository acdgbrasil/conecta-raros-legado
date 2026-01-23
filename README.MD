# Conecta Social Monorepo

Plataforma **Conecta Social** com backend modular, front-end web e infraestrutura local via Docker. Este repositório concentra o código, documentação e tooling para desenvolvimento e operação.

## Conteudo rapido
- **Backend**: APIs e dominios (IAM, Notificacoes, Social)
- **Frontend**: app web (Next.js)
- **Infra**: Docker Compose, Nginx, Postgres, Mongo
- **Docs**: handbooks, auditorias e relatorios tecnicos

## Estrutura
```
.
├── conecta-social/          # Backend (Bun + Hono + dominios)
├── conecta-social-front/    # Frontend (Next.js)
├── ops/                     # Docker, scripts e testes
├── report/                  # Relatorios e auditorias
├── tooling/                 # Guias e tooling interno
└── Makefile                 # Atalhos de desenvolvimento
```

## Requisitos
- Docker + Docker Compose
- Bun (para rodar comandos locais, testes e scripts)

## Setup rapido
```bash
# backend + infra
make back

# ambiente completo (back + front + infra)
make dev
```

## Comandos principais
```bash
make help     # lista de comandos
make back     # sobe backend + infra
make dev      # sobe tudo
make down     # para containers
make clean    # remove containers + volumes
make logs     # logs em tempo real
make migrate  # migracoes IAM
make seed     # seeds IAM
make test     # testes de API (Bruno)
make debug-db # diagnostico de conexao DB
```

## Onde olhar primeiro
- **Backend**: `conecta-social/src/`
- **Front-end**: `conecta-social-front/src/`
- **Infra**: `ops/docker/compose.dev.yml`
- **Documentacao central**: `conecta-social/handbook/README.md`

## Testes
- Colecao Bruno: `ops/tests/api/`
- Execucao rapida: `make test`

## Notas
- As migracoes atuais focam no modulo **IAM**.
- Os servicos padrao usam Postgres, Mongo e Nginx via Docker.

## Licenca
Este projeto e licenciado sob **CC BY-NC-SA 4.0**. O uso comercial e proibido.
Veja `LICENSE`.

---

Se precisar, posso detalhar fluxo de deploy, variaveis de ambiente e padroes de arquitetura.
