#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Assistente de Commit (Conventional Commits) ===${NC}"
echo -e "${YELLOW}Baseado no agente: Git_Commit_Reviewer${NC}"

# 1. Verificar Staging
if git diff --cached --quiet; then
    echo -e "${YELLOW}Nenhuma alteração em stage detectada.${NC}"
    read -p "Deseja rodar 'git add .' para adicionar tudo? (s/n): " ADD_ALL
    if [[ "$ADD_ALL" == "s" || "$ADD_ALL" == "S" ]]; then
        git add .
        echo -e "${GREEN}Arquivos adicionados!${NC}"
    else
        echo -e "${RED}Nada para commitar. Abortando.${NC}"
        exit 1
    fi
fi

# 2. Selecionar Tipo
echo -e "\n${BLUE}Selecione o tipo de alteração:${NC}"
echo "1) feat     ✨  Novo recurso"
echo "2) fix      🐛  Correção de bug"
echo "3) docs     📚  Documentação"
echo "4) style    🎨  Formatação (espaços, etc - não altera código)"
echo "5) refactor ♻️   Refatoração (sem mudar funcionalidade)"
echo "6) test     🧪  Testes"
echo "7) build    📦  Build/Dependências"
echo "8) ci       🧱  Integração Contínua"
echo "9) chore    🔧  Tarefas de build/config/outros"
echo "10) perf    ⚡  Performance"
echo "11) cleanup 🧹  Limpeza de código"
echo "12) remove  🗑️  Remoção de arquivos"
echo "13) raw     🗃️  Arquivos de dados/config brutos"

read -p "Opção (1-13): " TYPE_OPT

case $TYPE_OPT in
    1) TYPE="feat"; EMOJI="✨";;
    2) TYPE="fix"; EMOJI="🐛";;
    3) TYPE="docs"; EMOJI="📚";;
    4) TYPE="style"; EMOJI="🎨";;
    5) TYPE="refactor"; EMOJI="♻️";;
    6) TYPE="test"; EMOJI="🧪";;
    7) TYPE="build"; EMOJI="📦";;
    8) TYPE="ci"; EMOJI="🧱";;
    9) TYPE="chore"; EMOJI="🔧";;
    10) TYPE="perf"; EMOJI="⚡";;
    11) TYPE="cleanup"; EMOJI="🧹";;
    12) TYPE="remove"; EMOJI="🗑️";;
    13) TYPE="raw"; EMOJI="🗃️";;
    *) echo -e "${RED}Opção inválida.${NC}"; exit 1;; 
esac

# 3. Escopo
echo -e "\n${BLUE}Escopo (Opcional - ex: 'login', 'navbar', 'api'). Pressione Enter para pular:${NC}"
read -p "Escopo: " SCOPE

# 4. Descrição
echo -e "\n${BLUE}Descrição (Obrigatório - use PORTUGUÊS, imperativo, ex: 'Adiciona validação de senha'):${NC}"
read -p "Descrição: " DESCRIPTION

if [[ -z "$DESCRIPTION" ]]; then
    echo -e "${RED}A descrição não pode ser vazia.${NC}"
    exit 1
fi

# Montar Mensagem
if [[ -z "$SCOPE" ]]; then
    MSG="$EMOJI $TYPE: $DESCRIPTION"
else
    MSG="$EMOJI $TYPE($SCOPE): $DESCRIPTION"
fi

echo -e "\n${YELLOW}Commit a ser criado:${NC}"
echo -e "${GREEN}$MSG${NC}"

read -p "Confirmar commit? (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo -e "${RED}Commit cancelado.${NC}"
    exit 0
fi

# Executar Commit
git commit -m "$MSG"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Commit realizado com sucesso!${NC}"
    
    # 5. Push Opcional
    read -p "Deseja fazer o push para a branch atual? (s/n): " PUSH
    if [[ "$PUSH" == "s" || "$PUSH" == "S" ]]; then
        BRANCH=$(git branch --show-current)
        echo -e "${BLUE}Fazendo push para origin $BRANCH...${NC}"
        git push origin "$BRANCH"
    else
        echo -e "${YELLOW}Push não realizado. Lembre-se de fazer 'git push' depois.${NC}"
    fi
else
    echo -e "${RED}Erro ao commitar.${NC}"
    exit 1
fi
