import type { ReactNode } from "react";

export type FormMode = "create" | "edit";
export type FormValues = Record<string, string | boolean>;
export type FieldType = "text" | "number" | "decimal" | "textarea" | "select" | "checkbox";

export interface ResourceItem {
  id: number;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface OptionsSource {
  path: string;
  labelKey: string;
  label?: (item: Record<string, unknown>) => string;
  params?: Record<string, string | number | boolean>;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  min?: number;
  mode?: FormMode;
  options?: FieldOption[];
  optionsSource?: OptionsSource;
  mask?: (valor: string) => string;
  showWhen?: (values: FormValues) => boolean;
  validate?: (valor: string, values: FormValues) => string | undefined;
}

export interface ColumnConfig<T> {
  header: string;
  render: (item: T) => ReactNode;
  linkTo?: (item: T) => string;
  expandable?: boolean;
  expandLabel?: string;
}

export interface ResourceDefinition<T extends ResourceItem> {
  key: string;
  titulo: string;
  singular: string;
  descricao: string;
  placeholderBusca: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  filters?: FieldConfig[];
  initialValues: FormValues;
  toFormValues: (item: T) => FormValues;
  toPayload: (values: FormValues, mode: FormMode) => Record<string, unknown>;
}

export type ResourceConfig = ResourceDefinition<ResourceItem>;

export function defineResource<T extends ResourceItem>(definition: ResourceDefinition<T>): ResourceConfig {
  return definition as unknown as ResourceConfig;
}
