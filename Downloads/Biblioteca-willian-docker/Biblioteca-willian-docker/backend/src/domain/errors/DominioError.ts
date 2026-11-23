export class DominioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidacaoError extends DominioError {}

export class RegraDeNegocioError extends DominioError {}
