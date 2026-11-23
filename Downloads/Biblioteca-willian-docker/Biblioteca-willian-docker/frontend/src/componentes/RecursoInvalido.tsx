import { Link } from "react-router-dom";
import { Alert } from "./Alert";

export function RecursoInvalido() {
  return (
    <>
      <Alert variant="error">Página não encontrada.</Alert>
      <p>
        <Link to="/inicio">Voltar ao início</Link>
      </p>
    </>
  );
}
