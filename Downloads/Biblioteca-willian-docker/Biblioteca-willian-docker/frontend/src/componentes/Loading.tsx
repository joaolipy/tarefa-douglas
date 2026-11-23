type Props = { texto?: string };

export function Loading({ texto = "Carregando..." }: Props) {
  return (
    <div className="loading" role="status">
      {texto}
    </div>
  );
}
