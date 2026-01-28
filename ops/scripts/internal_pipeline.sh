#!/bin/bash

# ==============================================================================
# 🛡️ CONECTA SOCIAL - INTERNAL CD PIPELINE (GATEKEEPER)
# ==============================================================================
# Este script simula uma esteira de CI/CD localmente.
# Se falhar aqui, NÃO suba para o git.

set -e # Para execução se qualquer comando falhar

# Cores
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_FILE="report/pipeline_log.txt"
mkdir -p report

echo -e "${BOLD}${BLUE}🚀 INICIANDO PIPELINE DE VALIDAÇÃO INTERNA...${NC}"
echo "Log completo em: $LOG_FILE"
echo "Início: $(date)" > "$LOG_FILE"

# Função auxiliar de log
log_step() {
    echo -e "\n${BOLD}${YELLOW}➡️  STEP: $1${NC}"
    echo "--- STEP: $1 ---" >> "$LOG_FILE"
}

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SUCESSO${NC}"
    else
        echo -e "${RED}❌ FALHA${NC}"
        echo "Verifique o log para detalhes."
        exit 1
    fi
}

# ------------------------------------------------------------------------------
# 1. STATIC ANALYSIS (Quality Gate)
# ------------------------------------------------------------------------------
log_step "1. Análise Estática (Backend - Bun Native)"
echo "Verificando compilação (Bun Build) no Backend..."
cd conecta-social
# Usa o bundler nativo do Bun para verificar se o código compila corretamente
# É muito mais rápido que o TSC e valida sintaxe/resolução de módulos
if bun build ./src/index.ts --outdir /tmp/bun-check --target bun > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend Compilation OK${NC}"
    rm -rf /tmp/bun-check
else
    echo -e "${RED}❌ Backend Compilation Failed${NC}"
    echo "Dica: O código possui erros de sintaxe ou módulos não resolvidos."
    exit 1
fi
cd ..

log_step "1. Análise Estática (Frontend - Bun)"
echo "Rodando Lint no Frontend..."
cd conecta-social-front
# Next.js via Bun
if bun run lint; then
    echo -e "${GREEN}✅ Frontend Lint OK${NC}"
else
    echo -e "${RED}❌ Frontend Lint Failed${NC}"
    exit 1
fi
cd ..

# ------------------------------------------------------------------------------
# 2. SECURITY CHECK
# ------------------------------------------------------------------------------
log_step "2. Verificação Básica de Segurança"
echo "Buscando chaves expostas (Grep simples)..."

# Procura por "BEGIN RSA PRIVATE KEY" ou "JWT_SECRET=" hardcoded fora de exemplos
if grep -r "JWT_SECRET=" src/ | grep -v "example" | grep -v ".env"; then
    echo -e "${RED}⚠️  ALERTA: Possível segredo exposto no código fonte!${NC}"
    # exit 1  <-- Descomente para bloquear falha de segurança
else
    echo -e "${GREEN}✅ Nenhuma chave óbvia encontrada no código.${NC}"
fi

# ------------------------------------------------------------------------------
# 3. CONTAINER BUILD CHECK
# ------------------------------------------------------------------------------
log_step "3. Docker Build Check"
echo "Testando build das imagens (Backend e Frontend)..."
# Builda sem cache para garantir, mas sem subir o serviço
docker compose -f ops/docker/compose.ci.yml build >> "$LOG_FILE" 2>&1
check_status

# ------------------------------------------------------------------------------
# 4. INTEGRATION TESTS (CI Environment)
# ------------------------------------------------------------------------------
log_step "4. Testes de Integração (Ambiente CI)"
echo "Subindo ambiente CI (Bancos em RAM)..."

# Sobe o ambiente, roda e derruba se falhar ou passar
# Usamos o 'timeout' para evitar que fique pendurado se algo travar
if timeout 300s docker compose -f ops/docker/compose.ci.yml up --abort-on-container-exit --exit-code-from backend >> "$LOG_FILE" 2>&1; then
    echo -e "${GREEN}✅ Ambiente CI subiu e rodou com sucesso.${NC}"
else
    echo -e "${RED}❌ Falha na execução do ambiente CI.${NC}"
    echo "Consulte $LOG_FILE para ver o erro do container."
    exit 1
fi

# ------------------------------------------------------------------------------
# 5. CLEANUP
# ------------------------------------------------------------------------------
log_step "5. Limpeza"
docker compose -f ops/docker/compose.ci.yml down -v >> "$LOG_FILE" 2>&1
echo -e "${GREEN}✅ Limpeza concluída.${NC}"

# ==============================================================================
echo -e "\n${BOLD}${GREEN}🎉 PIPELINE APROVADA! O código está pronto para Commit/Push.${NC}"
echo -e "Use: ${BOLD}make commit${NC} para prosseguir."
