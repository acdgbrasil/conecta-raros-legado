# Makefile para Conecta Social
# Abstrai a complexidade do Docker Compose em comandos simples

# Caminho para os arquivos do Docker
DOCKER_DIR := ops/docker
COMPOSE_DEV := -f $(DOCKER_DIR)/compose.dev.yml
COMPOSE_DOCKER := -f $(DOCKER_DIR)/compose.backend-docker.yml
COMPOSE_LOCAL := -f $(DOCKER_DIR)/compose.backend-local.yml

.PHONY: help dev dev-docker dev-local back front down clean logs migrate seed test debug-db

help:
	@echo "Comandos disponíveis:"
	@echo "  make dev         - (Padrão) Sobe ambiente completo via compose.dev.yml"
	@echo "  make dev-docker  - Sobe TUDO no Docker (Backend + Front + Bancos)"
	@echo "  make dev-local   - Sobe SÓ Infra (Bancos + Nginx). Rode o back/front localmente"
	@echo "  make back        - Sobe APENAS o Backend e Infra (Postgres, Mongo, Nginx)"
	@echo "  make down        - Para os containers"
	@echo "  make clean       - Para tudo e remove volumes (reset total)"
	@echo "  make logs        - Mostra logs dos containers"
	@echo "  make migrate     - Roda as migrações do banco (IAM)"
	@echo "  make seed        - Roda os seeds do banco (IAM)"
	@echo "  make test        - Roda testes de API com Bruno CLI"
	@echo "  make debug-db    - Roda script de diagnóstico de conexão DB"
	@echo "  make commit      - Cria um commit semântico padronizado (com emojis) e opção de push"

# Sobe apenas o essencial para o backend funcionar (Modo Padrão Antigo)
back:
	@echo "🚀 Iniciando Backend e Infraestrutura..."
	docker-compose $(COMPOSE_DEV) up --build backend postgres mongo nginx

# Sobe tudo (Modo Desenvolvimento Padrão)
dev:
	@echo "🚀 Iniciando ambiente completo..."
	docker-compose $(COMPOSE_DEV) up --watch --build

# Cenario 1: Tudo no Docker
dev-docker:
	@echo "🐳 Iniciando ambiente Full Docker..."
	docker-compose $(COMPOSE_DOCKER) up --build

# Cenario 2: Infra no Docker, Apps Locais
dev-local:
	@echo "💻 Iniciando Infraestrutura (Bancos + Nginx)..."
	@echo "⚠️  Não esqueça de rodar 'bun run dev' no backend e frontend!"
	docker-compose $(COMPOSE_LOCAL) up -d --build

down:
	@echo "🛑 Parando ambiente..."
	docker-compose $(COMPOSE_DEV) down

clean:
	@echo "🧹 Limpando tudo (containers e volumes)..."
	docker-compose $(COMPOSE_DEV) down -v

logs:
	docker-compose $(COMPOSE_DEV) logs -f

migrate:
	@echo "🔄 Rodando migrações..."
	docker-compose $(COMPOSE_DEV) run --rm backend bun run migrate:iam
	docker-compose $(COMPOSE_DEV) run --rm backend bun run migrate:notifications

seed:
	@echo "🌱 Rodando seeds..."
	docker-compose $(COMPOSE_DEV) run --rm backend bun run seed:iam

test:
	@echo "🧪 Rodando testes de API com Bruno..."
	@# Entra na pasta e roda de forma recursiva (-r) para pegar as subpastas IAM
	cd ops/tests/api && bunx @usebruno/cli run . --env dev -r

test-reset:
	@echo "🧪 Rodando Teste E2E de Reset de Senha..."
	bun run ops/scripts/e2e_reset_password.ts

debug-db:
	@# Copia o script para dentro do container e executa
	docker cp ops/scripts/debug_db.ts conecta-backend:/app/debug_db.ts
	docker-compose $(COMPOSE_DEV) exec backend bun run debug_db.ts

commit:
	@ops/scripts/git_commit_helper.sh