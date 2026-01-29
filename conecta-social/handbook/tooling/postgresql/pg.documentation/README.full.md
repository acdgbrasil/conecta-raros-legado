# PostgreSQL 18.1 - Documentacao Setorizada
Esta pasta organiza o conteudo do `pg.documentation.md` em capitulos separados para leitura e consulta rapida.
Arquivos principais:
- `00-front-matter.md` (legal, tabela de conteudos, prefacio)
- `chapters/` (capitulos completos, separados por tema)
- `chapter-summaries.md` (resumo curto por capitulo)

## Leitura prioritaria para agentes de IA
Ordem sugerida para resolver tarefas do dia a dia:
- Fundamentos e SQL basico: `chapters/tutorial-sql/chapter-01-getting-started.md`, `chapters/tutorial-sql/chapter-02-the-sql-language.md`, `chapters/tutorial-sql/chapter-03-advanced-features.md`, `chapters/tutorial-sql/chapter-04-sql-syntax.md`, `chapters/tutorial-sql/chapter-05-data-definition.md`, `chapters/tutorial-sql/chapter-06-data-manipulation.md`, `chapters/tutorial-sql/chapter-07-queries.md`
- Tipos, funcoes e indexes: `chapters/tutorial-sql/chapter-08-data-types.md`, `chapters/tutorial-sql/chapter-09-functions-and-operators.md`, `chapters/tutorial-sql/chapter-10-type-conversion.md`, `chapters/tutorial-sql/chapter-11-indexes.md`, `chapters/tutorial-sql/chapter-12-full-text-search.md`
- Concorrencia e performance: `chapters/concurrency-performance-planner/chapter-13-concurrency-control.md`, `chapters/concurrency-performance-planner/chapter-14-performance-tips.md`, `chapters/concurrency-performance-planner/chapter-15-parallel-query.md`, `chapters/concurrency-performance-planner/chapter-30-just-in-time-compilation-jit.md`, `chapters/concurrency-performance-planner/chapter-69-how-the-planner-uses-statistics.md`
- Instalacao e configuracao: `chapters/install-operation-config/chapter-16-installation-from-binaries.md`, `chapters/install-operation-config/chapter-17-installation-from-source-code.md`, `chapters/install-operation-config/chapter-18-server-setup-and-operation.md`, `chapters/install-operation-config/chapter-19-server-configuration.md`
- Seguranca e acesso: `chapters/install-operation-config/chapter-20-client-authentication.md`, `chapters/install-operation-config/chapter-21-database-roles.md`, `chapters/install-operation-config/chapter-22-managing-databases.md`
- Manutencao e confiabilidade: `chapters/maintenance-backup-reliability/chapter-23-localization.md`, `chapters/maintenance-backup-reliability/chapter-24-routine-database-maintenance-tasks.md`, `chapters/maintenance-backup-reliability/chapter-25-backup-and-restore.md`, `chapters/maintenance-backup-reliability/chapter-27-monitoring-database-activity.md`, `chapters/maintenance-backup-reliability/chapter-28-reliability-and-the-write-ahead-log.md`, `chapters/maintenance-backup-reliability/chapter-31-regression-tests.md`, `chapters/maintenance-backup-reliability/chapter-70-backup-manifest-format.md`
- Alta disponibilidade e replicacao: `chapters/replication-ha/chapter-26-high-availability-load-balancing-and-replication.md`, `chapters/replication-ha/chapter-29-logical-replication.md`, `chapters/replication-ha/chapter-47-logical-decoding.md`, `chapters/replication-ha/chapter-48-replication-progress-tracking.md`, `chapters/replication-ha/chapter-49-archive-modules.md`, `chapters/replication-ha/chapter-50-oauth-validator-modules.md`
- Interfaces e programacao: `chapters/client-tools-apis/chapter-32-libpq-c-library.md`, `chapters/client-tools-apis/chapter-33-large-objects.md`, `chapters/client-tools-apis/chapter-34-ecpg-embedded-sql-in-c.md`, `chapters/sql-advanced-extensibility/chapter-35-the-information-schema.md`, `chapters/sql-advanced-extensibility/chapter-36-extending-sql.md`, `chapters/sql-advanced-extensibility/chapter-37-triggers.md`, `chapters/sql-advanced-extensibility/chapter-38-event-triggers.md`, `chapters/sql-advanced-extensibility/chapter-39-the-rule-system.md`, `chapters/sql-advanced-extensibility/chapter-40-procedural-languages.md`, `chapters/sql-advanced-extensibility/chapter-41-pl-pgsql-sql-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-42-pl-tcl-tcl-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-43-pl-perl-perl-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-44-pl-python-python-procedural-language.md`, `chapters/client-tools-apis/chapter-45-server-programming-interface.md`, `chapters/sql-advanced-extensibility/chapter-46-background-worker-processes.md`
- Extensoes e internals: `chapters/internals-storage/chapter-51-overview-of-postgresql-internals.md`, `chapters/internals-storage/chapter-52-system-catalogs.md`, `chapters/internals-storage/chapter-53-system-views.md`, `chapters/client-tools-apis/chapter-54-frontend-backend-protocol.md`, `chapters/internals-storage/chapter-55-postgresql-coding-conventions.md`, `chapters/internals-storage/chapter-56-native-language-support.md`, `chapters/sql-advanced-extensibility/chapter-57-writing-a-procedural-language-handler.md`, `chapters/sql-advanced-extensibility/chapter-58-writing-a-foreign-data-wrapper.md`, `chapters/sql-advanced-extensibility/chapter-59-writing-a-table-sampling-method.md`, `chapters/sql-advanced-extensibility/chapter-60-writing-a-custom-scan-provider.md`, `chapters/sql-advanced-extensibility/chapter-61-genetic-query-optimizer.md`, `chapters/sql-advanced-extensibility/chapter-62-table-access-method-interface-definition.md`, `chapters/sql-advanced-extensibility/chapter-63-index-access-method-interface-definition.md`, `chapters/sql-advanced-extensibility/chapter-64-write-ahead-logging-for-extensions.md`, `chapters/sql-advanced-extensibility/chapter-65-built-in-index-access-methods.md`, `chapters/internals-storage/chapter-66-database-physical-storage.md`, `chapters/internals-storage/chapter-67-transaction-processing.md`, `chapters/internals-storage/chapter-68-system-catalog-declarations-and-initial-contents.md`

