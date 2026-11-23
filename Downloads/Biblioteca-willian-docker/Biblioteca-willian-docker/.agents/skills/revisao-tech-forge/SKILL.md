---
name: revisao-tech-forge
description: Checklist de revisão de código TypeScript orientado a objetos (encapsulamento, getters/setters, POO, tipagem, SOLID, exceções) para a rubrica Tech Forge da Biblioteca. Use ao criar ou revisar classes de domínio e serviços.
---

# Revisão Tech Forge

Aplique cada item e cite o arquivo e a linha dos problemas encontrados.

1. **Encapsulamento**: estado em `#campo` (ou `private`/`protected`), construtor que inicializa tudo e valida; nada de campos públicos mutáveis. Exemplos: `backend/src/domain/*.ts`.
2. **Acesso controlado**: `get` para ler; `set` somente com validação ou regra. `id`, ISBN e CPF não têm setter. Estado como `disponivel` muda só por `emprestar()` e `devolver()`.
3. **Domínio e POO**: `ItemAcervo` abstrata com `Livro` e `Revista` (herança), polimorfismo em `prazoEmprestimoEmDias()` e `calcularMulta()`; contrato `Emprestavel`.
4. **Tipagem**: interfaces e `type` aliases, generics (`Repository<T,...>`, `CrudService<...>`, `Page<T>`), utility types (`Omit`, `Pick`), união de literais (`TipoItem`). Zero `any`.
5. **SOLID**: S (controller, service e repositório separados), O (novos tipos via `ItemAcervoFactory` sem alterar a base), L (subclasses substituem `ItemAcervo`), D (services dependem de interfaces; composição em `container.ts`).
6. **Exceções e organização**: `DominioError`/`ValidacaoError`/`RegraDeNegocioError` e `AppError` (e filhos) tratados em `errorHandler`; pastas `domain`, `services`, `repositories`, `controllers`; nomes em PascalCase/camelCase.
7. **Execução**: `npm test` e `npm run demo:domain` precisam passar.
