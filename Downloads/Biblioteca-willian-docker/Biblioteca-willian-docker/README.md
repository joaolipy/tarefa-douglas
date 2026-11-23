# Biblioteca

Sistema pra uma biblioteca comunitária. A coordenadora precisa cadastrar livros, revistas e leitores, registrar empréstimo e devolução e saber quanto cobrar de multa quando alguém atrasa

## O que dá pra fazer

- criar conta, entrar (login com JWT) e editar o próprio perfil
- 4 cadastros completos: autores, livros e revistas, leitores e empréstimos, todos protegidos por login e com listagem paginada
- item emprestado fica indisponível até devolver
- prazo de 14 dias pra livro e 7 pra revista, no máximo 3 empréstimos abertos por leitor
- multa por dia de atraso: R$ 1,50 no livro e R$ 0,75 na revista
- análise dos empréstimos em Python na pasta `estatistica`

## Como rodar

Com o Docker aberto, na pasta do projeto:

```
copy .env.example .env
docker compose up -d --build
```

Antes de subir, abre o `.env` e troca as senhas e o `JWT_SECRET` (esse precisa ter pelo menos 16 caracteres, senão o back não inicia)

Depois abre http://localhost, cria uma conta em `/cadastro` e entra em `/login`

Uns comandos que ajudam:

```
docker compose ps                 # ver se subiu tudo
docker compose logs -f backend    # logs da API
docker compose down               # para tudo e mantém o banco
docker compose down -v            # para tudo e apaga o banco
```

Sem Docker também dá: precisa de um MySQL com o banco `biblioteca` criado, e em `backend` e `frontend` roda `npm install` e `npm run dev` (cada pasta tem o seu `.env.example`)

## Como tá organizado

- `backend`: API em Node, Express e TypeScript, separada em camadas (controllers, services, repositories e domain)
- `frontend`: React com TypeScript e Vite, com telas genéricas pra listar e cadastrar
- `nginx`: proxy reverso e única porta aberta, manda `/api` pro backend e o resto pro frontend
- `mysql`: o banco, os dados ficam guardados no volume `mysql_data`
- `estatistica`: notebook com a análise descritiva
- `AGENTS.md` e `.agents`: configuração dos agentes de IA, com 3 skills, regras e proteção do `.env`

No Docker são 4 containers e só o nginx publica porta. O mysql, o backend e o frontend ficam em redes internas, então ninguém de fora chega neles direto

```
navegador -> nginx -> frontend
                  \-> backend -> mysql -> volume mysql_data
```

## Estatística

```
cd estatistica
pip install -r requirements.txt
jupyter notebook analise_descritiva.ipynb
```

O `emprestimos.csv` é simulado (veja o `gerar_dados.py`). Pra usar dado real, roda o `consulta_emprestimos.sql` no banco, exporta como `emprestimos.csv` e abre o notebook de novo

## Evolução do projeto

- Sprint 1: cadastro de usuário (back e front) e as classes de domínio
- Sprint 2: login, edição de perfil, os 4 CRUDs, regras de empréstimo e multa, arquitetura em camadas e o `AGENTS.md`
- Sprint 3: Docker, nginx como proxy, redes isoladas e volume do mysql

## O que ainda falta

- só roda em HTTP, falta o HTTPS pra produção
- não cd C:\Users\user\Documents\Biblioteca

$readme = @'
# Biblioteca

Sistema pra uma biblioteca comunitária. A coordenadora precisa cadastrar livros, revistas e leitores, registrar empréstimo e devolução e saber quanto cobrar de multa quando alguém atrasa

## O que dá pra fazer

- criar conta, entrar (login com JWT) e editar o próprio perfil
- 4 cadastros completos: autores, livros e revistas, leitores e empréstimos, todos protegidos por login e com listagem paginada
- item emprestado fica indisponível até devolver
- prazo de 14 dias pra livro e 7 pra revista, no máximo 3 empréstimos abertos por leitor
- multa por dia de atraso: R$ 1,50 no livro e R$ 0,75 na revista
- análise dos empréstimos em Python na pasta `estatistica`

## Como rodar

Com o Docker aberto, na pasta do projeto:

```
copy .env.example .env
docker compose up -d --build
```

Antes de subir, abre o `.env` e troca as senhas e o `JWT_SECRET` (esse precisa ter pelo menos 16 caracteres, senão o back não inicia)

Depois abre http://localhost, cria uma conta em `/cadastro` e entra em `/login`

Uns comandos que ajudam:

```
docker compose ps                 # ver se subiu tudo
docker compose logs -f backend    # logs da API
docker compose down               # para tudo e mantém o banco
docker compose down -v            # para tudo e apaga o banco
```

Sem Docker também dá: precisa de um MySQL com o banco `biblioteca` criado, e em `backend` e `frontend` roda `npm install` e `npm run dev` (cada pasta tem o seu `.env.example`)

## Como tá organizado

- `backend`: API em Node, Express e TypeScript, separada em camadas (controllers, services, repositories e domain)
- `frontend`: React com TypeScript e Vite, com telas genéricas pra listar e cadastrar
- `nginx`: proxy reverso e única porta aberta, manda `/api` pro backend e o resto pro frontend
- `mysql`: o banco, os dados ficam guardados no volume `mysql_data`
- `estatistica`: notebook com a análise descritiva
- `AGENTS.md` e `.agents`: configuração dos agentes de IA, com 3 skills, regras e proteção do `.env`

No Docker são 4 containers e só o nginx publica porta. O mysql, o backend e o frontend ficam em redes internas, então ninguém de fora chega neles direto

```
navegador -> nginx -> frontend
                  \-> backend -> mysql -> volume mysql_data
```

## Estatística

```
cd estatistica
pip install -r requirements.txt
jupyter notebook analise_descritiva.ipynb
```

O `emprestimos.csv` é simulado (veja o `gerar_dados.py`). Pra usar dado real, roda o `consulta_emprestimos.sql` no banco, exporta como `emprestimos.csv` e abre o notebook de novo

## Evolução do projeto

- Sprint 1: cadastro de usuário (back e front) e as classes de domínio
- Sprint 2: login, edição de perfil, os 4 CRUDs, regras de empréstimo e multa, arquitetura em camadas e o `AGENTS.md`
- Sprint 3: Docker, nginx como proxy, redes isoladas e volume do mysql

## O que ainda falta

- só roda em HTTP, falta o HTTPS pra produção
- não tem refresh token, quando o login expira (2 horas) volta pra tela de login
- o front ainda não tem testes automáticos