## Mapa por topicos
- Tutorial e SQL: `chapters/tutorial-sql/chapter-01-getting-started.md`, `chapters/tutorial-sql/chapter-02-the-sql-language.md`, `chapters/tutorial-sql/chapter-03-advanced-features.md`, `chapters/tutorial-sql/chapter-04-sql-syntax.md`, `chapters/tutorial-sql/chapter-05-data-definition.md`, `chapters/tutorial-sql/chapter-06-data-manipulation.md`, `chapters/tutorial-sql/chapter-07-queries.md`, `chapters/tutorial-sql/chapter-08-data-types.md`, `chapters/tutorial-sql/chapter-09-functions-and-operators.md`, `chapters/tutorial-sql/chapter-10-type-conversion.md`, `chapters/tutorial-sql/chapter-11-indexes.md`, `chapters/tutorial-sql/chapter-12-full-text-search.md`
- Concorrencia, performance e planner: `chapters/concurrency-performance-planner/chapter-13-concurrency-control.md`, `chapters/concurrency-performance-planner/chapter-14-performance-tips.md`, `chapters/concurrency-performance-planner/chapter-15-parallel-query.md`, `chapters/concurrency-performance-planner/chapter-30-just-in-time-compilation-jit.md`, `chapters/concurrency-performance-planner/chapter-69-how-the-planner-uses-statistics.md`
- Instalacao, operacao e configuracao: `chapters/install-operation-config/chapter-16-installation-from-binaries.md`, `chapters/install-operation-config/chapter-17-installation-from-source-code.md`, `chapters/install-operation-config/chapter-18-server-setup-and-operation.md`, `chapters/install-operation-config/chapter-19-server-configuration.md`, `chapters/install-operation-config/chapter-20-client-authentication.md`, `chapters/install-operation-config/chapter-21-database-roles.md`, `chapters/install-operation-config/chapter-22-managing-databases.md`
- Manutencao, backup e confiabilidade: `chapters/maintenance-backup-reliability/chapter-23-localization.md`, `chapters/maintenance-backup-reliability/chapter-24-routine-database-maintenance-tasks.md`, `chapters/maintenance-backup-reliability/chapter-25-backup-and-restore.md`, `chapters/maintenance-backup-reliability/chapter-27-monitoring-database-activity.md`, `chapters/maintenance-backup-reliability/chapter-28-reliability-and-the-write-ahead-log.md`, `chapters/maintenance-backup-reliability/chapter-31-regression-tests.md`, `chapters/maintenance-backup-reliability/chapter-70-backup-manifest-format.md`
- Replicacao e alta disponibilidade: `chapters/replication-ha/chapter-26-high-availability-load-balancing-and-replication.md`, `chapters/replication-ha/chapter-29-logical-replication.md`, `chapters/replication-ha/chapter-47-logical-decoding.md`, `chapters/replication-ha/chapter-48-replication-progress-tracking.md`, `chapters/replication-ha/chapter-49-archive-modules.md`, `chapters/replication-ha/chapter-50-oauth-validator-modules.md`
- Ferramentas cliente e APIs: `chapters/client-tools-apis/chapter-32-libpq-c-library.md`, `chapters/client-tools-apis/chapter-33-large-objects.md`, `chapters/client-tools-apis/chapter-34-ecpg-embedded-sql-in-c.md`, `chapters/client-tools-apis/chapter-45-server-programming-interface.md`, `chapters/client-tools-apis/chapter-54-frontend-backend-protocol.md`
- SQL avancado e extensibilidade: `chapters/sql-advanced-extensibility/chapter-35-the-information-schema.md`, `chapters/sql-advanced-extensibility/chapter-36-extending-sql.md`, `chapters/sql-advanced-extensibility/chapter-37-triggers.md`, `chapters/sql-advanced-extensibility/chapter-38-event-triggers.md`, `chapters/sql-advanced-extensibility/chapter-39-the-rule-system.md`, `chapters/sql-advanced-extensibility/chapter-40-procedural-languages.md`, `chapters/sql-advanced-extensibility/chapter-41-pl-pgsql-sql-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-42-pl-tcl-tcl-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-43-pl-perl-perl-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-44-pl-python-python-procedural-language.md`, `chapters/sql-advanced-extensibility/chapter-46-background-worker-processes.md`, `chapters/sql-advanced-extensibility/chapter-57-writing-a-procedural-language-handler.md`, `chapters/sql-advanced-extensibility/chapter-58-writing-a-foreign-data-wrapper.md`, `chapters/sql-advanced-extensibility/chapter-59-writing-a-table-sampling-method.md`, `chapters/sql-advanced-extensibility/chapter-60-writing-a-custom-scan-provider.md`, `chapters/sql-advanced-extensibility/chapter-61-genetic-query-optimizer.md`, `chapters/sql-advanced-extensibility/chapter-62-table-access-method-interface-definition.md`, `chapters/sql-advanced-extensibility/chapter-63-index-access-method-interface-definition.md`, `chapters/sql-advanced-extensibility/chapter-64-write-ahead-logging-for-extensions.md`, `chapters/sql-advanced-extensibility/chapter-65-built-in-index-access-methods.md`
- Internals e storage: `chapters/internals-storage/chapter-51-overview-of-postgresql-internals.md`, `chapters/internals-storage/chapter-52-system-catalogs.md`, `chapters/internals-storage/chapter-53-system-views.md`, `chapters/internals-storage/chapter-55-postgresql-coding-conventions.md`, `chapters/internals-storage/chapter-56-native-language-support.md`, `chapters/internals-storage/chapter-66-database-physical-storage.md`, `chapters/internals-storage/chapter-67-transaction-processing.md`, `chapters/internals-storage/chapter-68-system-catalog-declarations-and-initial-contents.md`

