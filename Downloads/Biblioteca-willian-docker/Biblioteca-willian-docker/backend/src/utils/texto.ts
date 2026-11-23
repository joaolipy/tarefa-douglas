export function compactarEspacos(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

export function normalizarTexto(texto: string): string {
  return compactarEspacos(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
