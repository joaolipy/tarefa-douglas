import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../componentes/Alert";
import { AuthLayout } from "../componentes/AuthLayout";
import { Button } from "../componentes/Button";
import { FormField } from "../componentes/FormField";
import { useAuth } from "../hooks/useAuth";
import { validarLogin, type LoginErros, type LoginForm } from "../schemas/login";
import { traduzirErroApi } from "../utils/erroApi";

type EstadoRota = { cadastroConcluido?: boolean } | null;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const estado = location.state as EstadoRota;

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [erros, setErros] = useState<LoginErros>({});
  const [erroGeral, setErroGeral] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/inicio" replace />;

  function atualizar(campo: keyof LoginForm, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErroGeral("");

    const errosLocais = validarLogin(form);
    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      return;
    }

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/inicio", { replace: true });
    } catch (error) {
      setErroGeral(traduzirErroApi(error).mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Acesse a área da biblioteca.">
      <form onSubmit={onSubmit} noValidate className="auth-form">
        {estado?.cadastroConcluido && (
          <Alert variant="success">Cadastro realizado com sucesso! Faça login para continuar.</Alert>
        )}
        {erroGeral && <Alert variant="error">{erroGeral}</Alert>}

        <FormField
          id="email"
          label="E-mail"
          type="email"
          inputMode="email"
          value={form.email}
          onChange={(valor) => atualizar("email", valor)}
          autoComplete="email"
          error={erros.email}
          disabled={loading}
        />
        <FormField
          id="password"
          label="Senha"
          type="password"
          value={form.password}
          onChange={(valor) => atualizar("password", valor)}
          autoComplete="current-password"
          error={erros.password}
          disabled={loading}
        />

        <Button type="submit" loading={loading}>
          Entrar
        </Button>

        <p className="auth-footer">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
