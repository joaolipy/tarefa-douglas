import { Link, Outlet, useNavigate } from "react-router-dom";
import { LISTA_RECURSOS } from "../resources";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";
import { NavBar } from "./NavBar";

const ITENS_MENU = [
  { to: "/inicio", rotulo: "Início" },
  ...LISTA_RECURSOS.map((recurso) => ({ to: `/${recurso.key}`, rotulo: recurso.titulo })),
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/inicio" className="brand">
          📚 Biblioteca
        </Link>
        <NavBar itens={ITENS_MENU} />
        <div className="user-box">
          <Link to="/perfil" className="user-name">
            {user?.nome}
          </Link>
          <Button variant="secondary" onClick={sair}>
            Sair
          </Button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
