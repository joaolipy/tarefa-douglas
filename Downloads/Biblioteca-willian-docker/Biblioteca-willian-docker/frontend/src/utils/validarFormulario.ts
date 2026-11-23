import type { FieldConfig, FormMode, FormValues } from "../resources/types";
import { interpretarDecimal } from "./formatar";

export function campoVisivel(field: FieldConfig, values: FormValues, mode: FormMode): boolean {
  if (field.mode && field.mode !== mode) return false;
  return field.showWhen ? field.showWhen(values) : true;
}

export function validarCampos(
  fields: FieldConfig[],
  values: FormValues,
  mode: FormMode,
): Record<string, string> {
  const erros: Record<string, string> = {};

  for (const field of fields) {
    if (!campoVisivel(field, values, mode) || field.type === "checkbox") continue;

    const valor = values[field.name];
    const texto = typeof valor === "string" ? valor.trim() : "";

    if (!texto) {
      if (field.required) erros[field.name] = `O campo "${field.label}" é obrigatório.`;
      continue;
    }

    if (field.type === "number") {
      const numero = Number(texto);
      if (!Number.isInteger(numero)) {
        erros[field.name] = "Informe um número inteiro.";
        continue;
      }
      if (field.min !== undefined && numero < field.min) {
        erros[field.name] = `O valor mínimo é ${field.min}.`;
        continue;
      }
    }

    if (field.type === "decimal") {
      const numero = interpretarDecimal(texto);
      if (Number.isNaN(numero)) {
        erros[field.name] = "Informe um valor numérico (ex.: 2,50).";
        continue;
      }
      if (field.min !== undefined && numero < field.min) {
        erros[field.name] = `O valor mínimo é ${field.min}.`;
        continue;
      }
    }

    const mensagem = field.validate?.(texto, values);
    if (mensagem) erros[field.name] = mensagem;
  }

  return erros;
}
