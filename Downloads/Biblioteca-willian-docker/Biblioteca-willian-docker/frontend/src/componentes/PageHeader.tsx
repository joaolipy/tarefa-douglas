import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
};

export function PageHeader({ titulo, descricao, acoes }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {acoes && <div className="page-actions">{acoes}</div>}
    </header>
  );
}
