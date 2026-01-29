Perfeito. Vamos destilar as **Regras de Negócio (Business Rules)**.

No DDD, gostamos de chamar muitas dessas regras de **Invariantes** (verdades que nunca podem ser violadas dentro de uma transação) e **Políticas** (regras de processo).

Vou dividir por Contexto/Agregado para ficar organizado.

---

### 1. Contexto: Gestão de Acesso (Roles & Permissions)

Aqui é onde garantimos a integridade da segurança. O princípio chave é: **"Não quebre o sistema e não permita elevação indevida."**

#### A. Regras de Imutabilidade do Sistema

1. **Proteção de Cargos de Sistema (`System Role Integrity`):**
* Uma Role com `is_system = true` **nunca** pode ter seu `name` alterado.
* Uma Role com `is_system = true` **nunca** pode ser deletada.
* Uma Role com `is_system = true` **nunca** pode ter permissões removidas (pode receber novas, se o código evoluir, mas não perder as vitais).
* *Porquê:* Evita que um admin acidentalmente apague o cargo "SuperAdmin" e tranque todos para fora.



#### B. Regras de Gerenciamento de Cargos Customizados

2. **Unicidade de Nome (`Role Name Uniqueness`):**
* Não podem existir dois cargos com o mesmo nome (case insensitive). Ex: "Financeiro" e "financeiro" são conflitantes.
* *Porquê:* Evita confusão na atribuição de cargos.


3. **Integridade Referencial Lógica (`Role In Use Protection`):**
* Uma Role **não pode ser excluída** se houver pelo menos um usuário `ativo` (is_active=true) associado a ela.
* *Solução:* O Admin deve primeiro mover os usuários para outro cargo antes de deletar o antigo.


4. **Anti-Escalonamento de Privilégio (`Anti-Privilege Escalation`):**
* **Regra de Ouro:** Um usuário só pode criar ou editar uma Role contendo permissões que **ele mesmo possui**.
* *Exemplo:* Se eu sou "Gerente" e tenho `users:read`, não posso criar um cargo "SuperGerente" com `users:delete`, atribuir a mim mesmo e ganhar superpoderes.



---

### 2. Contexto: Identidade do Usuário (Users)

Aqui focamos no ciclo de vida e identidade.

#### A. Cadastro e Identidade

5. **Unicidade de Credencial (`Unique Email`):**
* O e-mail deve ser único em toda a base ativa e inativa.


6. **Vínculo com Pessoa (`Golden Record Requirement`):**
* Todo usuário **deve** estar vinculado a um `person_id` (Golden Record).
* Se o `person_id` não existir no serviço de origem (ex: RH ou CRM), o usuário não pode ser criado.


7. **Proteção do Último Admin (`Last Admin Standing`):**
* O sistema não pode permitir a desativação (`is_active = false`) ou a mudança de cargo do **último** usuário ativo que possui a Role `SuperAdmin`.
* *Porquê:* Evita o "auto-lockout" (trancar a chave dentro do carro).



#### B. Segurança de Credenciais

8. **Política de Troca de Senha (`Password Rotation Policy`):**
* Se `force_change_password` for `true`, o usuário **não pode** realizar nenhuma ação no sistema (exceto `logout`) antes de chamar o endpoint de `changePassword`.
* A nova senha não pode ser igual à senha atual.


9. **Imutabilidade do Log de Auditoria (`Audit Traceability`):**
* Usuários nunca são deletados fisicamente do banco (Hard Delete). Eles apenas sofrem Soft Delete (`is_active = false`).
* Isso garante que o histórico na tabela `AuditLogs` (que aponta para `user_id`) nunca fique com referências quebradas (orphan records).



---

### 3. Contexto: Autenticação (Auth & Sessions)

Regras voláteis sobre tokens e acesso imediato.

10. **Revogação em Cascata (`Session Kill Switch`):**
* Sempre que um usuário alterar sua senha, **todos** os `RefreshTokens` ativos daquele usuário devem ser revogados (`is_revoked = true`) imediatamente.
* Sempre que um usuário for desativado (`is_active = false`) ou tiver seu cargo alterado, todos os tokens devem ser revogados.
* *Porquê:* Garante que sessões antigas não continuem operando com permissões velhas ou senhas comprometidas.


