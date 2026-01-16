# Revisão de Rotas (API Review)

Durante a refatoração e documentação, identifiquei alguns pontos de atenção, redundâncias e inconsistências nas rotas atuais.

## 1. Rotas Redundantes ou Conflitantes

### **Listar Pessoas de Referência**
*   **Problema:** Existem duas rotas que parecem competir pelo mesmo padrão de URL ou têm propósitos confusos.
    *   `GET /list/reference/person/:id` (Busca por ID da pessoa)
    *   `GET /list/reference/person/:familyCompositionId` (Esta rota está definida em `familyRouter.ts`, mas o path é idêntico se o ID for o único parâmetro).
*   **Sugestão:** Alterar para:
    *   `GET /reference-persons/:id`
    *   `GET /families/:familyCompositionId/members` (Muito mais claro que está buscando membros da família).

### **Listar Observações**
*   **Problema:** `GET /list/reference/person/observation/:id` retorna a PESSOA inteira, não apenas as observações. O nome da rota sugere que retornaria apenas a lista de observações.
*   **Sugestão:** `GET /reference-persons/:id?include=observations` ou manter o endpoint atual mas renomear para `/reference-persons/:id/details`.

## 2. Inconsistência de Naming (Nomes)

*   **Mistura de Padrões:**
    *   Algumas rotas usam `/list/...`, outras `/create/...`. O padrão RESTful recomenda usar substantivos e verbos HTTP.
    *   Exemplo Ruim: `POST /create/user`
    *   Exemplo Bom: `POST /users`
    *   Exemplo Ruim: `GET /list/reference/person`
    *   Exemplo Bom: `GET /reference-persons`

*   **Erros de Digitação:**
    *   `/create/etinical/documents` -> `etinical` deveria ser `ethnical`.
    *   `/create/helphy/condition` -> `helphy` deveria ser `healthy`. (Isso se reflete no código todo).

## 3. Estrutura de "Create" Excessiva

*   A API parece ter sido desenhada para salvar formulários gigantes passo-a-passo. Existem rotas muito específicas como `/create/family/composition/observation`.
*   **Sugestão:** Consolidação. Ao invés de criar a "observation" isoladamente, talvez ela pudesse ser enviada num `PATCH /families/:id` ou `POST /families/:id/observations`.

## 4. Segurança

*   A rota `/adm/list/all/:admEmail` recebe o email do admin na URL para "validar". Isso é inseguro e redundante, pois o Token JWT já deveria conter essa informação. (Nota: O código atual já verifica o token, mas a URL continua pedindo o email desnecessariamente).

## Resumo das Ações Recomendadas

1.  **Renomear Rotas:** Adotar padrão REST (`/users`, `/families`, `/reports`).
2.  **Corrigir Typo:** `Helphy` -> `Healthy`, `Etinical` -> `Ethnical`.
3.  **Remover Parâmetros Desnecessários:** Remover `:admEmail` das rotas de admin.
4.  **Consolidar Endpoints:** Reduzir a quantidade de endpoints de criação ultra-específicos.
