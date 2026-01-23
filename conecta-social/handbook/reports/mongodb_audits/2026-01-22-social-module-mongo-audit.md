# Auditoria de Arquitetura MongoDB - Módulo Social

**Data:** 22 de Janeiro de 2026
**Responsável:** MongoDB Architect Agent
**Escopo:** `src/modules/social/infra/**`

## 1. Resumo Executivo

O módulo Social apresenta uma estrutura inicial funcional, mas **viola princípios críticos de performance, segurança de tipos e integridade de dados** estabelecidos no Handbook.

A principal preocupação é a **falta de índices** (especialmente índices únicos para chaves de negócio como CPF) e o uso excessivo de **`any`**, anulando os benefícios do TypeScript. Além disso, o padrão de "carregar documento pai -> iterar array em memória -> salvar" (visto em `familyCompositionDto.ts`) é um anti-pattern que escala mal e gera condições de corrida.

**Nível de Maturidade:** Baixo (Necessita Refatoração Imediata)

---

## 2. Modelagem & Schema Design

### 2.1. Tipagem e Validação de Schemas
*   **Problema (Crítico):** Falta de índices `unique` no nível do Schema.
    *   *Arquivo:* `referencePersonModel.ts`
    *   *Análise:* O campo `cpf` é tratado como chave de negócio, mas não possui `unique: true`. A validação é feita via código (`findOne` antes de `create`), o que não previne duplicidade em condições de concorrência (race conditions).
    *   *Recomendação:* Adicionar `unique: true` e `index: true` ao campo `cpf`.
*   **Problema (Médio):** Uso de Subdocumentos vs Referências.
    *   *Arquivo:* `familyCompositionModel.ts`
    *   *Análise:* `familyCompositionPerson` é um array de subdocumentos. Para composições familiares, isso é aceitável (cardinalidade baixa), mas deve-se garantir que não cresça indefinidamente.
*   **Problema (Baixo):** Defaults estáticos vs Dinâmicos.
    *   *Arquivo:* `familyAndCommunityModel.ts`
    *   *Análise:* Os defaults de strings (ex: `'CONFLICT_WITH_VIOLENCE'`) estão hardcoded. Deveriam usar Enums importados do domínio para garantir consistência.

### 2.2. Relacionamentos
*   **Observação:** O modelo `ReferencePerson` atua como um "Hub", contendo referências para diversas outras collections (`fistEntryInUnityId`, `familyCompositionId`, etc.).
    *   *Risco:* Isso cria uma alta dependência de `populate` para montar a visão completa da pessoa, o que pode degradar performance.
    *   *Recomendação:* Avaliar desnormalização de dados acessados frequentemente (ex: ter um "resumo" da condição de saúde dentro de ReferencePerson) ou uso de `$lookup` em agregações ao invés de múltiplos `populates`.

---

## 3. Performance & Indexing

### 3.1. Ausência de Índices
*   **Violação Crítica:** Não foram encontrados índices definidos explicitamente para chaves estrangeiras.
    *   *Exemplo:* Em `ReferencePerson`, campos como `familyCompositionId`, `fistEntryInUnityId` serão usados frequentemente para buscar "quem é a pessoa de referência desta família". Sem índice, isso causará *Collection Scans*.
    *   *Ação Obrigatória:* Criar índices para **todas** as chaves estrangeiras (`ref`).

### 3.2. Consultas Ineficientes (Anti-Pattern de Array)
*   **Arquivo:** `src/modules/social/infra/database/mongodb/mongoDtos/familyCompositionDto.ts`
*   **Código Problemático:**
    ```typescript
    const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
    ```
*   **Análise:** O código carrega o documento inteiro da composição familiar para a memória, itera o array via JavaScript para achar a pessoa e depois salva o pai todo.
    *   *Problema:* Consumo desnecessário de memória e I/O. Risco de sobrescrever alterações concorrentes em outras pessoas da mesma família (falta de atomicidade).
*   **Solução Recomendada:** Usar operadores posicionais do MongoDB (`$`) ou `arrayFilters` para atualizar o subdocumento diretamente no banco.
    ```typescript
    // Exemplo de correção
    await familyCompositionModel.updateOne(
      { _id: familyCompositionID, "familyCompositionPerson._id": id },
      { $set: { "familyCompositionPerson.$.educationConditionPerson": educationCondition } }
    );
    ```

### 3.3. Uso de `lean()` e `select()`
*   **Violação:** Nenhuma consulta de leitura (`find`, `findOne`, `findById`) utiliza `.lean()`.
    *   *Impacto:* O Mongoose hidrata documentos completos (com métodos, getters/setters) desnecessariamente para operações de leitura, dobrando ou triplicando o uso de memória e CPU.
    *   *Ação:* Adicionar `.lean()` em todos os métodos `get*` e `list*`.

---

## 4. TypeScript & Type Safety

### 4.1. O Problema do `any`
*   **Violação Severa:** O uso de `any` é sistêmico nos DTOs.
    *   *Arquivo:* `personReferenceDTO.ts`
    *   *Código:* `return referencePersons as any[]` e `(getReferencePerson as any).observations?.push(...)`
    *   *Arquivo:* `familyCompositionDto.ts`
    *   *Código:* `.find((person:any) => ...)`
*   **Consequência:** O TypeScript está silenciado. Se a interface `ReferencePerson` mudar, o compilador não avisará sobre quebras no banco, levando a erros em tempo de execução (`undefined is not a function`).

### 4.2. Tipagem de Modelos Mongoose
*   **Recomendação:** Não usar interfaces de domínio diretamente na definição do Schema do Mongoose se elas não forem 100% compatíveis.
*   **Ação:** Utilizar `InferSchemaType` do Mongoose para gerar os tipos TypeScript diretamente da definição do Schema, garantindo que o tipo em código reflete a realidade do banco.

---

## 5. Qualidade de Código & Tratamento de Erros

### 5.1. Try-Catch Ruidoso
*   **Padrão Repetitivo:**
    ```typescript
    try {
        // ...
    } catch (e) {
        throw e;
    }
    ```
*   **Análise:** Esse padrão adiciona ruído visual e não agrega valor (não loga, não trata, apenas relança). O bloco `try/catch` deve ser removido se não houver tratamento específico, ou movido para uma camada superior (Controller/Use Case).

---

## 6. Plano de Ação (Priorizado)

1.  **Imediato (Segurança e Estabilidade):**
    *   [ ] Adicionar `unique: true` no `cpf` em `referencePersonModel`.
    *   [ ] Remover `any` de `personReferenceDTO.ts` e `familyCompositionDto.ts`. Tipar corretamente os subdocumentos.

2.  **Curto Prazo (Performance):**
    *   [ ] Criar índices para todas as chaves estrangeiras (`*Id`).
    *   [ ] Refatorar atualizações de subdocumentos em `familyCompositionDto` para usar `updateOne` com operador posicional `$` ao invés de lógica em memória.
    *   [ ] Adicionar `.lean()` em todas as queries de leitura.

3.  **Médio Prazo (Manutenibilidade):**
    *   [ ] Remover blocos `try/catch` redundantes.
    *   [ ] Implementar `runValidators: true` em operações de update.
    *   [ ] Padronizar nomes de arquivos (ex: `familyHistoryInstutionalCompletModel.ts` tem um erro de digitação "Instutional").

---
**Assinado:** *MongoDB Architect Agent*