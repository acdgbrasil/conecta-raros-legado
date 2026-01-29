import { existsSync, readFileSync } from 'node:fs';

/**
 * Recupera um segredo ou variável de ambiente.
 * Otimizado para Bun Runtime.
 * 
 * Prioridade:
 * 1. Arquivo definido em <KEY>_FILE (ex: PG_PASSWORD_FILE)
 * 2. Variável de ambiente <KEY> (Bun.env)
 * 3. Valor padrão (defaultValue)
 */
export const getSecret = (key: string, defaultValue?: string): string => {
  // 1. Tenta ler do arquivo apontado pela variável _FILE (Docker Secrets Pattern)
  const fileEnvVar = `${key}_FILE`;
  // Bun.env é um objeto rápido, não uma chamada de sistema lenta
  const filePath = Bun.env[fileEnvVar];

  if (filePath) {
    try {
      if (existsSync(filePath)) {
        return readFileSync(filePath, 'utf-8').trim();
      }
    } catch (e) {
      console.warn(`[Secrets] Falha ao ler arquivo de segredo em ${filePath}: ${e}`);
    }
  }

  // 2. Fallback: Variável de ambiente direta
  const value = Bun.env[key];
  if (value !== undefined) {
    return value;
  }

  // 3. Valor padrão
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return '';
};
