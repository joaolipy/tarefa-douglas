import { api } from "../api/axios";
import type { Page } from "../types";
import type { FieldOption, OptionsSource } from "../resources/types";

export async function carregarOpcoes(source: OptionsSource): Promise<FieldOption[]> {
  const resposta = await api.get<Page<Record<string, unknown>>>(source.path, {
    params: { limit: 100, ...source.params },
  });
  return resposta.data.data.map((item) => ({
    value: String(item.id),
    label: source.label ? source.label(item) : String(item[source.labelKey] ?? item.id),
  }));
}
