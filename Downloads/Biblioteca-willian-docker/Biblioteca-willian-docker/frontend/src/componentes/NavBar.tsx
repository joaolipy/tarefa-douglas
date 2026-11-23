import { NavLink } from "react-router-dom";

type Item = { to: string; rotulo: string };

type Props = { itens: Item[] };

export function NavBar({ itens }: Props) {
  return (
    <nav className="navbar" aria-label="Navegação principal">
      {itens.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          {item.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
