# 📘 Conecta Social API Handbook

Este documento serve como guia para consumo da API do backend.

## 🌐 Base URL e Configuração

Se você estiver rodando com o Docker Compose e Nginx configurado:
- **Base URL:** `http://localhost` (O Nginx redireciona `/api`, `/create`, `/list` para o backend).

Se estiver rodando o backend direto (sem Nginx):
- **Base URL:** `http://localhost:3000`

## 🔐 Autenticação

A maioria das rotas (exceto `/auth/*`) são protegidas.
Você deve enviar o Token JWT obtido no login no cabeçalho da requisição.

**Header:**
```http
Authorization: Bearer <SEU_TOKEN_JWT>
```

---

## 1. Módulo de Autenticação (`AuthController`)
*Prefixo: `/api`*

### Login
*   **Método:** `POST`
*   **Endpoint:** `/auth/login`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "pass": "senha123"
    }
    ```
*   **Retorno:** Objeto com `user` e `token`.

### Registro (Público)
*   **Método:** `POST`
*   **Endpoint:** `/auth/register`
*   **Body:**
    ```json
    {
      "name": "Nome Completo",
      "email": "user@example.com",
      "pass": "senha123"
    }
    ```

### Esqueci Minha Senha
*   **Método:** `POST`
*   **Endpoint:** `/auth/forgot/password`
*   **Body:**
    ```json
    { "email": "user@example.com" }
    ```

### Redefinir Senha
*   **Método:** `POST`
*   **Endpoint:** `/auth/reset/password`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "code": "CODIGO_RECEBIDO_EMAIL",
      "newPassword": "nova_senha",
      "emailToken": "TOKEN_JWT_DO_EMAIL"
    }
    ```

---

## 2. Módulo Administrativo (`AdmController`)
*Prefixo: `/api` | Requer: Token de Super Admin*

### Listar Todos os Usuários
*   **Método:** `GET`
*   **Endpoint:** `/adm/list/all/:admEmail`
*   **Nota:** O `:admEmail` é um parâmetro na URL, mas a validação real é feita pelo Token do usuário logado.

### Desativar Usuário
*   **Método:** `PATCH`
*   **Endpoint:** `/adm/deactivate/user`
*   **Body:**
    ```json
    { "email": "usuario_para_desativar@example.com" }
    ```

---

## 3. Módulo de Usuário e Família (`UserController`)
*Rotas protegidas. Exigem Header Authorization.*

### 👤 Pessoa de Referência (Reference Person)

#### Criar Pessoa de Referência
*   **Método:** `POST`
*   **Endpoint:** `/create/reference/person`
*   **Body (Exemplo):**
    ```json
    {
      "fullName": "João da Silva",
      "socialName": "João",
      "motherName": "Maria da Silva",
      "cpf": "123.456.789-00",
      "rgNumber": "1234567",
      "rgUf": "SP",
      "rgIssue": "SSP",
      "rgDateIssue": "2010-01-01",
      "birthDate": "01/01/1980",
      "biologicalGender": "Masculino",
      "diagnosis": "Diagnóstico X",
      "isShelter": false,
      "localLocalization": "URBAN",
      "adress": "Rua Exemplo",
      "adressNumber": "100",
      "adressComplement": "Apto 1",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "phone": "11999999999",
      "whoIsObservingId": "ID_DO_USUARIO_LOGADO"
    }
    ```

#### Listar Todas Pessoas de Referência
*   **Método:** `GET`
*   **Endpoint:** `/list/reference/person`

#### Listar Pessoa Específica
*   **Método:** `GET`
*   **Endpoint:** `/list/reference/person/:id`

#### Adicionar Observação
*   **Método:** `POST`
*   **Endpoint:** `/create/reference/person/observation`
*   **Body:**
    ```json
    {
      "referencePersonId": "ID_DA_PESSOA",
      "observation": "Texto da observação",
      "whoIsObservingId": "ID_DO_USUARIO"
    }
    ```

---

### 👨‍👩‍👧 Composição Familiar (Family Composition)

#### Criar Membro da Família
*   **Método:** `POST`
*   **Endpoint:** `/create/family/person`
*   **Body:**
    ```json
    {
      "fullname": "Filho da Silva",
      "birthDate": "10/10/2015",
      "biologicalGender": "Masculino",
      "kinship": 3, // Grau de parentesco (enum/número)
      "personWithDisabilities": false,
      "familyPersonId": "ID_DA_COMPOSICAO_FAMILIAR" 
    }
    ```

