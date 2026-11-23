import { Link } from "react-router-dom";
import { PageHeader } from "../componentes/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { LISTA_RECURSOS } from "../resources";

type AtalhoProps = { to: string; titulo: string; descricao: string };

function AtalhoCard({ to, titulo, descricao }: AtalhoProps) {
  return (
    <Link to={to} className="card shortcut">
      <strong>{titulo}</strong>
      <span>{descricao}</span>
    </Link>
  );
}

export function InicioPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader titulo={`Olá, ${user?.nome ?? ""}!`} descricao="O que você quer fazer hoje?" />
      <section className="grid">
        {LISTA_RECURSOS.map((recurso) => (
          <AtalhoCard key={recurso.key} to={`/${recurso.key}`} titulo={recurso.titulo} descricao={recurso.descricao} />
        ))}
        <AtalhoCard to="/perfil" titulo="Meu perfil" descricao="Atualize seu nome, CPF e senha." />
      </section>
    </>
  );
}
