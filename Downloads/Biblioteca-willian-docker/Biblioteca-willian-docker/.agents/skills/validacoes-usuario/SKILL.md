---
name: validacoes-usuario
description: Regras de validação de CPF, e-mail e senha, e regras de cadastro, login e edição de usuário da Biblioteca. Use ao mexer em autenticação, cadastro, perfil ou em qualquer campo de CPF, e-mail ou senha.
---

# Validações de usuário

## Fonte única de regras
- Back-end: `backend/src/utils/validators.ts` (`isValidCpf`, `isValidEmail`, `checkPasswordStrength`).
- Front-end: `frontend/src/utils/validators.ts` é uma cópia idêntica. **Se mudar um, mude o outro** e atualize os testes em `backend/src/utils/validators.test.ts`.

## Regras
- **CPF**: 11 dígitos, dígitos verificadores corretos, sequências repetidas (`111.111.111-11`) são inválidas. Salvo no banco somente com dígitos.
- **E-mail**: regex `algo@dominio.tld`; salvo em minúsculas e único.
- **Senha**: mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial. Salva só como hash bcrypt, nunca devolvida pela API.

## Fluxos
- **Cadastro** (`POST /users`, público): nome, e-mail, senha e CPF obrigatórios; e-mail e CPF únicos (409).
- **Login** (`POST /auth/login`): só usuário existente; erro genérico `E-mail ou senha inválidos.` (401) para e-mail inexistente e senha errada; retorna `{ token, user }`.
- **Edição** (`PUT /users/:id`, autenticada): só o próprio usuário (403 caso contrário); `nome`, `cpf` e `password` são obrigatórios; **o e-mail não pode ser alterado** (se enviado e diferente, 400); front pede confirmação de senha.
- A resposta de usuário é sempre `{ id, nome, email, cpf }`.

## Nunca
- Logar, imprimir ou devolver senha ou hash. Nunca ler o `.env`.
