import { useEffect, useState } from "react";
import type { FieldOption, OptionsSource } from "../resources/types";
import { carregarOpcoes } from "../services/opcoesService";
import { traduzirErroApi } from "../utils/erroApi";

export interface FonteOpcoes {
  nome: string;
  source: OptionsSource;
}

interface EstadoOpcoes {
  opcoes: Record<string, FieldOption[]>;
  erro: string;
}

export function useOpcoes(fontes: FonteOpcoes[]): EstadoOpcoes {
  const [estado, setEstado] = useState<EstadoOpcoes>({ opcoes: {}, erro: "" });

  useEffect(() => {
    if (fontes.length === 0) return;

    let ativo = true;
    Promise.all(fontes.map(async (fonte) => [fonte.nome, await carregarOpcoes(fonte.source)] as const))
      .then((pares) => {
        if (ativo) setEstado({ opcoes: Object.fromEntries(pares), erro: "" });
      })
      .catch((error: unknown) => {
        if (ativo) setEstado({ opcoes: {}, erro: traduzirErroApi(error).mensagem });
      });

    return () => {
      ativo = false;
    };
  }, [fontes]);

  return estado;
}
