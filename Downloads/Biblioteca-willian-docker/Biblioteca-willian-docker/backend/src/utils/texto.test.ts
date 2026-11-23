import assert from "node:assert/strict";
import { compactarEspacos, normalizarTexto } from "./texto";

assert.equal(compactarEspacos("  Machado   de  Assis "), "Machado de Assis");
assert.equal(normalizarTexto("  José   de ALENCAR "), "jose de alencar");
assert.equal(normalizarTexto("Clarice Lispector"), normalizarTexto("clarice  lispector"));
assert.notEqual(normalizarTexto("Clarice"), normalizarTexto("Clarisse"));

console.log("✔ texto: todos os testes passaram");
