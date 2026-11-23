import { Button } from "./Button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, onChange }: Props) {
  return (
    <nav className="pagination" aria-label="Paginação">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span>
        Página {page} de {totalPages} · {total} {total === 1 ? "registro" : "registros"}
      </span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Próxima
      </Button>
    </nav>
  );
}
