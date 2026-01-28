# ==============================================================================
# 🛠️ Makefile - Conecta Social Master Control
# ==============================================================================
# Central de comando para orquestração de ambientes Docker, automação de scripts
# e gestão de segredos.
# ==============================================================================

# --- Variáveis de Configuração ---
DOCKER_DIR  := ops/docker
SCRIPTS_DIR := ops/scripts
SECRETS_DIR := ops/docker/secrets
ENV_FILE    := ops/docker/.env

# --- Arquivos de Compose ---
# Cenario 1: DEV FULL (Tudo no Docker em modo dev)
COMPOSE_SIMULATE := -f $(DOCKER_DIR)/compose.simulate.yml
# Cenario 2: DEV HYBRID (Infra no Docker, Apps locais)
COMPOSE_LOCAL    := -f $(DOCKER_DIR)/compose.local.yml
# Cenario 3: HOMOLOG (Ambiente QA/Staging)
COMPOSE_HOMOLOG  := -f $(DOCKER_DIR)/compose.homolog.yml
# Cenario 4: CI/CD (Pipeline automatizado)
COMPOSE_CI       := -f $(DOCKER_DIR)/compose.ci.yml
# Cenario 5: PROD (Produção com Docker Secrets)
COMPOSE_PROD     := -f $(DOCKER_DIR)/compose.prod.yml

