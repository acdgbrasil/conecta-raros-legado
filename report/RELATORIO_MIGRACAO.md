# Relatório de Migração de Lógica: MongoDTOs para DatabaseService

## 1. Objetivo
Analisar a viabilidade e o esforço necessário para refatorar a camada de banco de dados (`src/infra/database/mongodb/mongoDtos/`), movendo a lógica de orquestração para o `DatabaseService.ts`. O objetivo é alinhar o padrão de código com o que já é praticado nas funções de autenticação (ex: `resetPassword`), onde o **Service** é responsável pela regra de negócio/orquestração e o **DTO/Repository** apenas pelas operações atômicas no banco.

## 2. Análise da Situação Atual

### Padrão de Autenticação (`DatabaseService.ts`)
Nas funções de Auth, como `resetPassword`, observamos o seguinte fluxo:
- **DatabaseService**: Contém a lógica de controle. Ele chama `findCode`, verifica o token, valida o email, e então chama `changePassword`.
- **PostgressDTO**: Contém apenas as funções diretas de banco de dados (`findByEmail`, `create`, `changePassword`).

### Padrão Atual dos MongoDTOs
Atualmente, muitos arquivos em `src/infra/database/mongodb/mongoDtos/` contêm **lógica de negócios e orquestração complexa**, não apenas operações de banco.

**Exemplo Crítico:** `personReferenceDTO.ts` -> `createReferencePerson`
Esta função sozinha:
1. Verifica CPF.
2. Cria `FamilyComposition`.
3. Cria `FirstEntryInUnity`.
4. Cria `HomeConditions`.
5. Cria `WorkCondition`.
6. Cria `HealthyCondition`.
7. Cria `FamilyEventlyBenefits`.
8. Cria `FamilyAndCommunity`.
9. Cria `FamilyHistory...`.
10. Cria `FamilySituationViolation`.
11. Finalmente cria `ReferencePerson` ligando tudo.

O `DatabaseService` apenas repassa a chamada:
```typescript
async createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
    const rp = await createReferencePerson(referencePerson) // Toda a lógica está aqui dentro
    return rp
}
```

## 3. Plano de Refatoração

A proposta é "subir" a orquestração para o `DatabaseService` e deixar os DTOs apenas com métodos de criação atômica (CRUD simples).

### O que deve ser movido para o DatabaseService?
Todas as funções que realizam **múltiplas** operações de banco ou validações de regras de negócio complexas.

1.  **createReferencePerson**:
    - **Como é hoje**: O DTO faz tudo.
    - **Como deve ficar**: O `DatabaseService` deve chamar `homeConditionsModel.create`, `familyCompositionModel.create`, etc. (ou wrappers simples nos DTOs), coletar os IDs e salvar a `ReferencePerson`.
    - **Benefício**: Se houver erro na criação de um dos sub-documentos, o Service pode tratar ou fazer rollback (se aplicável/necessário) de forma mais clara.

2.  **Funções de Atualização com Busca (Find + Update)**:
    - Funções como `createFamilyEventlyBenefitsDto` buscam e atualizam. Isso pode permanecer no DTO se for considerado uma operação atômica de "Update", mas se houver lógica condicional (ex: "se mês > 17" em `createPregnant`), essa validação deve estar no Service ou na Entidade, não no DTO.

### Arquivos Impactados

| Arquivo DTO | Complexidade | Ação Recomendada |
| :--- | :--- | :--- |
| `personReferenceDTO.ts` | **Alta** | Extrair toda a criação de sub-documentos para o `DatabaseService`. Transformar o DTO em apenas `createReferencePerson` (salvar o objeto final) e `find`. |
| `familyCompositionDto.ts` | Média | Funções como `createPregnant` têm validação de negócio (`pregnancyMonths > 17`). Mover validação para Service/Entidade. |
| `mongodbDto.ts` | Baixa | Já são funções atômicas (`createCode`, `findCode`). Manter como está. |
| Demais DTOs (`familyAndCommunity`, etc.) | Baixa/Média | A maioria faz `findById` -> `update` -> `save`. Podem ser mantidas como "wrappers" de atualização ou movidas para o Service se quisermos eliminar a camada de DTO completamente. |

## 4. Exemplo de Implementação (Como ficará)

**DatabaseService.ts** (Conceitual):

```typescript
// Importar os Models ou Wrappers Atômicos
import { familyCompositionModel, referencePersonModel, ... } from './mongodb/mongoModels';

async createReferencePerson(rp: ReferencePerson): Promise<ReferencePerson | Error> {
    try {
        // 1. Validação (Lógica no Service)
        const exists = await referencePersonModel.findOne({cpf: rp.cpf});
        if(exists) throw new CustomError('CPF_ALREADY_EXISTS', ...);

        // 2. Orquestração (Criar dependências)
        // Poderia chamar funções auxiliares privadas ou usar os models diretamente
        const familyComp = await familyCompositionModel.create({ isInUse: false, ... });
        const homeCond = await homeConditionsModel.create({ isInUse: false });
        // ... criar os outros 8 documentos ...

        // 3. Persistência Final
        const newRefPerson = await referencePersonModel.create({
            ...rp,
            familyCompositionId: familyComp.id,
            homeConditionsId: homeCond.id,
            // ...
        });

        return newRefPerson;
    } catch (err) {
        throw err;
    }
}
```

## 5. Conclusão

É **totalmente viável** e recomendado passar essas lógicas para o `DatabaseService`.

**Vantagens:**
- **Centralização da Regra de Negócio**: O Service passa a ser a fonte da verdade sobre "como criar uma pessoa de referência", não um arquivo de detalhes de banco de dados.
- **Consistência**: Alinha com o padrão de `auth` (`resetPassword`).
- **Testabilidade**: Facilita testar o fluxo de criação isoladamente dos modelos do Mongoose se usarmos injeção de dependência ou mocks no Service.

**Próximos Passos:**
1. Começar por `createReferencePerson` (o maior gargalo).
2. Refatorar as validações pequenas em `familyCompositionDto`.
