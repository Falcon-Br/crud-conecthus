# WenLock: design aprovado

## Objetivo e avaliação

Entregar até amanhã um CRUD completo de usuários, fiel às telas 11, 12, 13, 14 e 23 do Adobe XD. Evidências: código organizado, requisitos funcionais, resolução documentada de casos de borda e execução reproduzível.

## Arquitetura

Repositório npm workspaces com frontend React/TypeScript/Vite e backend NestJS/TypeScript. PostgreSQL 17 com TypeORM 0.3, migrations explícitas e synchronize desativado. Camadas controller (HTTP), service (regras) e repository TypeORM (persistência). Frontend separado por páginas, componentes e cliente HTTP. Sem autenticação: escopo é gerenciamento de usuários local, não um portal público.

## Regras aprovadas

- Nome obrigatório: letras Unicode acentuadas e espaços entre nomes, máximo 30 caracteres após trim/normalização NFC; espaços repetidos são reduzidos a um.
- Email obrigatório: válido, máximo 40 caracteres; trim e lowercase antes de persistir; único.
- Matrícula obrigatória: string de 4 a 10 dígitos ASCII, única; preservar zeros iniciais. O texto '4 letras' do XD é interpretado como 4 dígitos conforme o PDF.
- Senha no cadastro: exatamente seis caracteres ASCII imprimíveis sem espaço, com pelo menos uma letra e um número; caracteres especiais permitidos, não obrigatórios. Ampliação do PDF aprovada pelo usuário.
- Confirmar senha na interface: igual à senha; nunca persistir confirmação.
- Edição: nome/email/matrícula preenchidos; senha nova opcional. Campos de senha vazios mantêm a senha atual. Nunca recuperar senha nem retornar hash. Persistência usa scrypt com salt aleatório.
- Email e matrícula duplicados retornam 409, inclusive em concorrência, garantidos por constraints no banco.
- Busca parcial por nome, case-insensitive, parametrizada; voltar à primeira página ao pesquisar.
- Paginação por servidor: 15 itens por padrão, máximo 100, ordem name ASC e id ASC; página acima da última é ajustada pelo servidor; banco vazio tem página 1 e totalPages 0.
- Exclusão confirmada com nome do usuário; ajustar página e atualizar lista após sucesso.
- Salvar habilitado somente com campos válidos, mudanças na edição e envio não pendente.

## Contrato HTTP

Prefixo /api. User = { id: UUID, name, email, registration, createdAt: ISO, updatedAt: ISO }.
POST /users recebe {name,email,registration,password}, retorna User (201).
GET /users?search=&page=1&pageSize=15 retorna {data: User[],meta:{page,pageSize,total,totalPages}} (200).
GET /users/:id retorna User (200).
PATCH /users/:id recebe campos opcionais {name,email,registration,password}; rejeita body vazio (400); retorna User (200).
DELETE /users/:id retorna 204. UUID inválido: 400; ausente: 404.
Erro = {statusCode:number,code:string,message:string,errors?:Record<string,string[]>}. Validação de campos usa errors, duplicidade aponta campo. Falhas internas não retornam detalhes SQL, stack ou payload.
GET /api/health checa banco; Swagger em /api/docs, JSON em /api/docs-json.

## Interface

Identidade WenLock do XD: sidebar azul-marinho, acento turquesa, superfície cinza clara, cartões brancos. Home com boas-vindas, usuários com busca e cadastro, tabela nome/ações (visualizar, editar, excluir), formulário com dados do usuário e acesso. Layout responsivo, labels e foco visíveis, estados de carregamento/erro/vazio/sucesso e modal acessível. Ilustração própria em SVG se o asset do XD não puder ser obtido.

## Qualidade e escopo

Testes de DTOs e formulários, integração HTTP com PostgreSQL isolado (migrations reais) e E2E de fluxo CRUD. Build e TypeScript estrito. README com início rápido, scripts, decisões e roteiro de demonstração. Docker para frontend, API e banco, conforme ampliação de escopo solicitada; deploy público, autenticação e outros módulos ficam fora do escopo acordado.

## Execução em contêineres

Compose inicia PostgreSQL → API após healthcheck → Nginx após healthcheck da API. O entrypoint executa migrations pendentes antes do NestJS. Nginx serve o React e encaminha `/api` para `api:3000`; a API escuta `0.0.0.0` apenas dentro da rede Docker e mantém loopback como padrão no modo nativo. A interface é publicada em `localhost:8080`, com fallback para rotas React. O volume PostgreSQL existente é preservado.

Imagens em múltiplos estágios separam compiladores do runtime. API e Nginx usam usuários sem privilégios, filesystem somente leitura e diretório temporário em memória. A demonstração mantém credenciais locais de desenvolvimento. Os E2E das imagens usam um projeto Compose separado, com portas 8081/54331 e volume próprio.
