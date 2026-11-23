import { User } from "../../entities";
import type { NewUser, UserChanges, UserRecord } from "../contracts/records";
import type { UserRepository } from "../contracts/Repository";

function toRecord(entity: User): UserRecord {
  return {
    id: entity.id,
    nome: entity.nome,
    email: entity.email,
    cpf: entity.cpf,
    passwordHash: entity.password,
  };
}

export class SequelizeUserRepository implements UserRepository {
  async findById(id: number): Promise<UserRecord | null> {
    const entity = await User.findByPk(id);
    return entity ? toRecord(entity) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const entity = await User.findOne({ where: { email } });
    return entity ? toRecord(entity) : null;
  }

  async findByCpf(cpf: string): Promise<UserRecord | null> {
    const entity = await User.findOne({ where: { cpf } });
    return entity ? toRecord(entity) : null;
  }

  async create(values: NewUser): Promise<UserRecord> {
    const created = await User.create({
      nome: values.nome,
      email: values.email,
      cpf: values.cpf,
      password: values.passwordHash,
    });
    return toRecord(created);
  }

  async update(id: number, values: UserChanges): Promise<UserRecord | null> {
    const entity = await User.findByPk(id);
    if (!entity) return null;
    await entity.update({ nome: values.nome, cpf: values.cpf, password: values.passwordHash });
    return toRecord(entity);
  }
}
