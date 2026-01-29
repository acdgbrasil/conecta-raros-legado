import type { Handler, HttpMethod } from "./types";

type RoutePattern = {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: Handler;
};

export class Router {
  // Otimização: Rotas estáticas continuam O(1)
  private staticRoutes = new Map<string, Handler>();
  
  // Rotas dinâmicas (ex: /users/:id)
  private dynamicRoutes: RoutePattern[] = [];

  private key(method: string, path: string): string {
    return `${method.toUpperCase()}:${path}`;
  }

  public register(method: HttpMethod, path: string, handler: Handler): void {
    // Se não tem ':', é estática
    if (!path.includes(":")) {
      this.staticRoutes.set(this.key(method, path), handler);
      return;
    }

    // Transforma /users/:id/posts em Regex
    // Captura os nomes dos parâmetros
    const keys: string[] = [];
    const pattern = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)"; // Captura qualquer coisa que não seja barra
    });

    this.dynamicRoutes.push({
      method: method.toUpperCase(),
      regex: new RegExp(`^${pattern}$`), // Match exato
      keys,
      handler
    });
  }

  public match(method: string, pathname: string): { handler: Handler; params: Record<string, string> } | undefined {
    const upperMethod = method.toUpperCase();

    // 1. Tenta match estático (Mais rápido)
    const staticHandler = this.staticRoutes.get(this.key(upperMethod, pathname));
    if (staticHandler) {
      return { handler: staticHandler, params: {} };
    }

    // 2. Tenta match dinâmico
    for (const route of this.dynamicRoutes) {
      if (route.method !== upperMethod) continue;

      const match = route.regex.exec(pathname);
      if (match) {
        // Reconstrói os params
        const params: Record<string, string> = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });

        return { handler: route.handler, params };
      }
    }

    return undefined;
  }
}

// Global singleton for simple usage
export const defaultRouter = new Router();

// Export facade for simple DX
export const register = (method: HttpMethod, path: string, handler: Handler) => {
  defaultRouter.register(method, path, handler);
};
