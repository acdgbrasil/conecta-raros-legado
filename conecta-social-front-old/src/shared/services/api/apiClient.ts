// src/shared/services/http-client.ts

// Lógica para definir a URL Base correta dependendo se estamos no Servidor (SSR) ou Cliente
let BASE_URL = "";

if (import.meta.env.SSR) {
  // DENTRO DO DOCKER (Server-Side):
  // O frontend precisa falar com o backend diretamente pelo nome do serviço na rede Docker.
  // Fallback para env var se existir, senão usa o nome do serviço padrão.
  BASE_URL = process.env.INTERNAL_API_URL || "http://backend:3000";
} else {
  // NO NAVEGADOR (Client-Side):
  // Usa a URL pública definida no .env ou localhost
  BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Opções para configuração da requisição HTTP.
 */
interface RequestOptions {
  /**
   * Cabeçalhos adicionais para a requisição.
   * O 'Content-Type: application/json' é adicionado automaticamente se houver corpo.
   */
  headers?: Record<string, string>;
  /**
   * Parâmetros de consulta (Query Params) que serão adicionados à URL.
   * Ex: { page: 1, limit: 10 } virá "?page=1&limit=10"
   */
  params?: Record<string, string | number | boolean>;
  /**
   * Token de autenticação (JWT).
   * Se fornecido, será adicionado automaticamente ao header 'Authorization' no formato 'Bearer <token>'.
   */
  token?: string;
}

/**
 * Cliente HTTP genérico para comunicação com a API.
 * Responsável por montar requisições, gerenciar headers padrões e tratar erros básicos.
 */
export const HttpClient = {
  /**
   * Realiza uma requisição HTTP genérica.
   * 
   * @template T - O tipo esperado da resposta.
   * @param {string} endpoint - O caminho completo do recurso (ex: "/api/auth/login" ou "/reference-persons").
   * @param {HttpMethod} method - O método HTTP a ser utilizado (GET, POST, etc).
   * @param {unknown} [body] - O corpo da requisição (para POST, PUT, etc). Será convertido para JSON.
   * @param {RequestOptions} [options] - Opções adicionais como headers, query params e token.
   * @returns {Promise<T>} Uma promessa que resolve com os dados da resposta tipados como T.
   */
  async request<T>(
    endpoint: string,
    method: HttpMethod,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    
    // Construção robusta: garante que não haverá duplicidade de barras
    const baseUrlClean = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const endpointClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrlClean}${endpointClean}`);
    console.log(`📡 [HttpClient] Fetching: ${method} ${url.toString()}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {
      ...options.headers,
    };
    
    if (body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    // Injeta o Bearer Token se o serviço do módulo passar
    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      console.error(`[Http Error] ${method} ${endpoint}:`, error);
      throw error;
    }
  },

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "GET", undefined, options);
  },

  post<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, "POST", body, options);
  },

  put<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, "PUT", body, options);
  },

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "DELETE", undefined, options);
  },
};
