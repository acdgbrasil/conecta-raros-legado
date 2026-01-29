## Processos de Engenharia

Fluxos operacionais para o desenvolvimento da Conecta Social API.

## Arquiteturas de Referência
- [Servidor ElysiaJS](./architectures/elysia_server_architecture.md): Guia para infraestrutura HTTP e performance nativa.

## Fluxo de Desenvolvimento

1.  **Design**: Criar/Atualizar a documentação no `handbook/domain_questions/` antes de codar.
2.  **TDD**: Escrever o teste unitário do UseCase (RED).
3.  **Implementação**: Escrever o código para passar no teste (GREEN).
4.  **Refactor**: Melhorar e documentar (BLUE).

## Deploy
- O deploy é feito via Docker.
- A imagem deve ser sempre buildada a partir da branch `main`.