#### Adicionar Observação à Família
*   **Método:** `POST`
*   **Endpoint:** `/create/family/composition/observation`
*   **Body:**
    ```json
    {
      "familyCompositionID": "ID_DA_FAMILIA",
      "observation": "Texto",
      "whoIsObservingId": "ID_USUARIO"
    }
    ```

---

### 🏠 Condições Habitacionais (Home Conditions)

#### Criar/Atualizar Condições
*   **Método:** `POST`
*   **Endpoint:** `/create/home/conditions`
*   **Body:**
    ```json
    {
      "homeConditionsId": "ID_HOME_CONDITIONS",
      "typeResidence": "Casa",
      "materialOfExternalWalls": "Alvenaria",
      "hasAcessEnergy": "Sim",
      "waterSupply": "Rede Pública",
      "sewageDisposal": "Rede Pública",
      "garbageCollection": "Coletada",
      "hasWasteCollection": true,
      "homeConditionIsInRiskArea": false,
      "difficultyToAccessHome": false,
      "hasHomeInsurance": false,
      "hasHomeInsuranceValue": 0,
      "numberOfRooms": 5,
      "numberOfBedrooms": 2,
      "numberOfPeapleInBedrooms": 4
    }
    ```

---

### 🏥 Condições de Saúde (Health Condition)

#### Criar Registro de Saúde
*   **Método:** `POST`
*   **Endpoint:** `/create/health/condition`
*   **Body Resumido:**
    ```json
    {
      "helphyConditionId": "ID",
      "hasFamilyMemberNeedsConstantCare": false,
      "hasFamilyMemberNeedsConstantCareList": [],
      "hasFamilyMemberUsesControlledMedication": true,
      "hasFamilyMemberUsesControlledMedicationList": [{"name": "João", "complement": "Remédio X"}],
      "familyCompositionID": "ID_FAMILIA",
      "personId": "ID_PESSOA",
      ...outros campos booleanos e listas
    }
    ```

---

### 💼 Condições de Trabalho (Work Condition)

#### Criar Registro de Trabalho
*   **Método:** `POST`
*   **Endpoint:** `/create/work/condition`
*   **Body:**
    ```json
    {
      "workConditionId": "ID",
      "familyCompositionID": "ID_FAMILIA",
      "personId": "ID_PESSOA",
      "hasSocialIncome": true,
      "familyIncome": 2000,
      "hasWorkCard": true,
      "workConditionBody": "Empregado",
      "workValue": 1500
      ...outros campos de renda
    }
    ```

---

### ⚠️ Situações de Violência

#### Registrar Situação
*   **Método:** `POST`
*   **Endpoint:** `/create/violence/situation`
*   **Body:**
    ```json
    {
      "violenceId": "ID",
      "childLabel": false,
      "childLabelOcurrentNow": false,
      "physicalAbuse": true,
      "physicalAbuseNow": false,
      "otherName": "Outra situação",
      "otherBool": true,
      "otherNow": true
      ...outros tipos de violência
    }
    ```

#### Observação de Violência
*   **Método:** `POST`
*   **Endpoint:** `/create/violence/situation/observation`

---

### 🏫 Medidas Socioeducativas

#### Criar Histórico
*   **Método:** `POST`
*   **Endpoint:** `/create/history/socio/educational/measures`
*   **Body:**
    ```json
    {
      "createFamilyHistoryOfComplianseSocioEducationalMensureId": "ID",
      "laOrPSCInfomation": true,
      "dateInitJson": "2023-01-01",
      "dateOfFinishJson": "2023-06-01",
      "numberOfProcess": "123456",
      "anotationsOfPersons": "Anotações..."
    }
    ```

---

### 👥 Criação de Usuários Internos

#### Criar Novo Admin (Requer Super Admin)
*   **Método:** `POST`
*   **Endpoint:** `/create/adm`
*   **Body:**
    ```json
    {
      "email": "novo_admin@email.com",
      "fullName": "Nome Admin",
      "admEmail": "EMAIL_DO_SUPER_ADMIN_LOGADO"
    }
    ```

#### Criar Novo Técnico/Usuário
*   **Método:** `POST`
*   **Endpoint:** `/create/user`
*   **Body:**
    ```json
    {
      "admEmail": "EMAIL_DO_ADMIN_CRIADOR",
      "email": "tecnico@email.com",
      "fullName": "Nome Técnico",
      "crm": "12345"
    }
    ```
