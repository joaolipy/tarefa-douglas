import type { ChangeEvent } from "react";

type Props = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function CheckboxField({ id, label, checked, onChange, disabled }: Props) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