# --- Cores e Formatação ---
BOLD := \033[1m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

.PHONY: help \
	secrets-dev secrets-homolog secrets-prod \
	dev dev-infra homolog prod ci \
	down clean clean-all logs logs-back logs-front \
	migrate seed test test-e2e debug-db commit

# ==============================================================================
# 🆘 HELP
# ==============================================================================
help:
	@echo "$(BOLD)🎮 Conecta Social - Comandos Disponíveis$(NC)"
	@echo ""
	@echo "$(BLUE)--- Ambientes (Setup Automático de Secrets) ---$(NC)"
	@echo "  $(GREEN)make dev$(NC)        : Sobe TUDO no Docker (Back+Front+DBs) em modo Watch"
	@echo "  $(GREEN)make dev-infra$(NC)  : Sobe SÓ a Infra (DBs+Nginx). Rode apps localmente (bun run dev)"
	@echo "  $(GREEN)make homolog$(NC)    : Sobe ambiente de QA/Staging (Logs debug, restart always)"
	@echo "  $(GREEN)make prod$(NC)       : Sobe ambiente de PRODUÇÃO (Imagens buildadas, Secrets reais)"
	@echo "  $(GREEN)make ci$(NC)         : Roda ambiente de CI (Testes, bancos voláteis)"
	@echo ""
	@echo "$(BLUE)--- Gestão de Segredos ---$(NC)"
	@echo "  make secrets-dev    : Gera .env para Dev (Opção 3 do script)"
	@echo "  make secrets-homolog: Gera .env para Homolog (Opção 2 do script)"
	@echo "  make secrets-prod   : Gera arquivos em secrets/ para Prod (Opção 1 do script)"
	@echo ""
	@echo "$(BLUE)--- Utilitários ---$(NC)"
	@echo "  make down           : Para todos os containers (Graceful shutdown)"
	@echo "  make clean          : Para e remove containers/redes"
	@echo "  make clean-all      : ⚠️  RESET TOTAL (Remove containers + VOLUMES dos bancos)"
	@echo "  make logs           : Acompanha logs de todos os serviços"
	@echo "  make commit         : Inicia assistente de Commit Semântico"
	@echo ""
	@echo "$(BLUE)--- Testes e Banco de Dados ---$(NC)"
	@echo "  make migrate        : Roda migrações do IAM e Notifications"
	@echo "  make seed           : Popula banco com dados de teste"
	@echo "  make test           : Roda testes de API (Bruno CLI)"
	@echo "  make pipeline       : 🛡️  Roda o Gatekeeper (Lint, Build, CI Tests) antes do commit"
	@echo "  make debug-db       : Roda script de diagnóstico de conexão DB"

# ==============================================================================
# 🔑 GESTÃO DE SEGREDOS
# ==============================================================================
secrets-dev:
	@echo "$(YELLOW)🔧 Configurando Secrets para DEV...$(NC)"
	@echo "3" | ./$(SCRIPTS_DIR)/setup_secrets.sh

secrets-homolog:
	@echo "$(YELLOW)🔧 Configurando Secrets para HOMOLOG...$(NC)"
	@echo "2" | ./$(SCRIPTS_DIR)/setup_secrets.sh

secrets-prod:
	@echo "$(YELLOW)🔒 Configurando Secrets para PROD...$(NC)"
	@echo "1" | ./$(SCRIPTS_DIR)/setup_secrets.sh

# ==============================================================================
# 🚀 AMBIENTES (MASTER COMMANDS)
# ==============================================================================

# --- DEV FULL (Tudo no Docker) ---
dev: secrets-dev
	@echo "$(GREEN)🚀 Iniciando ambiente DEV FULL (Simulate)...$(NC)"
	docker compose $(COMPOSE_SIMULATE) up --build

# --- DEV INFRA (Híbrido) ---
dev-infra: secrets-dev
	@echo "$(GREEN)💻 Iniciando Infraestrutura (Bancos + Nginx)...$(NC)"
	@echo "$(YELLOW)⚠️  Lembre-se de rodar 'bun run dev' no backend/frontend!$(NC)"
	docker compose $(COMPOSE_LOCAL) up -d --build

# --- HOMOLOGAÇÃO ---
homolog: secrets-homolog
	@echo "$(BLUE)🧪 Iniciando ambiente HOMOLOGAÇÃO...$(NC)"
	docker compose $(COMPOSE_HOMOLOG) up -d --build

# --- PRODUÇÃO ---
prod: secrets-prod
	@echo "$(RED)$(BOLD)🚨 INICIANDO AMBIENTE DE PRODUÇÃO 🚨$(NC)"
	@echo "Certifique-se que APP_VERSION está definido corretamente."
	docker compose $(COMPOSE_PROD) up -d --build

# --- CI/CD ---
ci:
	@echo "$(BLUE)🤖 Iniciando ambiente CI/CD (Bancos em RAM)...$(NC)"
	# CI não usa secrets persistentes, usa variaveis de ambiente do runner ou defaults
	docker compose $(COMPOSE_CI) up --abort-on-container-exit --exit-code-from backend

# ==============================================================================
# 🛠️ UTILITÁRIOS
# ==============================================================================

down:
	@echo "$(YELLOW)🛑 Parando serviços...$(NC)"
	# Tenta dar down no simulate por padrão, que cobre a maioria
	docker compose $(COMPOSE_SIMULATE) down 2>/dev/null || true
	docker compose $(COMPOSE_PROD) down 2>/dev/null || true
	docker compose $(COMPOSE_LOCAL) down 2>/dev/null || true

clean:
	@echo "$(YELLOW)🧹 Removendo containers e orfãos...$(NC)"
	docker compose $(COMPOSE_SIMULATE) down --remove-orphans

clean-all:
	@echo "$(RED)🔥 DESTRUINDO TUDO (Volumes inclusos)...$(NC)"
	docker compose $(COMPOSE_SIMULATE) down -v --remove-orphans
	docker compose $(COMPOSE_PROD) down -v --remove-orphans
	rm -f $(ENV_FILE)
	rm -rf $(SECRETS_DIR)

logs:
	docker compose $(COMPOSE_SIMULATE) logs -f

commit:
	@./$(SCRIPTS_DIR)/git_commit_helper.sh

# ==============================================================================
# 🧪 TESTES E BANCO
# ==============================================================================

migrate:
	@echo "$(BLUE)🔄 Executando Migrações...$(NC)"
	# Usa o container backend do ambiente simulate/dev para rodar o comando
	docker compose $(COMPOSE_SIMULATE) exec backend bun run migrate:iam
	docker compose $(COMPOSE_SIMULATE) exec backend bun run migrate:notifications

seed:
	@echo "$(GREEN)🌱 Semeando Banco de Dados...$(NC)"
	docker compose $(COMPOSE_SIMULATE) exec backend bun run seed:iam

test:
	@echo "$(BLUE)🧪 Rodando Testes de API (Bruno)...$(NC)"
	cd ops/tests/api && bunx @usebruno/cli run . --env dev -r

pipeline:
	@./$(SCRIPTS_DIR)/internal_pipeline.sh

debug-db:
	@echo "$(YELLOW)🕵️ Debugando Conexão DB...$(NC)"
	docker cp ops/scripts/debug_db.ts conecta-backend:/app/debug_db.ts
	docker compose $(COMPOSE_SIMULATE) exec backend bun run debug_db.ts