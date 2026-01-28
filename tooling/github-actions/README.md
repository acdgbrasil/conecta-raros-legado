# GitHub Actions Knowledge Base

Esta pasta contém a documentação de referência ("Bíblia") para GitHub Actions.

## Estrutura
- **`handbook_raw.md`**: O arquivo consolidado contendo toda a documentação bruta.
    - *Nota:* Este arquivo é extenso. Utilize `grep` ou leituras parciais para encontrar tópicos específicos.

## Tópicos Chave (Índice Mental)
O arquivo bruto cobre os seguintes domínios:

1.  **Core Concepts:**
    - Workflows, Events, Jobs, Steps, Runners.
    - Contexts (`github`, `env`, `secrets`), Expressions, Variables.
2.  **CI/CD Patterns:**
    - Continuous Integration (Build, Test).
    - Continuous Deployment (Environments, Concurrency).
    - Reusable Workflows (`workflow_call`).
3.  **Infrastructure:**
    - GitHub-hosted Runners vs Self-hosted.
    - Caching Dependencies vs Artifacts.
4.  **Security:**
    - OpenID Connect (OIDC) para AWS, Vault, Google Cloud.
    - Permissions e Secrets Management.
5.  **Extensibility:**
    - Creating Custom Actions (Docker, JS, Composite).
    - Sharing Actions (Private/Public).

## Uso pelo Agente
O agente `GitHub_Actions_Specialist` deve consultar este diretório para validar sintaxe, sugerir padrões de segurança e arquitetar pipelines complexas.
