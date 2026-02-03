# Variáveis de Ambiente (.env)

Este documento detalha todas as variáveis de ambiente necessárias para rodar a aplicação, suas dependências e valores padrão sugeridos.

> **Importante:** Nunca commite o arquivo `.env` real. Use este guia e o `example.env` como referência.

## Aplicação
| Variável | Descrição | Padrão | Obrigatório? |
| :--- | :--- | :--- | :--- |
| `PORT` | Porta onde o servidor HTTP (Bun Native) irá escutar. | `3000` | Não |
| `NODE_ENV` | Ambiente de execução (`development`, `production`, `test`). | `development` | Sim |

## Banco de Dados (PostgreSQL)
Utilizado pelo módulo IAM e Shared Kernel via `bun:sql`.

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PG_HOST` | Host do banco de dados Postgres. | `localhost` |
| `PG_PORT` | Porta do banco de dados. | `5432` |
| `PG_USER` | Usuário com permissão de leitura/escrita. | `postgres` |
| `PG_PASSWORD` | Senha do usuário. | `admin` |
| `PG_DATABASE` | Nome do banco de dados principal. | `conecta_social` |

## Banco de Dados (MongoDB) - *Legado*
Utilizado pelo módulo Social (atualmente desligado/em refatoração).

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `MONGO_LOCAL_URL` | Connection string do MongoDB. | `mongodb://localhost:27017/social` |

## Segurança (JWT & IAM)
| Variável | Descrição | Notas |
| :--- | :--- | :--- |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT. | **CRÍTICO:** Use uma string longa e aleatória em produção. |
| `SUPER_ADM_EMAIL` | Email do Admin inicial (seed). | Usado apenas no script de seed. |
| `SUPER_ADM_NAME` | Nome do Admin inicial. | |
| `SUPER_ADM_PASSWORD`| Senha inicial do Admin. | |

## Serviços Externos (Notificações)
Chaves de API para envio de e-mails. O sistema usa o padrão Strategy, então apenas um serviço precisa estar ativo dependendo da configuração (atualmente hardcoded para tentar Resend ou Console).

| Variável | Descrição | Link |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Chave de API do Resend.com | [Resend](https://resend.com) |
| `SENDGRID_API_KEY` | Chave de API do SendGrid | [SendGrid](https://sendgrid.com) |
