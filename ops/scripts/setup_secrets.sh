#!/bin/bash

# setup_secrets.sh
# Script para buscar segredos do Bitwarden Secrets Manager (BWS)
# e popular os arquivos de infraestrutura conforme o ambiente.

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONFIG_FILE="ops/config/bitwarden.ids"
SECRETS_DIR="ops/docker/secrets"
ENV_FILE="ops/docker/.env"

echo -e "${GREEN}=== Setup de Segredos com Bitwarden (BWS) ===${NC}"

# 1. Verificações Prévias
if ! command -v bw &> /dev/null; then
    echo -e "${RED}Erro: 'bw' CLI não encontrado.${NC}"
    echo "Instale via: 'brew install bitwarden-secrets-cli' ou 'npm install -g @bitwarden/sdk-cli'"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}Aviso: Arquivo de configuração '$CONFIG_FILE' não encontrado.${NC}"
    echo "Por favor, copie 'ops/config/bitwarden.ids.example' para 'ops/config/bitwarden.ids' e preencha os IDs."
    exit 1
fi

# Carrega IDs
source "$CONFIG_FILE"

# Função para buscar valor com Fallback (Padrão)
fetch_value_with_fallback() {
    local id=$1
    local name=$2
    local fallback=$3
    
    if [ "$id" == "insira-o-uuid-aqui" ] || [ -z "$id" ]; then
        echo -e "${YELLOW}[DEFAULT] Usando padrão para $name${NC}" >&2
        echo "$fallback"
        return
    fi
    
    echo -n "Buscando $name no BWS... " >&2
    VALUE=$(bw secret get "$id" | jq -r '.value' 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$VALUE" ]; then
        echo -e "${GREEN}OK${NC}" >&2
        echo "$VALUE"
    else
        echo -e "${RED}FALHA! Usando padrão.${NC}" >&2
        echo "$fallback"
    fi
}

echo -e "\n${YELLOW}Escolha o ambiente para configurar:${NC}"
echo "1) PROD    (Gera arquivos em $SECRETS_DIR/ para Docker Secrets)"
echo "2) HOMOLOG (Gera arquivo .env em $ENV_FILE para Homologação)"
echo "3) DEV     (Gera arquivo .env em $ENV_FILE para Desenvolvimento)"
read -p "Opção: " OPT

# --- MODO PROD ---
if [ "$OPT" == "1" ]; then
    echo -e "\n${GREEN}--- Configurando PRODUÇÃO (Docker Secrets) ---${NC}"
    mkdir -p "$SECRETS_DIR"
    
    fetch_value_with_fallback "$BWS_ID_PROD_POSTGRES_PASSWORD" "Prod PG Pass" "ERROR" > "$SECRETS_DIR/postgres_password.txt"
    fetch_value_with_fallback "$BWS_ID_PROD_MONGO_PASSWORD" "Prod Mongo Pass" "ERROR" > "$SECRETS_DIR/mongo_password.txt"
    fetch_value_with_fallback "$BWS_ID_PROD_JWT_SECRET" "Prod JWT Secret" "ERROR" > "$SECRETS_DIR/jwt_secret.txt"

    echo -e "\n${GREEN}Concluído! Use: APP_VERSION=vX.Y.Z docker compose -f ops/docker/compose.prod.yml up -d${NC}"

# --- MODO HOMOLOG ---
elif [ "$OPT" == "2" ]; then
    echo -e "\n${GREEN}--- Configurando HOMOLOGAÇÃO (.env) ---${NC}"
    
    PG_PASS=$(fetch_value_with_fallback "$BWS_ID_HOMOLOG_POSTGRES_PASSWORD" "Homolog PG Pass" "postgres")
    MONGO_PASS=$(fetch_value_with_fallback "$BWS_ID_HOMOLOG_MONGO_PASSWORD" "Homolog Mongo Pass" "example")
    JWT_SEC=$(fetch_value_with_fallback "$BWS_ID_HOMOLOG_JWT_SECRET" "Homolog JWT Secret" "homolog_secret_change_me")

    cat <<EOF > "$ENV_FILE"
# Gerado via script (HOMOLOG) - $(date)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=conecta_social
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASS
MONGO_LOCAL_URL=mongodb://root:${MONGO_PASS}@localhost:27017/conecta_social?authSource=admin
NODE_ENV=production
JWT_SECRET=$JWT_SEC
REFRESH_SECRET=$JWT_SEC
EOF
    echo -e "${GREEN}Arquivo $ENV_FILE gerado!${NC}"

# --- MODO DEV ---
elif [ "$OPT" == "3" ]; then
    echo -e "\n${GREEN}--- Configurando DESENVOLVIMENTO (.env) ---${NC}"

    PG_PASS=$(fetch_value_with_fallback "$BWS_ID_DEV_POSTGRES_PASSWORD" "Dev PG Pass" "postgres")
    MONGO_PASS=$(fetch_value_with_fallback "$BWS_ID_DEV_MONGO_PASSWORD" "Dev Mongo Pass" "example")
    JWT_SEC=$(fetch_value_with_fallback "$BWS_ID_DEV_JWT_SECRET" "Dev JWT Secret" "dev_secret_key_insecure")

    cat <<EOF > "$ENV_FILE"
# Gerado via script (DEV) - $(date)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=conecta_social
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASS
MONGO_LOCAL_URL=mongodb://root:${MONGO_PASS}@localhost:27017/conecta_social?authSource=admin
NODE_ENV=development
JWT_SECRET=$JWT_SEC
REFRESH_SECRET=$JWT_SEC
EOF
    echo -e "${GREEN}Arquivo $ENV_FILE gerado!${NC}"

else
    echo "Opção inválida."
fi
