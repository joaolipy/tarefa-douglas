import { useState, type SubmitEvent } from "react";
import type { FieldConfig, FieldOption } from "../resources/types";
import { Button } from "./Button";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";

type Props = {
  placeholder: string;
  initialSearch: string;
  filters: FieldConfig[];
  initialFilters: Record<string, string>;
  opcoes: Record<string, FieldOption[]>;
  onApply: (search: string, filtros: Record<string, string>) => void;
};

export function SearchBox({ placeholder, initialSearch, filters, initialFilters, opcoes, onApply }: Props) {
  const [termo, setTermo] = useState(initialSearch);
  const [valores, setValores] = useState<Record<string, string>>(initialFilters);

  function enviar(event: SubmitEvent) {
    event.preventDefault();
    onApply(termo.trim(), valores);
  }

  function limpar() {
    setTermo("");
    setValores({});
    onApply("", {});
  }

  function atualizar(nome: string, valor: string) {
    setValores((atual) => ({ ...atual, [nome]: valor }));
  }

  return (
    <form className="search-box" onSubmit={enviar} role="search">
      <div className="search">
        <input
          className="input"
          type="search"
          value={termo}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setTermo(event.target.value)}
        />
        <Button type="submit">Buscar</Button>
        <Button variant="secondary" onClick={limpar}>
          Limpar
        </Button>
      </div>

      {filters.length > 0 && (
        <fieldset className="filters">
          <legend>Filtros opcionais</legend>
          {filters.map((filtro) =>
            filtro.type === "select" ? (
              <SelectField
                key={filtro.name}
                id={`filtro-${filtro.name}`}
                label={filtro.label}
                placeholder="Todos"
                value={valores[filtro.name] ?? ""}
                options={filtro.options ?? opcoes[filtro.name] ?? []}
                onChange={(valor) => atualizar(filtro.name, valor)}
              />
            ) : (
              <FormField
                key={filtro.name}
                id={`filtro-${filtro.name}`}
                label={filtro.label}
                type={filtro.type === "number" ? "number" : "text"}
                inputMode={filtro.type === "number" ? "numeric" : "text"}
                placeholder={filtro.placeholder}
                value={valores[filtro.name] ?? ""}
                onChange={(valor) => atualizar(filtro.name, valor)}
              />
            ),
          )}
        </fieldset>
      )}
    </form>
  );
}
