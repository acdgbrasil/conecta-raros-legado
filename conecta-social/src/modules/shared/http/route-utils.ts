import type { RouteDefinition } from "../../../modules/iam/interface/http/types/types";

// Tipo genérico para mapas de rota (RouteDefinition precisa ser importado ou redeclarado se quiser desacoplar totalmente)
// Para simplificar e evitar dependência circular, vamos usar 'any' ou redefinir a parte relevante do tipo aqui, 
// ou melhor, importar do módulo de tipos compartilhados se existisse.
// Como não existe um types.ts compartilhado ainda, vou usar um tipo compatível com o Bun.

type RouteMap = Record<string, RouteDefinition>;

/**
 * Prefixa todas as chaves de um mapa de rotas com um caminho base.
 * Garante compatibilidade com o objeto plano de rotas do Bun.serve.
 * 
 * @param prefix O prefixo a ser adicionado (ex: "/iam")
 * @param routes O mapa de rotas original
 */
export function prefixRoutes(prefix: string, routes: RouteMap): RouteMap {
  const prefixed: RouteMap = {};
  
  // Normaliza o prefixo (remove barra final)
  const cleanPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

  for (const [path, handler] of Object.entries(routes)) {
    // Garante barra inicial no caminho
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // Concatena: /prefix + /path -> /prefix/path
    prefixed[`${cleanPrefix}${cleanPath}`] = handler;
  }
  
  return prefixed;
}