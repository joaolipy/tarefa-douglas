import { useState, type SubmitEvent } from "react";
import { api } from "../api/axios";
import { Alert } from "../componentes/Alert";
import { Button } from "../componentes/Button";
import { FormField } from "../componentes/FormField";
import { PageHeader } from "../componentes/PageHeader";
import { PasswordChecklist } from "../componentes/PasswordChecklist";
import { useAuth } from "../hooks/useAuth";
import { validarCadastro, type CadastroErros, type CadastroForm } from "../schemas/cadastro";
import type { User } from "../types";
import { traduzirErroApi } from "../utils/erroApi";
import { mascararCpf } from "../utils/formatar";

export function PerfilPage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState<CadastroForm>({
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    cpf: mascararCpf(user?.cpf ?? ""),
    password: "",
    confirmPassword: "",
  });
  const [erros, setErros] = useState<CadastroErros>({});
  const [erroGeral, setErroGeral] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  function atualizar(campo: keyof CadastroForm, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setSucesso("");
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!user) return;
    setErroGeral("");
    setSucesso("");

    const errosLocais = validarCadastro({ ...form, email: user.email });
    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      return;
    }

    setLoading(true);
    try {
      const resposta = await api.put<User>(`/users/${user.id}`, {
        nome: form.nome.trim(),
        cpf: form.cpf,
        password: form.password,
      });
      updateUser(resposta.data);
      setForm((atual) => ({ ...atual, password: "", confirmPassword: "" }));
      setSucesso("Dados atualizados com sucesso!");
    } catch (error) {
      const { mensagem, campos } = traduzirErroApi(error);
      setErroGeral(mensagem);
      setErros((atual) => ({ ...atual, ...campos }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Meu perfil" descricao="Atualize seus dados. O e-mail não pode ser alterado." />
      <form onSubmit={onSubmit} noValidate className="card form-card">
        {sucesso && <Alert variant="success">{sucesso}</Alert>}
        {erroGeral && <Alert variant="error">{erroGeral}</Alert>}

        <FormField id="nome" label="Nome" value={form.nome} onChange={(v) => atualizar("nome", v)} error={erros.nome} disabled={loading} />
        <FormField id="email" label="E-mail" type="email" value={form.email} onChange={() => undefined} disabled />
        <FormField
          id="cpf"
          label="CPF"
          inputMode="numeric"
          value={form.cpf}
          onChange={(v) => atualizar("cpf", mascararCpf(v))}
          error={erros.cpf}
          disabled={loading}
        />
        <FormField
          id="password"
          label="Nova senha"
          type="password"
          value={form.password}
          onChange={(v) => atualizar("password", v)}
          autoComplete="new-password"
          error={erros.password}
          disabled={loading}
        />
        <PasswordChecklist senha={form.password} />
        <FormField
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          value={form.confirmPassword}
          onChange={(v) => atualizar("confirmPassword", v)}
          autoComplete="new-password"
          error={erros.confirmPassword}
          disabled={loading}
        />

        <Button type="submit" loading={loading}>
          Salvar alterações
        </Button>
      </form>
    </>
  );
}
