type Props = {
  texto: string;
  rotulo: string;
};

export function TextoExpansivel({ texto, rotulo }: Props) {
  if (!texto.trim()) return <span className="muted">—</span>;

  return (
    <details className="expansivel">
      <summary>{rotulo}</summary>
      <p>{texto}</p>
    </details>
  );
}
