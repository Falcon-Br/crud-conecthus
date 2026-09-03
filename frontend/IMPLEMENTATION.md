# Interface WenLock

## Entrega

- React 19, TypeScript estrito, Vite e React Router; cliente HTTP em `src/lib/api.ts`.
- Rotas `/`, `/users`, `/users/new`, `/users/:id`, `/users/:id/edit`.
- Sidebar azul-marinho, destaque turquesa, cabeçalho branco com avatar, cartões, Home com ilustração SVG original, tabela Nome/Ações.
- Formulário conforme disposição do XD: seção Dados do usuário com Nome/Matrícula e E-mail; seção Dados de acesso com Senha/Confirmar senha.
- Busca parcial com debounce de 300 ms e retorno à primeira página; paginação de servidor com 15 itens por padrão, opções 30/50/100; pesquisa e página preservadas ao abrir formulários/visualização via estado de navegação.
- Estados de carregamento, vazio, erro com nova tentativa e notificações de sucesso. Requisições de consulta canceladas ao trocar parâmetros/desmontar.
- Labels em português, descrições e erros associados aos campos, foco visível, link de pular conteúdo, menu móvel com controle de foco, modal nativo `<dialog>` com bloqueio do fundo, Escape, foco no cancelamento e retorno do foco.
- Edição envia apenas campos alterados; senha vazia é omitida; confirmação nunca é enviada. Erros HTTP de duplicidade são associados aos campos e liberados após correção.

## Verificação

Executado em 02/09/2026:

- `npm test -w frontend`: **41 testes passaram** em 4 arquivos (Vitest / Testing Library).
- `npm run build -w frontend`: **passou**, inclui `tsc -b` com TypeScript estrito. Build de produção aproximadamente 271 kB JS / 87 kB gzip e 19 kB CSS / 5 kB gzip, sem avisos.
- Evidência TDD: 22 falhas observadas antes de implementar regras de validação; 3 falhas de formulário antes de implementar o componente; 2 regressões de nomes com tabulação/quebra de linha observadas antes de alinhar normalização com API. As execuções seguintes passaram.
- Cobertura de regras: nomes Unicode normalizados, limites, e-mail, matrícula com zeros iniciais, senha ASCII de seis caracteres com letra/número e símbolo opcional, confirmação, edição sem senha, payload parcial, correção de conflito de e-mail.
- Os casos de quebra de linha terminal em matrícula/senha também são exercitados e rejeitados.
- Regressão de foco identificada no E2E: o modal agora foca explicitamente Cancelar depois de `showModal()`, sem depender de `autoFocus` do React. Teste em StrictMode falhou antes da correção e passou após ela, verificando também o retorno ao botão de exclusão quando cancelado com Escape.
- Revisão independente: oito regressões adicionais falharam antes das correções e passaram depois. E-mails Unicode e local-part entre aspas usam o mesmo `validator/lib/isEmail` padrão da API, incluindo edição somente do nome com e-mail preservado. O menu móvel devolve o foco somente após remoção de `inert`, para Escape, botão e clique no fundo; navegar foca o título, e clicar na página atual também fecha o menu.

## Execução e integração

`npm run dev -w frontend` inicia em `http://127.0.0.1:5173`. O proxy `/api` aponta por padrão para `http://127.0.0.1:3000`; variável `API_TARGET` permite usar uma API isolada para E2E. API segue `docs/design.md`.

## Observações

- A validação final com servidor real e navegador desktop/móvel será registrada pelo fluxo integrado de E2E do projeto; não foi executada por este agente de frontend.
- `validator` e seus tipos são dependências explícitas do frontend; Zod foi removido após alinhar a validação de e-mail ao backend.
- Inter é carregada via Google Fonts quando a rede está disponível; a interface funciona com Segoe UI/Arial como fallback sem a rede.
- Não há autenticação neste escopo; o cabeçalho identifica o perfil administrativo da demonstração. Não existem módulos ou ações fictícios navegáveis.
