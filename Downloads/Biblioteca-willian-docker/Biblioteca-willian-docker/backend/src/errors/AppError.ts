export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly errors: FieldErrors | undefined;

  constructor(message: string, statusCode: number, errors?: FieldErrors) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(errors: FieldErrors, message = "Dados inválidos.") {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para esta ação.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors?: FieldErrors) {
    super(message, 409, errors);
  }
}
