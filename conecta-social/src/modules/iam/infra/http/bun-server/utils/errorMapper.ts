import { HttpError } from "../../../../../shared/http";

/**
 * Mapeia erros conhecidos do Domínio IAM para Erros HTTP Semânticos.
 * Baseado no handbook de Status HTTP.
 */
export function mapIamError(error: Error): HttpError {
  const msg = error.message;

  // --- 401 Unauthorized ---
  if (msg === "Invalid credentials or inactive account." || msg === "Invalid credentials.") {
    return new HttpError(401, "Credenciais inválidas ou conta inativa.");
  }
  if (msg === "JWT expired" || msg === "Invalid JWT signature") {
    return new HttpError(401, "Token de acesso expirado ou inválido.");
  }

  // --- 403 Forbidden ---
  if (msg.includes("Acesso negado")) {
    return new HttpError(403, msg);
  }

  // --- 404 Not Found ---
  if (msg === "User not found." || msg === "Target Role not found.") {
    return new HttpError(404, "Recurso não encontrado.");
  }

  // --- 409 Conflict ---
  if (msg.includes("already in use")) {
    return new HttpError(409, "Conflito: Este recurso já existe (ex: e-mail duplicado).");
  }

  // --- 400 Bad Request / 422 Unprocessable Content ---
  if (msg === "Invalid or expired recovery code.") {
    return new HttpError(400, "Código de recuperação inválido ou expirado.");
  }
  if (msg.includes("Validation Error")) {
    return new HttpError(400, msg); // Zod Errors
  }

  // Default: Retorna o erro original (será 500 no server se não for HttpError)
  // Mas se quisermos expor a mensagem do domínio como 400 por padrão (segurança vs usabilidade):
  // Vamos assumir que erros de domínio desconhecidos são regras de negócio quebradas (422/400).
  return new HttpError(400, msg);
}
