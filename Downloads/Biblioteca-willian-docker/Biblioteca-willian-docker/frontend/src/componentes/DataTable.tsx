import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { TextoExpansivel } from "./TextoExpansivel";

export type DataColumn<T> = {
  header: string;
  render: (item: T) => ReactNode;
  linkTo?: (item: T) => string;
  expandable?: boolean;
  expandLabel?: string;
};

type Props<T extends { id: number }> = {
  columns: DataColumn<T>[];
  rows: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
};

function renderCell<T>(column: DataColumn<T>, row: T): ReactNode {
  const conteudo = column.render(row);

  if (column.expandable) {
    return <TextoExpansivel texto={typeof conteudo === "string" ? conteudo : ""} rotulo={column.expandLabel ?? "Ler"} />;
  }
  if (column.linkTo) {
    return <Link to={column.linkTo(row)}>{conteudo}</Link>;
  }
  return conteudo;
}

export function DataTable<T extends { id: number }>({ columns, rows, onEdit, onDelete }: Props<T>) {
  if (rows.length === 0) {
    return <p className="empty">Nenhum registro encontrado.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
            <th className="table-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.header}>{renderCell(column, row)}</td>
              ))}
              <td className="table-actions">
                <Button variant="secondary" onClick={() => onEdit(row)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => onDelete(row)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
