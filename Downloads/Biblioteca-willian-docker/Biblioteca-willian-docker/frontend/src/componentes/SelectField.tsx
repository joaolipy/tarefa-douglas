import type { ChangeEvent } from "react";
import type { FieldOption } from "../resources/types";

type Props = {
  id: string;
  label: string;
  value: string;
  options: FieldOption[];
  onChange: (valor: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function SelectField({ id, label, value, options, onChange, error, disabled, placeholder = "Selecione..." }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={error ? "input input-error" : "input"}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
