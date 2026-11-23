import { isAxiosError } from "axios";

export interface ErroApi {
  mensagem: string;
  campos: Record<string, string>;
}

interface CorpoErroApi {
  message?: string;
  errors?: Record<string, string>;
}

export function traduzirErroApi(error: unknown): ErroApi {
  if (!isAxiosError<CorpoErroApi>(error)) {
    return { mensagem: "Ocorreu um erro inesperado. Tente novamente.", campos: {} };
  }

  if (!error.response) {
    return {
      mensagem: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      campos: {},
    };
  }

  const { status, data } = error.response;
  const campos = data?.errors ?? {};
  const mensagemApi = data?.message;

  if (status === 400) {
    return { mensagem: "Alguns dados estão inválidos. Corrija os campos destacados.", campos };
  }
  if (status === 401) {
    return { mensagem: mensagemApi ?? "E-mail ou senha inválidos.", campos: {} };
  }
  if (status === 403) {
    return { mensagem: mensagemApi ?? "Você não tem permissão para esta ação.", campos: {} };
  }
  if (status === 404) {
    return { mensagem: mensagemApi ?? "O registro não foi encontrado. Ele pode ter sido removido.", campos: {} };
  }
  if (status === 409) {
    return { mensagem: mensagemApi ?? "Já existe um cadastro com os dados informados.", campos };
  }
  if (status >= 500) {
    return { mensagem: "O servidor está com problemas no momento. Tente novamente em instantes.", campos: {} };
  }

  return { mensagem: mensagemApi ?? "Não foi possível concluir a operação.", campos };
}
