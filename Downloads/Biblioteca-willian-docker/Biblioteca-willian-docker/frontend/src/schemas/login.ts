import { z } from "zod";
import { isValidEmail } from "../utils/validators";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "O e-mail é obrigatório.").refine(isValidEmail, "Informe um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type LoginErros = Partial<Record<keyof LoginForm, string>>;

export function validarLogin(valores: LoginForm): LoginErros {
  const erros: LoginErros = {};
  const resultado = loginSchema.safeParse(valores);
  if (!resultado.success) {
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as keyof LoginForm;
      if (!erros[campo]) erros[campo] = issue.message;
    }
  }
  return erros;
}
