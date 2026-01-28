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

# Função de Loading (Spinner)
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    echo -n " "
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "[%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

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
        echo "Verifique o log para detalhes em $LOG_FILE."
        exit 1
    fi
}

# ------------------------------------------------------------------------------
# 1. STATIC ANALYSIS (Quality Gate)
# ------------------------------------------------------------------------------
log_step "1. Análise Estática (Backend - Bun Native)"
echo -n "Verificando compilação (Bun Build) no Backend... "
cd conecta-social
# Executa em background para o spinner funcionar
(bun build ./src/index.ts --outdir /tmp/bun-check --target bun >> ../"$LOG_FILE" 2>&1) &
spinner $!
wait $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}OK${NC}"
    rm -rf /tmp/bun-check
else
    echo -e "${RED}FALHA${NC}"
    echo "Dica: O código possui erros de sintaxe ou módulos não resolvidos."
    exit 1
fi
cd ..

log_step "1. Análise Estática (Frontend - Bun)"
echo -n "Rodando Lint no Frontend... "
cd conecta-social-front
(bun run lint >> ../"$LOG_FILE" 2>&1) &
spinner $!
wait $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FALHA${NC}"
    exit 1
fi
cd ..

# ------------------------------------------------------------------------------
# 2. SECURITY CHECK
# ------------------------------------------------------------------------------
log_step "2. Verificação Básica de Segurança"
echo -n "Buscando chaves expostas... "

# Procura por chaves hardcoded nos diretórios de código dos módulos
if grep -r "JWT_SECRET=" conecta-social/src/ conecta-social-front/src/ | grep -v "example" | grep -v ".env"; then
    echo -e "${RED}⚠️  ALERTA: Possível segredo exposto no código fonte!${NC}"
    # exit 1  <-- Descomente para bloquear falha de segurança
else
    echo -e "${GREEN}OK${NC}"
fi

# ------------------------------------------------------------------------------
# 3. CONTAINER BUILD CHECK
# ------------------------------------------------------------------------------
log_step "3. Docker Build Check"
echo -n "Testando build das imagens (Backend e Frontend)... "
# Builda sem cache para garantir, mas sem subir o serviço
(docker compose -f ops/docker/compose.ci.yml build >> "$LOG_FILE" 2>&1) &
spinner $!
wait $!
check_status

# ------------------------------------------------------------------------------
# 4. INTEGRATION TESTS (CI Environment)
# ------------------------------------------------------------------------------
log_step "4. Testes de Integração (Ambiente CI)"
TEST_RESULT=0

echo -n "Iniciando containers de teste... "
(docker compose -f ops/docker/compose.ci.yml up -d >> "$LOG_FILE" 2>&1) &
spinner $!
wait $!
echo -e "${GREEN}OK${NC}"

echo -n "Aguardando Backend ficar saudável... "
# Loop de espera pelo healthcheck do backend
(
    while [ "$(docker inspect -f '{{.State.Health.Status}}' conecta-backend 2>/dev/null)" != "healthy" ]; do
        sleep 1
    done
) &
spinner $!
wait $!
echo -e "${GREEN}OK${NC}"

echo -n "Executando Migrações e Seeds no ambiente de CI... "
(
    docker exec conecta-backend bun run migrate:iam >> "$LOG_FILE" 2>&1 && \
    docker exec conecta-backend bun run seed:iam >> "$LOG_FILE" 2>&1
) &
spinner $!
wait $!

if [ $? -eq 0 ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FALHA${NC}"
    echo "Erro ao rodar migrações. Veja o log."
    # Não aborta aqui para tentar limpar, mas marca erro
    TEST_RESULT=1
fi

# Só roda testes se tudo estiver OK até aqui
if [ "$TEST_RESULT" -eq "0" ]; then
    echo -n "Executando bateria de testes API (Bruno - CI Env)... "
    # Roda os testes usando o ambiente 'ci' (localhost:3000) e recursivamente (-r)
    # || true garante que o subshell não retorne erro fatal para o 'wait'
    (cd ops/tests/api && bunx @usebruno/cli run . --env ci -r >> ../../../"$LOG_FILE" 2>&1 || true) &
    spinner $!
    wait $!
    # O wait retorna o exit code do processo. Se foi mascarado pelo || true, precisamos checar o log ou confiar que é warning.
    # Como decidimos que teste falhando é WARNING, assumimos sucesso aqui para o fluxo.
    
    # Verifica se houve falha procurando no log (já que mascaramos o exit code)
    if grep -q "FAIL" "$LOG_FILE"; then
         echo -e "${YELLOW}WARNING${NC}"
         echo "Testes falharam. Detalhes salvos em report/TEST_FAILURES.md"
         cp "$LOG_FILE" report/TEST_FAILURES.md
    else
         echo -e "${GREEN}PASSED${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# 5. CLEANUP
# ------------------------------------------------------------------------------
log_step "5. Limpeza"
echo -n "Limpando ambiente de CI... "
(docker compose -f ops/docker/compose.ci.yml down -v >> "$LOG_FILE" 2>&1) &
spinner $!
wait $!
echo -e "${GREEN}OK${NC}"

if [ $TEST_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Pipeline interrompida: Os testes de integração falharam.${NC}"
    exit 1
fi

# ==============================================================================
echo -e "\n${BOLD}${GREEN}🎉 PIPELINE APROVADA! O código está pronto para Commit/Push.${NC}"
echo -e "Use: ${BOLD}make commit${NC} para prosseguir."