11. **Rotação de Refresh Token (`Refresh Token Rotation`):**
* Um Refresh Token só pode ser usado **uma vez**. Ao usar um RT para pegar um novo Access Token, o sistema deve devolver também um **novo** Refresh Token e invalidar o anterior.
* *Segurança:* Se o RT antigo for reutilizado (tentativa de replay attack), o sistema deve identificar isso e invalidar **toda a cadeia** de tokens daquela família (deslogar o usuário de todos os dispositivos).



---

### 4. Contexto: Convites (Invites)

12. **Blindagem do Convite (`Invite Binding`):**
* O token do convite é atrelado estritamente ao e-mail convidado.
* Se eu convidei `joao@empresa.com`, o registro desse usuário só pode ser finalizado se o e-mail confirmado for `joao@empresa.com`.
* *Porquê:* Impede que João encaminhe o link para Maria e ela crie uma conta no lugar dele.


13. **Idempotência de Aceite:**
* Um convite não pode ser aceito duas vezes. Após o primeiro sucesso, o status muda para `accepted` e tentativas futuras falham.


14. **Expiração:**
* Convites vencidos não podem ser reativados. Devem ser recriados (novo registro, novo token).



---

### Resumo para Implementação

Se fosses transformar isso em **Use Cases** ou **Services**, teríamos algo como:

* `CreateRoleUseCase`: Valida nome único + Permissões contidas no autor.
* `DeleteRoleUseCase`: Valida se é sistema + se tem usuários ativos.
* `RegisterUserUseCase` (via Invite): Valida token + email match + expiração.
* `RotateCredentialsUseCase`: Troca senha + invalida sessões.



Isso muda o jogo e torna o sistema muito mais flexível (e poderoso). Saímos de um RBAC estático (hardcoded) para um **RBAC Dinâmico**.

Nesse cenário, a entidade `Role` deixa de ser apenas um "dado de referência" (como uma categoria fixa) e se torna um **Agregado de primeira classe**, com ciclo de vida completo (criação, edição, exclusão) gerenciado pelos usuários administradores.

Vamos remodelar pensando que o `Role` é agora uma "caixa vazia" que o `SuperAdmin` preenche com "blocos de permissão" (Lego).

Aqui está a modelagem atualizada para esse cenário:

---

### 1. O Conceito de "System Role" vs "Custom Role"

Para que isso funcione sem quebrar o sistema, precisamos usar aquele campo `is_system` da sua tabela de Roles com inteligência de domínio.

* **System Roles (Imutáveis):** São as roles "nativas" (ex: `SuperAdmin`). O domínio deve **proibir** que qualquer usuário (mesmo outro admin) altere as permissões, mude o nome ou delete essa role. Ela é a garantia de que ninguém vai trancar a porta do sistema por fora.
* **Custom Roles (Mutáveis):** São as roles criadas no dia a dia (ex: "Analista Financeiro", "Editor de Conteúdo"). Essas são totalmente editáveis.

---

### 2. Agregado: Role (Agora Turbinado)

A `Role` passa a ser a "Receita" de acesso.

**Propriedades:**

* `id`: RoleId
* `name`: RoleName (Value Object que garante unicidade — não posso ter dois cargos "Financeiro").
* `isSystem`: boolean (A trava de segurança).
* `permissions`: `Set<PermissionId>` (Uma coleção de IDs das permissões).

**Comportamentos (Regras de Negócio):**

1. **`create(name, description, initialPermissions)`**:
* Fábrica estática. Cria uma nova role com `isSystem = false`.


2. **`updatePermissions(newPermissionsList)`**:
* **Regra:** Se `isSystem == true`, lança uma exceção `ImmutableRoleException`. Não se mexe no SuperAdmin.
* **Regra:** Substitui a lista atual pela nova.


3. **`rename(newName)`**:
* **Regra:** Se `isSystem == true`, bloqueia.


4. **`delete()`**:
* **Regra:** Se `isSystem == true`, bloqueia.
* **Regra de Integridade:** O domínio deve checar (via um *Domain Service*) se existem usuários ativos usando essa Role. Se houver, proíbe a deleção. "Não posso apagar o cargo 'Vendedor' se ainda existem vendedores ativos".



---

### 3. Agregado: Permission (O Catálogo)

