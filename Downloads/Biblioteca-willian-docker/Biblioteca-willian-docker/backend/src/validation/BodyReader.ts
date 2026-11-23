import { ValidationError, type FieldErrors } from "../errors/AppError";
import { checkPasswordStrength, isValidCpf, isValidEmail, onlyDigits } from "../utils/validators";

interface IntegerOptions {
  min?: number;
  max?: number;
}

function nomeDoCampo(label: string): string {
  return label.replace(/^(o|a)\s+/i, "");
}

export class BodyReader {
  readonly #body: Record<string, unknown>;
  readonly #errors: FieldErrors = {};

  constructor(body: unknown) {
    this.#body = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  }

  has(key: string): boolean {
    return this.#body[key] !== undefined;
  }

  raw(key: string): unknown {
    return this.#body[key];
  }

  text(key: string, label: string): string {
    const value = this.#body[key];
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) this.fail(key, `O campo "${nomeDoCampo(label)}" é obrigatório.`);
    return text;
  }

  optionalText(key: string, maxLength = 500): string | null {
    const value = this.#body[key];
    if (value === undefined || value === null) return null;
    if (typeof value !== "string") {
      this.fail(key, "Valor inválido.");
      return null;
    }
    const text = value.trim();
    if (text.length > maxLength) {
      this.fail(key, `O texto deve ter no máximo ${maxLength} caracteres.`);
    }
    return text || null;
  }

  optionalInteger(key: string, label: string, options: IntegerOptions = {}): number | null {
    const value = this.#body[key];
    if (value === undefined || value === null || value === "") return null;
    return this.integer(key, label, options);
  }

  decimal(key: string, label: string, options: IntegerOptions = {}): number {
    const value = this.#body[key];
    const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
    const parsed = typeof normalized === "number" ? normalized : typeof normalized === "string" && normalized !== "" ? Number(normalized) : Number.NaN;
    if (!Number.isFinite(parsed)) {
      this.fail(key, `O campo "${nomeDoCampo(label)}" é obrigatório e deve ser um número.`);
      return 0;
    }
    if (options.min !== undefined && parsed < options.min) {
      this.fail(key, `O campo "${nomeDoCampo(label)}" deve ser maior ou igual a ${options.min}.`);
    }
    if (options.max !== undefined && parsed > options.max) {
      this.fail(key, `O campo "${nomeDoCampo(label)}" deve ser menor ou igual a ${options.max}.`);
    }
    return Math.round(parsed * 100) / 100;
  }

  integer(key: string, label: string, options: IntegerOptions = {}): number {
    const value = this.#body[key];
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (value === "" || value === null || value === undefined || !Number.isInteger(parsed)) {
      this.fail(key, `O campo "${nomeDoCampo(label)}" é obrigatório e deve ser um número inteiro.`);
      return 0;
    }
    if (options.min !== undefined && parsed < options.min) {
      this.fail(key, `${label} deve ser maior ou igual a ${options.min}.`);
    }
    if (options.max !== undefined && parsed > options.max) {
      this.fail(key, `${label} deve ser menor ou igual a ${options.max}.`);
    }
    return parsed;
  }

  boolean(key: string, label: string): boolean {
    const value = this.#body[key];
    if (typeof value !== "boolean") {
      this.fail(key, `O campo "${nomeDoCampo(label)}" é obrigatório (verdadeiro ou falso).`);
      return false;
    }
    return value;
  }

  oneOf<T extends string>(key: string, label: string, options: readonly T[]): T {
    const value = this.#body[key];
    const found = options.find((option) => option === value);
    if (found === undefined) {
      this.fail(key, `${label} deve ser um destes valores: ${options.join(", ")}.`);
      return options[0] as T;
    }
    return found;
  }

  email(key = "email"): string {
    const value = this.text(key, "O e-mail");
    if (value && !isValidEmail(value)) this.fail(key, "Informe um e-mail válido.");
    return value.toLowerCase();
  }

  cpf(key = "cpf"): string {
    const value = this.text(key, "O CPF");
    if (value && !isValidCpf(value)) this.fail(key, "Informe um CPF válido.");
    return onlyDigits(value);
  }

  password(key = "password"): string {
    const value = this.#body[key];
    const password = typeof value === "string" ? value : "";
    if (!password) {
      this.fail(key, "A senha é obrigatória.");
      return "";
    }
    const strength = checkPasswordStrength(password);
    if (!strength.valid) this.fail(key, `Senha fraca. Falta: ${strength.missing.join(", ")}.`);
    return password;
  }

  fail(key: string, message: string): void {
    if (!this.#errors[key]) this.#errors[key] = message;
  }

  assertValid(): void {
    if (Object.keys(this.#errors).length > 0) {
      throw new ValidationError({ ...this.#errors });
    }
  }
}
