# Evidências de verificação

Verificado em **2 de setembro de 2026**, no Windows, com Node.js 24.14.0, npm 11.12.1, Docker Desktop e PostgreSQL 17. O banco de demonstração usa a porta 54329; testes usam banco descartável distinto na 54330.

## Resultado final

| Verificação            | Resultado                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run build`        | Backend e frontend compilados, saída 0                                      |
| `npm run typecheck`    | Ambos os projetos aprovados, saída 0                                        |
| `npm test`             | 29 testes de backend + 41 de frontend aprovados                             |
| `npm run test:api`     | 20 testes HTTP com PostgreSQL real aprovados                                |
| `npm run test:e2e`     | 5 testes Chromium aprovados, 15,8 segundos                                  |
| `npm run format:check` | Todos os arquivos formatados                                                |
| Instalação npm         | Lockfile atualizado; auditoria retornou zero vulnerabilidades na data acima |
| Migrations             | Schema criado do zero no PostgreSQL de teste e demonstração                 |
| Seed                   | 23 registros; segunda execução manteve os mesmos 23 identificadores         |
| Swagger UI             | Abriu com operações CRUD, busca/paginação, schemas e exemplos               |
| Health                 | Resposta `status: ok`, `database: up`                                       |

**Total: 95 testes aprovados.** A suíte de integração executa a configuração HTTP real (incluindo parser de JSON e limite de corpo). O E2E inicia API e interface próprias nas portas 3001 e 5174.

## O que os testes protegem

- Nome acentuado e normalização NFC; limites de nome/email; matrícula textual com zeros; caracteres inválidos, campos obrigatórios e `null`.
- Senha de seis caracteres, letra/número, símbolos opcionais e rejeição de espaços/quebras de linha.
- Senha omitida ou vazia na edição mantém o hash, senha nova altera o hash, salt diferente por registro e ausência de senha/hash nas respostas.
- Conflitos de email e matrícula, incluindo criações concorrentes e atomicidade de edição rejeitada por conflito.
- Pesquisa parcial e case-insensitive, escape de curingas SQL, limites de paginação, resultados vazios e ajuste de página acima do total.
- JSON malformado sanitizado, múltiplas variantes de erro de parsing e resposta 413 para corpo excessivo.
- Formulário, confirmação de senha, payload parcial, duplicidade no campo, email Unicode/entre aspas aceito de forma consistente com a API.
- Foco inicial e retorno do modal, retorno de foco do menu mobile e foco no título após navegar.

## Fluxos reais de navegador

1. Cadastro inválido e válido → pesquisa → edição sem trocar senha → visualização → cancelamento da exclusão com Escape → exclusão confirmada → resposta 404 para o registro removido.
2. Email duplicado → mensagem no formulário → foco no email → correção habilita o botão de salvar.
3. Segunda página → busca retorna à primeira → falha de rede simulada → recuperação ao tentar novamente.
4. Formulário em 390 × 844 sem transbordamento horizontal.
5. Menu mobile: Escape devolve foco ao botão; navegação foca o título da tela.

Também foram inspecionados visualmente Home, lista, cadastro e Swagger em desktop; cadastro foi inspecionado em viewport de celular. A referência visual orienta identidade, navegação e disposição do formulário; a Home utiliza uma ilustração SVG original.

## Resolução de problemas demonstrada

Revisões independentes identificaram e confirmaram a correção de:

- Mensagem nativa de JSON inválido que podia ecoar dados enviados: tratamento no middleware antes da conversão do erro pelo Nest.
- Corpo excessivo que retornava 500: retorno 413 com mensagem fixa.
- Diferença de validação de email entre bibliotecas: uso do mesmo `validator.js` nos dois lados.
- Foco solicitado antes da remoção de `inert` no menu: restauração após o commit do estado.
- Foco inicial do modal: chamada explícita após `showModal()`, com regressão em StrictMode e navegador real.

Os primeiros testes E2E também revelaram dois ajustes necessários nos próprios testes: label com asterisco obrigatório e espera pela busca com debounce antes de navegar. Ambos foram corrigidos sem relaxar as verificações do produto.

## Limites da verificação

Execução local; nenhum deploy público realizado. Não foram realizados testes de carga ou auditoria formal de acessibilidade. Autenticação e autorização não fazem parte do escopo aprovado. A política de senha e os limites de campos seguem as decisões do exercício, registradas no design e no README.

## Containerização completa

Verificação adicional em 2 de setembro de 2026, após incluir frontend e API no Compose:

- `docker compose up -d --build --wait`: imagens compiladas e serviços `web`, `api` e `db` saudáveis.
- Novo projeto `wenlock-container-test`: volume vazio criado e migrations aplicadas automaticamente antes de iniciar a API.
- `npm run test:e2e:docker`: os mesmos 5 testes Chromium aprovados nas imagens finais em 8,1 segundos, usando porta 8081 e banco isolado na 54331. Não são cinco casos novos; são os fluxos existentes executados também no Docker.
- `http://localhost:8080/api/health`: `status: ok`, `database: up`; OpenAPI retornou as rotas esperadas e acesso direto à rota React `/users/new` retornou HTTP 200.
- Seed executado com `docker compose exec api node dist/database/seed.js`; comparação antes/depois confirmou os mesmos 23 identificadores. O volume de demonstração foi preservado durante a recriação do contêiner PostgreSQL e os rebuilds da aplicação.
- Usuários de execução verificados com `id`: API `node` (UID 1000), frontend `nginx` (UID 101).
- Revisão identificou que peers opcionais do TypeORM mantinham compiladores no runtime. Após `--omit=dev --omit=optional`, `require.resolve` confirmou ausência de `ts-node` e `typescript`; os fluxos E2E foram reexecutados com sucesso.
- A cópia de testes foi encerrada; aplicação principal permanece disponível na porta 8080.