## Indice completo (capitulos)
- 01. Getting Started: `chapters/tutorial-sql/chapter-01-getting-started.md`
- 02. The SQL Language: `chapters/tutorial-sql/chapter-02-the-sql-language.md`
- 03. Advanced Features: `chapters/tutorial-sql/chapter-03-advanced-features.md`
- 04. SQL Syntax: `chapters/tutorial-sql/chapter-04-sql-syntax.md`
- 05. Data Definition: `chapters/tutorial-sql/chapter-05-data-definition.md`
- 06. Data Manipulation: `chapters/tutorial-sql/chapter-06-data-manipulation.md`
- 07. Queries: `chapters/tutorial-sql/chapter-07-queries.md`
- 08. Data Types: `chapters/tutorial-sql/chapter-08-data-types.md`
- 09. Functions and Operators: `chapters/tutorial-sql/chapter-09-functions-and-operators.md`
- 10. Type Conversion: `chapters/tutorial-sql/chapter-10-type-conversion.md`
- 11. Indexes: `chapters/tutorial-sql/chapter-11-indexes.md`
- 12. Full Text Search: `chapters/tutorial-sql/chapter-12-full-text-search.md`
- 13. Concurrency Control: `chapters/concurrency-performance-planner/chapter-13-concurrency-control.md`
- 14. Performance Tips: `chapters/concurrency-performance-planner/chapter-14-performance-tips.md`
- 15. Parallel Query: `chapters/concurrency-performance-planner/chapter-15-parallel-query.md`
- 16. Installation from Binaries: `chapters/install-operation-config/chapter-16-installation-from-binaries.md`
- 17. Installation from Source Code: `chapters/install-operation-config/chapter-17-installation-from-source-code.md`
- 18. Server Setup and Operation: `chapters/install-operation-config/chapter-18-server-setup-and-operation.md`
- 19. Server Configuration: `chapters/install-operation-config/chapter-19-server-configuration.md`
- 20. Client Authentication: `chapters/install-operation-config/chapter-20-client-authentication.md`
- 21. Database Roles: `chapters/install-operation-config/chapter-21-database-roles.md`
- 22. Managing Databases: `chapters/install-operation-config/chapter-22-managing-databases.md`
- 23. Localization: `chapters/maintenance-backup-reliability/chapter-23-localization.md`
- 24. Routine Database Maintenance Tasks: `chapters/maintenance-backup-reliability/chapter-24-routine-database-maintenance-tasks.md`
- 25. Backup and Restore: `chapters/maintenance-backup-reliability/chapter-25-backup-and-restore.md`
- 26. High Availability, Load Balancing, and Replication: `chapters/replication-ha/chapter-26-high-availability-load-balancing-and-replication.md`
- 27. Monitoring Database Activity: `chapters/maintenance-backup-reliability/chapter-27-monitoring-database-activity.md`
- 28. Reliability and the Write-Ahead Log: `chapters/maintenance-backup-reliability/chapter-28-reliability-and-the-write-ahead-log.md`
- 29. Logical Replication: `chapters/replication-ha/chapter-29-logical-replication.md`
- 30. Just-in-Time Compilation (JIT): `chapters/concurrency-performance-planner/chapter-30-just-in-time-compilation-jit.md`
- 31. Regression Tests: `chapters/maintenance-backup-reliability/chapter-31-regression-tests.md`
- 32. libpq - C Library: `chapters/client-tools-apis/chapter-32-libpq-c-library.md`
- 33. Large Objects: `chapters/client-tools-apis/chapter-33-large-objects.md`
- 34. ECPG - Embedded SQL in C: `chapters/client-tools-apis/chapter-34-ecpg-embedded-sql-in-c.md`
- 35. The Information Schema: `chapters/sql-advanced-extensibility/chapter-35-the-information-schema.md`
- 36. Extending SQL: `chapters/sql-advanced-extensibility/chapter-36-extending-sql.md`
- 37. Triggers: `chapters/sql-advanced-extensibility/chapter-37-triggers.md`
- 38. Event Triggers: `chapters/sql-advanced-extensibility/chapter-38-event-triggers.md`
- 39. The Rule System: `chapters/sql-advanced-extensibility/chapter-39-the-rule-system.md`
- 40. Procedural Languages: `chapters/sql-advanced-extensibility/chapter-40-procedural-languages.md`
- 41. PL/pgSQL - SQL Procedural Language: `chapters/sql-advanced-extensibility/chapter-41-pl-pgsql-sql-procedural-language.md`
- 42. PL/Tcl - Tcl Procedural Language: `chapters/sql-advanced-extensibility/chapter-42-pl-tcl-tcl-procedural-language.md`
- 43. PL/Perl - Perl Procedural Language: `chapters/sql-advanced-extensibility/chapter-43-pl-perl-perl-procedural-language.md`
- 44. PL/Python - Python Procedural Language: `chapters/sql-advanced-extensibility/chapter-44-pl-python-python-procedural-language.md`
- 45. Server Programming Interface: `chapters/client-tools-apis/chapter-45-server-programming-interface.md`
- 46. Background Worker Processes: `chapters/sql-advanced-extensibility/chapter-46-background-worker-processes.md`
- 47. Logical Decoding: `chapters/replication-ha/chapter-47-logical-decoding.md`
- 48. Replication Progress Tracking: `chapters/replication-ha/chapter-48-replication-progress-tracking.md`
- 49. Archive Modules: `chapters/replication-ha/chapter-49-archive-modules.md`
- 50. OAuth Validator Modules: `chapters/replication-ha/chapter-50-oauth-validator-modules.md`
- 51. Overview of PostgreSQL Internals: `chapters/internals-storage/chapter-51-overview-of-postgresql-internals.md`
- 52. System Catalogs: `chapters/internals-storage/chapter-52-system-catalogs.md`
- 53. System Views: `chapters/internals-storage/chapter-53-system-views.md`
- 54. Frontend/Backend Protocol: `chapters/client-tools-apis/chapter-54-frontend-backend-protocol.md`
- 55. PostgreSQL Coding Conventions: `chapters/internals-storage/chapter-55-postgresql-coding-conventions.md`
- 56. Native Language Support: `chapters/internals-storage/chapter-56-native-language-support.md`
- 57. Writing a Procedural Language Handler: `chapters/sql-advanced-extensibility/chapter-57-writing-a-procedural-language-handler.md`
- 58. Writing a Foreign Data Wrapper: `chapters/sql-advanced-extensibility/chapter-58-writing-a-foreign-data-wrapper.md`
- 59. Writing a Table Sampling Method: `chapters/sql-advanced-extensibility/chapter-59-writing-a-table-sampling-method.md`
- 60. Writing a Custom Scan Provider: `chapters/sql-advanced-extensibility/chapter-60-writing-a-custom-scan-provider.md`
- 61. Genetic Query Optimizer: `chapters/sql-advanced-extensibility/chapter-61-genetic-query-optimizer.md`
- 62. Table Access Method Interface Definition: `chapters/sql-advanced-extensibility/chapter-62-table-access-method-interface-definition.md`
- 63. Index Access Method Interface Definition: `chapters/sql-advanced-extensibility/chapter-63-index-access-method-interface-definition.md`
- 64. Write Ahead Logging for Extensions: `chapters/sql-advanced-extensibility/chapter-64-write-ahead-logging-for-extensions.md`
- 65. Built-in Index Access Methods: `chapters/sql-advanced-extensibility/chapter-65-built-in-index-access-methods.md`
- 66. Database Physical Storage: `chapters/internals-storage/chapter-66-database-physical-storage.md`
- 67. Transaction Processing: `chapters/internals-storage/chapter-67-transaction-processing.md`
- 68. System Catalog Declarations and Initial Contents: `chapters/internals-storage/chapter-68-system-catalog-declarations-and-initial-contents.md`
- 69. How the Planner Uses Statistics: `chapters/concurrency-performance-planner/chapter-69-how-the-planner-uses-statistics.md`
- 70. Backup Manifest Format: `chapters/maintenance-backup-reliability/chapter-70-backup-manifest-format.md`