Como as roles são criadas dinamicamente, as **Permissões** viram o "cardápio" do sistema. O usuário Admin vai olhar para o sistema e ver uma lista de capacidades disponíveis.

**Natureza:**
Aqui, a `Permission` funciona quase como um Value Object que é persistido. Elas raramente mudam em tempo de execução (geralmente mudam quando o desenvolvedor sobe uma nova funcionalidade no código).

* **Identidade:** O `slug` (ex: `users:create`, `reports:view`) é a alma do negócio.
* **Contexto:** É interessante modelar o conceito de "Grupo de Permissões" (apenas visualmente ou no domínio) para que, na hora de criar uma Role, o Admin não veja uma lista linguiça de 200 itens, mas veja:
* *Módulo Usuários:* [Criar] [Editar] [Deletar]
* *Módulo Financeiro:* [Visualizar] [Exportar]



---

### 4. Domain Service: RoleManager (O Orquestrador)

Como criar roles envolve olhar para outras partes (permissões existentes, unicidade de nome), podemos ter um serviço de domínio.

**Responsabilidade:**

* Garantir que não estou criando uma role com permissões que não existem.
* Garantir a segurança da "Escalada de Privilégio" (Privilege Escalation).

**O Problema da Escalada de Privilégio:**
Se eu sou um "Gerente" e posso criar Roles, eu não deveria poder criar uma Role "SuperAdmin 2.0" que tenha mais poderes do que eu mesmo tenho.

* *Regra de Ouro:* Um usuário só pode adicionar a uma nova Role as permissões que **ele mesmo possui**.

---

### 5. Fluxo de Uso (Exemplo Abstrato)

Imagine o `SuperAdmin` configurando o sistema para um novo setor:

1. **Cenário:** Chegou o setor de "Suporte Nível 1".
2. **Ação:** O `SuperAdmin` chama o método `Role.create("Suporte N1")`.
3. **Seleção:** O sistema lista todas as `Permissions` disponíveis.
4. **Composição:** O `SuperAdmin` seleciona: `users:read`, `users:reset_password`, `audit:read`.
5. **Persistência:** O Agregado `Role` ("Suporte N1") é salvo com esses 3 IDs de permissão.
6. **Atribuição:** O `SuperAdmin` cria o usuário "João" e atribui a `RoleId` do "Suporte N1" para ele.

### Resumo Visual Atualizado

* **Entidade User:** Aponta para um `RoleId`.
* **Entidade Role:** Contém uma lista de `PermissionIds`. É editável, exceto se for a role raiz.
* **Entidade Permission:** É o bloco fundamental, imutável pelo usuário, definido pelo sistema (código).

Essa abordagem te dá flexibilidade total. O "UserAdm" que você mencionou nada mais é do que um Usuário que possui uma Role que contém a permissão `roles:create` e `roles:update`.

Perfeito. Vamos destilar as **Regras de Negócio (Business Rules)**.

No DDD, gostamos de chamar muitas dessas regras de **Invariantes** (verdades que nunca podem ser violadas dentro de uma transação) e **Políticas** (regras de processo).

Vou dividir por Contexto/Agregado para ficar organizado.

---

### 1. Contexto: Gestão de Acesso (Roles & Permissions)

Aqui é onde garantimos a integridade da segurança. O princípio chave é: **"Não quebre o sistema e não permita elevação indevida."**

#### A. Regras de Imutabilidade do Sistema

1. **Proteção de Cargos de Sistema (`System Role Integrity`):**
* Uma Role com `is_system = true` **nunca** pode ter seu `name` alterado.
* Uma Role com `is_system = true` **nunca** pode ser deletada.
* Uma Role com `is_system = true` **nunca** pode ter permissões removidas (pode receber novas, se o código evoluir, mas não perder as vitais).
* *Porquê:* Evita que um admin acidentalmente apague o cargo "SuperAdmin" e tranque todos para fora.



#### B. Regras de Gerenciamento de Cargos Customizados

2. **Unicidade de Nome (`Role Name Uniqueness`):**
* Não podem existir dois cargos com o mesmo nome (case insensitive). Ex: "Financeiro" e "financeiro" são conflitantes.
* *Porquê:* Evita confusão na atribuição de cargos.


3. **Integridade Referencial Lógica (`Role In Use Protection`):**
* Uma Role **não pode ser excluída** se houver pelo menos um usuário `ativo` (is_active=true) associado a ela.
* *Solução:* O Admin deve primeiro mover os usuários para outro cargo antes de deletar o antigo.