A comunicação entre contêineres exigiu tornar `HOST` configurável: o primeiro acesso via proxy retornou 502 com a API limitada ao loopback. Com `HOST=0.0.0.0` dentro do Compose, o proxy passou a atender API e Swagger; o padrão de desenvolvimento nativo permanece `127.0.0.1`.

## Preparação da entrega — 3 de setembro de 2026

- TypeScript e build aprovados; 29 testes unitários de backend, 41 de frontend e 20 integrações HTTP com PostgreSQL real passaram novamente.
- Etapa de Docker do CI reproduzida localmente com `COMPOSE_PROJECT_NAME=wenlock-container-test`, portas 8081/54331 e `up --build --wait --wait-timeout 120`. Os 5 E2E passaram; após o ajuste de contraste, foram repetidos nas imagens finais: **5 aprovados em 12,5 segundos**. O total de casos continua 95.
- Workflow YAML analisado com `js-yaml`; eventos `push`, `pull_request` e `workflow_dispatch`, com jobs `quality` e `docker-e2e`. Revisão independente não encontrou problemas bloqueadores. Isso não substitui a execução no runner hospedado.
- **GitHub Actions:** workflow publicado; o estado hospedado atual deve ser consultado no badge do README ou na aba Actions, sem atribuir seus resultados a esta execução local.
- [Mapa dos requisitos](requirements.md), [revisão visual](visual-review.md) e [galeria](screenshots/README.md) adicionados.
- Aparência conferida contra as telas 11–14 do protótipo; adaptações documentadas. Formulário mobile verificado com `innerWidth=390` e largura útil de conteúdo 375, sem transbordamento horizontal.
- Screenshot mobile final confirmou por estilos computados `rgb(101, 113, 135)` nos placeholders e dicas; contrastes corrigidos calculados e conferidos na revisão.

Os testes hospedados, testes de carga e auditoria completa de acessibilidade continuam fora das evidências de execução desta entrega.
