# Mapa de requisitos e critérios de avaliação

Este mapa separa o enunciado e o protótipo das interpretações acordadas para a implementação. Os critérios de avaliação não têm pesos declarados; as evidências abaixo permitem conferir o trabalho sem presumir uma pontuação.

## Requisitos funcionais e técnicos

| Requisito                                   | Onde conferir                                                                                                                                              | Evidência automatizada                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Interface React e API REST NestJS           | [App React](../frontend/src/App.tsx), [módulo Nest](../backend/src/app.module.ts) e [controller](../backend/src/users/users.controller.ts)                 | Build e TypeScript no CI                                                                                  |
| Banco relacional                            | [Entidade](../backend/src/users/user.entity.ts), [migration](../backend/src/database/migrations/1788300000000-CreateUsers.ts) e [Compose](../compose.yaml) | Integração com PostgreSQL real e inicialização das imagens                                                |
| Home e navegação                            | [Home](../frontend/src/pages/HomePage.tsx) e [layout](../frontend/src/components/Layout.tsx)                                                               | [Testes do layout](../frontend/src/components/Layout.test.tsx) e navegação mobile no E2E                  |
| Cadastro com nome, email, matrícula e senha | [Formulário](../frontend/src/components/UserForm.tsx) e [DTO de criação](../backend/src/users/dto/create-user.dto.ts)                                      | Validação unitária, integração HTTP e fluxo E2E de cadastro                                               |
| Listagem e busca por nome                   | [Lista](../frontend/src/pages/UsersPage.tsx) e [service](../backend/src/users/users.service.ts)                                                            | Busca parcial, case-insensitive e literal com `%` na integração; o escape de `_` também está implementado |
| Paginação                                   | Lista e service, com total e página calculados no servidor                                                                                                 | Limites, lista vazia e ajuste de página na integração; navegação entre páginas no E2E                     |
| Visualização, edição e exclusão             | [Telas](../frontend/src/pages/UserPages.tsx), [modal](../frontend/src/components/DeleteDialog.tsx) e controller                                            | Fluxo completo, confirmação/cancelamento e 404 após exclusão no E2E                                       |
| Validação e unicidade                       | [Campos dos DTOs](../backend/src/users/dto/user-fields.dto.ts), [validação da interface](../frontend/src/lib/validation.ts) e constraints da migration     | Casos inválidos, email/matrícula duplicados e concorrência na integração                                  |
| Documentação Swagger                        | [Bootstrap da API](../backend/src/main.ts) e DTOs de resposta                                                                                              | Disponível em `/api/docs` e `/api/docs-json`; abertura conferida manualmente                              |
| Referência visual fornecida                 | [Revisão visual](visual-review.md) e [galeria](screenshots/README.md)                                                                                      | Fluxos de foco e viewport mobile no E2E; aparência revisada manualmente                                   |

As suítes estão em [backend unitário](../backend/test/unit/user-validation.spec.ts), [integração HTTP](../backend/test/integration/users.spec.ts), [testes do formulário](../frontend/src/components/UserForm.test.tsx) e [E2E](../e2e/users.spec.ts). A cobertura citada descreve comportamentos verificados, não uma porcentagem de cobertura de código.

## Interpretações e melhorias acordadas

| Ponto               | Decisão implementada                                                                             | Origem                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Nome                | Letras Unicode acentuadas e espaços; NFC, trim e redução de espaços repetidos; até 30 caracteres | Acentos/espaços aprovados pelo usuário; limite do protótipo                    |
| Email               | Até 40 caracteres; trim, lowercase e unicidade                                                   | Limite do protótipo; normalização como decisão técnica                         |
| Matrícula           | Texto com 4–10 dígitos e preservação de zeros iniciais                                           | PDF pede números; indicação de “letras” no protótipo interpretada como dígitos |
| Senha               | Exatamente 6 caracteres, letra e número, sem espaços; símbolos opcionais permitidos              | Ampliação aprovada do requisito original                                       |
| Edição da senha     | Campo inicialmente vazio; omissão ou string vazia preserva o hash; `null` é inválido             | Comportamento aprovado pelo usuário                                            |
| Proteção da senha   | `scrypt` com salt aleatório; senha/hash nunca aparecem nas respostas                             | Decisão técnica                                                                |
| Erros e recuperação | Validação por campo; 400/404/409/413; erro interno sanitizado; tentativa novamente na interface  | Decisão técnica e cuidado de usabilidade                                       |
| Docker completo     | Frontend, API e PostgreSQL; migrations automáticas e volume persistente                          | Ampliação solicitada pelo usuário                                              |
| CI e apresentação   | Verificações em push/PR, screenshots, mapa de requisitos e roteiro                               | Ampliação solicitada pelo usuário                                              |

## Como demonstrar os critérios de avaliação

| Critério               | Evidência concreta                                                                                       | Como apresentar                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Qualidade do código    | Responsabilidades divididas entre controller/service/repository; DTOs; componentes; TypeScript; testes   | Seguir uma criação do formulário ao banco e à resposta pública   |
| Funcionalidade         | CRUD, busca/paginação, validações e persistência                                                         | Executar os fluxos E2E, incluindo um erro de duplicidade         |
| Resolução de problemas | Concorrência garantida por constraints, preservação da senha, sanitização de erros e restauração do foco | Explicar dois casos de borda e mostrar os testes correspondentes |
| Documentação           | Execução em um comando, Swagger, decisões, mapa de requisitos e evidências                               | Abrir README, Swagger e [verificações](verification.md)          |

Autenticação, autorização, outros módulos e deploy público não fazem parte desta entrega. A regra curta de senha segue o exercício e precisaria ser revista para um produto público.
