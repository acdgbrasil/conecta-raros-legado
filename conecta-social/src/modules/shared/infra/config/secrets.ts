import fs from 'node:fs';

/**
 * Recupera um segredo ou variável de ambiente.
 * Prioridade:
 * 1. Arquivo definido em <KEY>_FILE (ex: PG_PASSWORD_FILE)
 * 2. Arquivo padrão em /run/secrets/<key_lowercase> (se for ambiente Docker Swarm/Secrets padrão)
 * 3. Variável de ambiente <KEY>
 * 4. Valor padrão (defaultValue)
 */
export const getSecret = (key: string, defaultValue?: string): string => {
  // 1. Tenta ler do arquivo apontado pela variável _FILE
  const fileEnvVar = `${key}_FILE`;
  if (process.env[fileEnvVar]) {
    const filePath = process.env[fileEnvVar];
    try {
      if (fs.existsSync(filePath!)) {
        return fs.readFileSync(filePath!, 'utf-8').trim();
      }
    } catch (e) {
      console.warn(`[Secrets] Falha ao ler arquivo de segredo em ${filePath}: ${e}`);
    }
  }

  // 2. Fallback: Variável de ambiente direta
  if (process.env[key]) {
    return process.env[key]!;
  }

  // 3. Valor padrão
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return '';
};
