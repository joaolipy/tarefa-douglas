# AGENTS.md — Biblioteca

Instruções para agentes de IA (Cursor, Copilot, Codex etc.) que trabalharem neste repositório.

## Visão geral

Sistema de gestão de uma biblioteca comunitária. Persona: a coordenadora da biblioteca, que precisa cadastrar o acervo e os leitores, controlar empréstimos e devoluções (com multa por atraso) e entender a demanda para decidir compras e prazos.

| Pasta | O que é | Stack |
|---|---|---|
| `backend/` | API REST autenticada com JWT | Node, Express 5, TypeScript, Sequelize, MySQL |
| `frontend/` | Interface web | React 19, Vite, TypeScript, React Router, axios, zod |
| `estatistica/` | Análise descritiva | Python, pandas, matplotlib, scipy |
| `nginx/`, `docker-compose.yml` | Infraestrutura (proxy reverso, rede, volume) | Docker, Nginx, MySQL 8.4 |

## Comandos

```bash
cd backend && npm install && npm run dev      # API em http://localhost:3000
cd backend && npm test                         # testes de validadores e serviços (sem banco)
cd backend && npm run demo:domain              # demonstração das classes de domínio
cd frontend && npm install && npm run dev      # app em http://localhost:5173
cd frontend && npm run build                   # checagem de tipos + build
docker compose up -d --build                   # stack completa em http://localhost (precisa do .env da raiz)
docker compose logs -f backend                 # logs (nunca use `docker compose config`: ele imprime os segredos)
```

## Infraestrutura (Docker)

- Serviços: `mysql`, `backend`, `frontend` e `nginx`. Somente o `nginx` publica porta no host.
- Redes: `public` (só o nginx), `app_net` (nginx, frontend, backend; interna) e `db_net` (backend e mysql; interna). O MySQL nunca fica acessível de fora.
- O nginx encaminha `/api/` para o backend (removendo o prefixo) e todo o resto para o frontend.
- Dados do MySQL ficam no volume `mysql_data`. Nunca rode `docker compose down -v` sem confirmação: apaga o banco.
- Variáveis ficam no `.env` da raiz (modelo em `.env.example`). O front recebe `VITE_API_URL=/api` em tempo de build.

## Arquitetura do back-end (respeite as camadas)

`routes → controllers → services → repositories (contratos) → Sequelize`

- `controllers/` só traduzem HTTP: leem `req`, chamam `parsers` e `services`, devolvem `res`. Nenhuma regra de negócio.
- `validation/` converte o corpo da requisição em dados tipados, lançando `ValidationError` com erros por campo.
- `services/` guardam as regras de negócio e dependem apenas de **interfaces** de `repositories/contracts/` (inversão de dependência). Não importe Sequelize aqui.
- `repositories/sequelize/` implementam os contratos. É o único lugar que conhece o ORM.
- `domain/` contém as classes de POO (`ItemAcervo` abstrata, `Livro`, `Revista`, `Leitor`) com campos privados `#`, getters/setters validados e erros de domínio.
- `errors/` e `middlewares/errorHandler.ts` mapeiam exceções para respostas HTTP padronizadas: `{ message, errors? }`.
- `container.ts` é a única raiz de composição (instancia e injeta as dependências).

## Convenções de código

- TypeScript estrito. **Proibido** `any`, `@ts-ignore` e `@ts-nocheck`. Prefira interfaces, `type`, generics e utility types.
- Nunca escreva JavaScript puro (`.js`) no projeto.
- Classes em PascalCase; funções e variáveis em camelCase; constantes em MAIÚSCULAS_COM_UNDERSCORE.
- Estado de classes de domínio sempre privado (`#campo`). Só exponha `set` quando houver validação ou regra de negócio.
- Erros de negócio usam as classes de `errors/AppError.ts` ou `domain/errors/DominioError.ts`. Não lance `Error` genérico para regras de negócio.
- Sem comentários no código: use nomes claros. A documentação fica no README e neste arquivo.
- Todas as rotas de dados (`/autores`, `/livros`, `/leitores`, `/emprestimos`, `/users/me`, `PUT /users/:id`) exigem JWT. Somente `POST /auth/login` e `POST /users` são públicas.
- Front-end: componentes genéricos em `componentes/`, telas em `pages/`, regras de campo em `resources/` e `schemas/`, estado global do usuário em `contexts/`. O token fica no `localStorage` (`api/token.ts`).

## Skills disponíveis

Estão em `.agents/skills/` (cada uma tem um `SKILL.md`). Use a skill quando a tarefa se encaixar:

1. **`novo-crud`**: passo a passo para adicionar um novo recurso (CRUD) nas camadas do back-end e do front-end.
2. **`validacoes-usuario`**: regras de CPF, e-mail e senha, e as regras de edição de usuário (não alterar e-mail, só o próprio usuário).
3. **`revisao-tech-forge`**: checklist para revisar encapsulamento, acesso controlado, POO, SOLID, tipagem e tratamento de erros.

## Guardrails (limites do agente)

### Arquivos sensíveis
- **Nunca leia, abra, copie, imprima ou resuma** arquivos `.env`, `.env.*` (exceto `.env.example`), chaves (`*.pem`, `*.key`) ou qualquer arquivo com credenciais.
- Nunca exponha segredos (`JWT_SECRET`, `DB_PASSWORD` etc.) em respostas, logs, commits, mensagens de erro, testes ou exemplos. Use sempre os placeholders do `.env.example`.
- Não rode comandos que exibam variáveis de ambiente (`env`, `printenv`, `cat .env`, `type .env`, `echo $JWT_SECRET`, `docker compose config`, `docker inspect`).
- Se precisar de um valor de configuração, peça ao usuário para informá-lo ou use o `.env.example`.
- Ao criar novas variáveis, adicione apenas o nome e um valor de exemplo no `.env.example`.

### Ações
- Não execute comandos destrutivos (`rm -rf`, `DROP DATABASE`, `TRUNCATE`, `git reset --hard`, `git push --force`, `docker compose down -v`, `docker volume rm`, `docker system prune`) sem confirmação explícita do usuário.
- Não publique portas do `mysql`, `backend` ou `frontend` no `docker-compose.yml`: só o `nginx` pode ter `ports`.
- Não faça `git push`, `git commit` nem publique nada sem pedido explícito.
- Não altere dados de um banco real: trabalhe com testes em memória (`backend/src/tests`) ou peça confirmação.
- Não instale dependências novas sem justificar e sem avisar o usuário.
- Não desative validações, autenticação ou verificações de tipo para "fazer passar" um teste.
- Não coloque senhas ou hashes em respostas da API: o contrato do usuário é `{ id, nome, email, cpf }`.

### Antes de concluir uma tarefa
1. Rode `npm test` no `backend/` e, se tocou no front, `npm run build` no `frontend/`.
2. Confirme que nenhum arquivo `.env` foi lido ou modificado.
3. Resuma o que foi alterado e quais regras de negócio foram afetadas.
