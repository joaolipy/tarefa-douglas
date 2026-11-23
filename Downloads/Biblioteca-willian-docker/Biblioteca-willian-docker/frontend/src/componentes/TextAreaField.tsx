import type { ChangeEvent } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
};

export function TextAreaField({ id, label, value, onChange, placeholder, error, disabled, rows = 5 }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={error ? "input textarea input-error" : "input textarea"}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      />
      {error && (
        <span id={`${id}-erro`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
