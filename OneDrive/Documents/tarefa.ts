class Consumidor {
  private _nome: string;
  private _idade: number;
  private _email: string;

  constructor(nome: string, idade: number, email: string) {
    this.validarNome(nome);
    this.validarIdade(idade);
    this.validarEmail(email);

    this._nome = nome.trim();
    this._idade = idade;
    this._email = email.trim();
  }

    get nome(): string {
    return this._nome;
  }

  get idade(): number {
    return this._idade;
  }

  get email(): string {
    return this._email;
  }

    private validarNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new Error("O nome não pode estar vazio.");
    }
  }

  private validarIdade(idade: number): void {
    if (!Number.isInteger(idade) || idade < 0) {
      throw new Error("A idade deve ser um número inteiro não negativo.");
    }
  }

  private validarEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`O e-mail '${email}' é inválido.`);
    }
  }

    public formatarExibicao(): string {
    return `Consumidor: ${this._nome} (${this._idade} anos) - ${this._email}`;
  }
}

class GerenciadorConsumidores {
  private consumidores: Consumidor[] = [];

  public adicionar(consumidor: Consumidor): void {
    this.consumidores.push(consumidor);
  }

  public listarTodos(): Consumidor[] {
    return [...this.consumidores];
  }

  public calcularMediaIdade(): number {
    if (this.consumidores.length === 0) return 0;
    const somaIdades = this.consumidores.reduce((acc, c) => acc + c.idade, 0);
    return somaIdades / this.consumidores.length;
  }

  public obterExtremosIdade(): { maisVelho: Consumidor | undefined; maisNovo: Consumidor | undefined } {
    if (this.consumidores.length === 0) {
      return { maisVelho: undefined, maisNovo: undefined };
    }

    let maisVelho = this.consumidores[0];
    let maisNovo = this.consumidores[0];

    for (const c of this.consumidores) {
      if (c.idade > maisVelho.idade) maisVelho = c;
      if (c.idade < maisNovo.idade) maisNovo = c;
    }

    return { maisVelho, maisNovo };
  }
}