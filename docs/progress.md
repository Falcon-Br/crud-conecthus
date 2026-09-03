# Progresso da implementação do CRUD

## Revisão inicial

| Interface        | Compatibilidade                                             |
| ---------------- | ----------------------------------------------------------- |
| API → frontend   | nomes de campos, prefixo /api e envelopes fixados no design |
| API → E2E        | mesmos endpoints, banco separado na porta 54330             |
| Frontend → E2E   | rotas e labels acessíveis fixadas no design                 |
| API interna      | migrations e entidade devem usar a mesma tabela users       |
| Frontend interno | confirmação de senha restrita ao formulário                 |

Projeto iniciado em pasta vazia, sem git prévio; trabalho diretamente na pasta autorizada. Dependências externas obtidas do npm oficial. Docker Desktop iniciado para o PostgreSQL.

- Task 1: completo. 29 testes unitários e 20 integrações HTTP aprovados. Banco demo com 23 usuários e seed idempotente confirmado. Revisão e correções verificadas.
- Task 2: completo. 41 testes aprovados. Email alinhado com backend; foco de modal e menu corrigido. Revisão independente aprovada.
- Task 3: completo. 5 E2E aprovados; build, TypeScript, formatação, Swagger e health verificados. Evidências em docs/verification.md.

## Revisões

- API: correção de JSON malformado que podia ecoar payload e limite de corpo que retornava 500 em vez de 413; configuração HTTP compartilhada pelos testes e aplicação.
- Interface: revisão independente aprovou os ajustes de validação e foco, também confirmados no Chromium.
- Execução: primeiras duas falhas E2E eram seletor exato de label com asterisco obrigatório; seletor foi corrigido sem alterar o produto.

## Ampliação: aplicação completa em Docker

Concluída a pedido do usuário: frontend Nginx, API NestJS e PostgreSQL no Compose, migrations automáticas e healthchecks. Volume de demonstração preservado, com os mesmos 23 usuários; README atualizado para execução sem Node.js no host. Os 5 fluxos E2E passaram também contra imagens finais em projeto/banco isolados. Revisão corrigiu inclusão de ferramentas opcionais de desenvolvimento no runtime. Ambiente de testes encerrado e aplicação disponível em localhost:8080.

## Preparação da entrega — 3 de setembro

CI configurado com testes unitários, integração PostgreSQL, build e E2E Docker; comandos verificados localmente (95 testes). Workflow publicado no GitHub. Mapa de requisitos, screenshots desktop/mobile e revisão visual adicionados. Revisão encontrou contraste baixo em botões/textos auxiliares, corrigido e verificado; os 5 E2E passaram novamente. Revisão independente sem bloqueadores.
