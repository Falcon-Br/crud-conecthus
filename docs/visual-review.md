# Revisão visual

Revisão manual em 3 de setembro de 2026, comparando a aplicação em Docker com o [protótipo WenLock fornecido](https://xd.adobe.com/view/6c0ff585-36dd-4969-9d1f-b7661d820524-395c/screen/dcaf27a6-3e8a-4260-a8b0-7ff1f48142db/). As [screenshots](screenshots/README.md) registram a versão implementada.

## Comparação com a referência

| Tela/elemento             | Resultado                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home, tela 11             | Mantém sidebar azul-marinho, seleção turquesa, cabeçalho e área de boas-vindas. Texto e ilustração SVG são próprios; não replica nome/data fictícios do protótipo                                                    |
| Lista vazia, tela 12      | Orientação de primeiro cadastro; busca sem resultado tem mensagem própria e ação para limpar o filtro                                                                                                                |
| Lista preenchida, tela 13 | Nome e ações de visualizar/editar/excluir; busca, cadastro e paginação presentes. A implementação organiza busca e total no cabeçalho do cartão; a referência usa busca acima da tabela e cabeçalho de tabela escuro |
| Cadastro, tela 14         | Dados do usuário e dados de acesso separados; nome/matrícula na primeira linha, email abaixo, senha/confirmação em seguida. Labels permanecem visíveis e regras são descritas junto aos campos                       |
| Edição                    | Reaproveita a estrutura do formulário, com dados preenchidos e senha nova opcional; comportamento da senha documentado como ajuste acordado                                                                          |
| Responsividade            | Formulário em uma coluna no celular, navegação em menu e conteúdo acessível por rolagem. Viewport 390 × 844 sem transbordamento horizontal                                                                           |

A aplicação segue a referência de identidade e estrutura, com adaptações documentadas. Não se afirma equivalência pixel a pixel ou auditoria completa de acessibilidade.

## Ajuste aplicado nesta revisão

O contraste dos textos de ajuda e botões estava baixo. Em [styles.css](../frontend/src/styles.css), foi criado um tom turquesa forte para fundos de ações com texto branco, e textos de ajuda, placeholders, breadcrumbs e descrições receberam um cinza mais escuro. O botão de exclusão também foi escurecido. O turquesa original permanece nos detalhes decorativos.

Relações de contraste calculadas pela luminância relativa sRGB, para as combinações abaixo:

| Combinação                     | Antes              | Depois             |
| ------------------------------ | ------------------ | ------------------ |
| Texto branco no botão primário | 2,93:1 (`#00a6ba`) | 4,72:1 (`#007f91`) |
| Placeholder sobre branco       | 2,55:1 (`#9aa3b0`) | 4,92:1 (`#657187`) |
| Dica de campo sobre branco     | 3,07:1 (`#8994a4`) | 4,92:1 (`#657187`) |

Esses valores descrevem os pares corrigidos, não uma certificação da interface inteira. Estados desabilitados continuam visualmente distintos.

## Comportamentos verificados

- Botão Salvar desabilitado quando o cadastro está incompleto; ações e regras legíveis no formulário.
- Labels persistentes, títulos focáveis e navegação por teclado.
- Menu mobile e modal de exclusão: foco inicial e retorno ao fechar, cobertos pelos testes de componentes e navegador.
- CRUD, paginação, busca, erro de duplicidade e recuperação de falha de rede: 5 fluxos E2E das imagens Docker.
- Dados de demonstração preservados durante a revisão e screenshots sem submissão de novos cadastros.
