import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
}: Props) {
  return (
    <button type={type} className={`btn btn-${variant}`} disabled={loading || disabled} onClick={onClick}>
      {loading ? "Aguarde..." : children}
    </button>
  );
}
