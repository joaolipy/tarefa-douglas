import assert from "node:assert/strict";
import { checkPasswordStrength, isValidCpf, isValidEmail } from "./validators";

assert.equal(isValidCpf("529.982.247-25"), true);
assert.equal(isValidCpf("52998224725"), true);
assert.equal(isValidCpf("529.982.247-24"), false);
assert.equal(isValidCpf("111.111.111-11"), false);
assert.equal(isValidCpf("123"), false);

assert.equal(isValidEmail("ana@exemplo.com"), true);
assert.equal(isValidEmail("ana@exemplo"), false);
assert.equal(isValidEmail("ana exemplo@x.com"), false);
assert.equal(isValidEmail("@x.com"), false);

assert.equal(checkPasswordStrength("Abcdef1!").valid, true);
assert.equal(checkPasswordStrength("abcdef").valid, false);
assert.deepEqual(checkPasswordStrength("abcdefgh").missing, [
  "uma letra maiúscula",
  "um número",
  "um caractere especial (ex.: ! @ # $)",
]);

console.log("✔ validators: todos os testes passaram");