4. **Anti-Escalonamento de Privilégio (`Anti-Privilege Escalation`):**
* **Regra de Ouro:** Um usuário só pode criar ou editar uma Role contendo permissões que **ele mesmo possui**.
* *Exemplo:* Se eu sou "Gerente" e tenho `users:read`, não posso criar um cargo "SuperGerente" com `users:delete`, atribuir a mim mesmo e ganhar superpoderes.



---

### 2. Contexto: Identidade do Usuário (Users)

Aqui focamos no ciclo de vida e identidade.

#### A. Cadastro e Identidade

5. **Unicidade de Credencial (`Unique Email`):**
* O e-mail deve ser único em toda a base ativa e inativa.


6. **Vínculo com Pessoa (`Golden Record Requirement`):**
* Todo usuário **deve** estar vinculado a um `person_id` (Golden Record).
* Se o `person_id` não existir no serviço de origem (ex: RH ou CRM), o usuário não pode ser criado.


7. **Proteção do Último Admin (`Last Admin Standing`):**
* O sistema não pode permitir a desativação (`is_active = false`) ou a mudança de cargo do **último** usuário ativo que possui a Role `SuperAdmin`.
* *Porquê:* Evita o "auto-lockout" (trancar a chave dentro do carro).



#### B. Segurança de Credenciais

8. **Política de Troca de Senha (`Password Rotation Policy`):**
* Se `force_change_password` for `true`, o usuário **não pode** realizar nenhuma ação no sistema (exceto `logout`) antes de chamar o endpoint de `changePassword`.
* A nova senha não pode ser igual à senha atual.


9. **Imutabilidade do Log de Auditoria (`Audit Traceability`):**
* Usuários nunca são deletados fisicamente do banco (Hard Delete). Eles apenas sofrem Soft Delete (`is_active = false`).
* Isso garante que o histórico na tabela `AuditLogs` (que aponta para `user_id`) nunca fique com referências quebradas (orphan records).



---

### 3. Contexto: Autenticação (Auth & Sessions)

Regras voláteis sobre tokens e acesso imediato.

10. **Revogação em Cascata (`Session Kill Switch`):**
* Sempre que um usuário alterar sua senha, **todos** os `RefreshTokens` ativos daquele usuário devem ser revogados (`is_revoked = true`) imediatamente.
* Sempre que um usuário for desativado (`is_active = false`) ou tiver seu cargo alterado, todos os tokens devem ser revogados.
* *Porquê:* Garante que sessões antigas não continuem operando com permissões velhas ou senhas comprometidas.


11. **Rotação de Refresh Token (`Refresh Token Rotation`):**
* Um Refresh Token só pode ser usado **uma vez**. Ao usar um RT para pegar um novo Access Token, o sistema deve devolver também um **novo** Refresh Token e invalidar o anterior.
* *Segurança:* Se o RT antigo for reutilizado (tentativa de replay attack), o sistema deve identificar isso e invalidar **toda a cadeia** de tokens daquela família (deslogar o usuário de todos os dispositivos).



---

### 4. Contexto: Convites (Invites)

12. **Blindagem do Convite (`Invite Binding`):**
* O token do convite é atrelado estritamente ao e-mail convidado.
* Se eu convidei `joao@empresa.com`, o registro desse usuário só pode ser finalizado se o e-mail confirmado for `joao@empresa.com`.
* *Porquê:* Impede que João encaminhe o link para Maria e ela crie uma conta no lugar dele.


13. **Idempotência de Aceite:**
* Um convite não pode ser aceito duas vezes. Após o primeiro sucesso, o status muda para `accepted` e tentativas futuras falham.


14. **Expiração:**
* Convites vencidos não podem ser reativados. Devem ser recriados (novo registro, novo token).



---

### Resumo para Implementação

Se fosses transformar isso em **Use Cases** ou **Services**, teríamos algo como:

* `CreateRoleUseCase`: Valida nome único + Permissões contidas no autor.
* `DeleteRoleUseCase`: Valida se é sistema + se tem usuários ativos.
* `RegisterUserUseCase` (via Invite): Valida token + email match + expiração.
* `RotateCredentialsUseCase`: Troca senha + invalida sessões.
