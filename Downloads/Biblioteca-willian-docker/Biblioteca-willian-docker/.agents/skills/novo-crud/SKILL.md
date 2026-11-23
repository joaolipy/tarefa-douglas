---
name: novo-crud
description: Adiciona um novo recurso (CRUD completo, autenticado e paginado) à Biblioteca, seguindo as camadas do back-end e a configuração do front-end. Use quando pedirem uma nova entidade, tabela ou tela de cadastro.
---

# Novo CRUD na Biblioteca

Siga a ordem abaixo. Não pule camadas e não use `any`.

## Back-end (`backend/src`)
1. **Model**: crie `entities/<nome>.model.ts` (Sequelize, campos com `declare`) e registre as associações em `entities/index.ts`. Use `onDelete: "RESTRICT"` nas chaves estrangeiras.
2. **Contratos**: em `repositories/contracts/records.ts` crie `<Nome>Input` e `<Nome>Record`; em `Repository.ts` crie `<Nome>Repository extends Repository<...>` com métodos extras (contagens, buscas únicas).
3. **Repositório**: crie `repositories/sequelize/Sequelize<Nome>Repository.ts` estendendo `SequelizeRepository` e implemente `toRecord`, `searchWhere` e, se preciso, `include`.
4. **Parser**: em `validation/parsers.ts` crie `parse<Nome>` usando `BodyReader` (campos obrigatórios, tipos, intervalos). Erros viram `ValidationError`.
5. **Service**: estenda `BaseCrudService` e sobrescreva `validarCriacao`, `validarAtualizacao` e `validarRemocao` com as regras de negócio (unicidade, bloqueio de exclusão com dependentes). Recebe repositórios por construtor (interfaces).
6. **Composição**: instancie tudo em `container.ts` com `new CrudController(service, parseCreate, parseUpdate)` e monte a rota em `app.ts` com `authenticate` + `crudRoutes`.
7. **Teste**: crie o repositório em memória em `tests/memory.ts` e cubra o service em `tests/services.test.ts` (criação, 404 em editar/excluir inexistente, regras de negócio).

## Front-end (`frontend/src`)
1. Tipo em `types/index.ts`.
2. Arquivo em `resources/<nome>.ts(x)` com `defineResource` (colunas, campos, `toFormValues`, `toPayload`). Campos com `required`, `min`, `validate`, `showWhen`, `optionsSource` cobrem as validações.
3. Registre em `resources/index.ts`. As telas de lista e de cadastro/edição (separadas) já são genéricas e aparecem no menu automaticamente.

## Conferência
- Todas as rotas exigem JWT, listagens paginadas (`page`, `limit`, `search`), 404 ao editar ou excluir id inexistente, 409 ao violar regra de negócio.
- `npm test` (back) e `npm run build` (front) passam.
