import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// --- Configuração ---
const ROOT_DIR = process.cwd();
const OUTPUT_FILE = join(ROOT_DIR, "conecta-social-front/public/data/transparency.json");
const MATURITY_CSV = join(ROOT_DIR, "tooling/mature_table_csv/planilha-maturidade-dados - 5.Dados.csv");
const SECURITY_REPORT = join(ROOT_DIR, "security-report.json");
const PACKAGE_JSON = join(ROOT_DIR, "package.json");

// --- Interfaces ---
interface MaturityTheme {
  id: string;
  name: string;
  level: number;
  status: string;
}

interface MaturityDimension {
  name: string;
  themes: MaturityTheme[];
}

interface TransparencyData {
  service: {
    status: string;
    last_update: string;
    version: string;
  };
  governance: {
    data_maturity: {
      updated_at: string;
      dimensions: MaturityDimension[];
    };
    security_audit: {
      scanned_at: string;
      status: string;
      summary?: any;
    };
  };
  links: {
    fala_br: string;
    dados_abertos: string;
  };
}

// --- Helpers ---
function parseMaturityCSV(filePath: string): MaturityDimension[] {
  if (!existsSync(filePath)) {
    console.warn(`⚠️ CSV de maturidade não encontrado em: ${filePath}`);
    return [];
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter(l => l.trim() !== "");
  const dimensionsMap = new Map<string, MaturityTheme[]>();

  // Pula o cabeçalho (linha 0)
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(","); // Parse simples de CSV (assumindo sem vírgulas no texto)
    if (cols.length < 10) continue;

    const id = cols[0].trim();
    const themeName = cols[1].trim();
    const level = parseInt(cols[2].trim()) || 0;
    const descLevel = cols[3].trim();
    const dimName = cols[9].trim(); // Coluna J (DIMENSÃO)

    if (!dimName) continue;

    const theme: MaturityTheme = {
      id,
      name: themeName,
      level,
      status: descLevel
    };

    if (!dimensionsMap.has(dimName)) {
      dimensionsMap.set(dimName, []);
    }
    dimensionsMap.get(dimName)?.push(theme);
  }

  const result: MaturityDimension[] = [];
  dimensionsMap.forEach((themes, name) => {
    result.push({ name, themes });
  });

  return result;
}

function getSecurityStatus(filePath: string): { status: string, summary: any } {
  if (!existsSync(filePath)) {
    return { status: "Não Auditado", summary: null };
  }

  try {
    const report = JSON.parse(readFileSync(filePath, "utf-8"));
    // Lógica simples: Se tiver vulnerabilidades CRITICAL, status é Alerta
    // Adapte conforme a estrutura real do Trivy JSON
    const hasCritical = JSON.stringify(report).includes("CRITICAL");
    
    return {
      status: hasCritical ? "Em Correção" : "Conforme",
      summary: {
        tool: "Trivy",
        scan_type: "Filesystem"
      }
    };
  } catch (e) { return { status: "Erro na Leitura", summary: null }; }
}

// --- Main ---
function main() {
  console.log("🚀 Gerando dados de transparência...");

  // 1. Versão
  let version = "0.0.0";
  try {
    // Tenta pegar do package.json da raiz (se existir) ou define um padrão
    if (existsSync(PACKAGE_JSON)) {
        const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8"));
        version = pkg.version || version;
    }
  } catch (e) { console.error("Erro ao ler versão", e); }

  // 2. Maturidade
  const maturityDimensions = parseMaturityCSV(MATURITY_CSV);

  // 3. Segurança
  const securityInfo = getSecurityStatus(SECURITY_REPORT);

  // 4. Montar JSON
  const data: TransparencyData = {
    service: {
      status: "Operacional", // Idealmente viria de um healthcheck real
      last_update: new Date().toISOString(),
      version: version
    },
    governance: {
      data_maturity: {
        updated_at: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        dimensions: maturityDimensions
      },
      security_audit: {
        scanned_at: new Date().toISOString(),
        status: securityInfo.status,
        summary: securityInfo.summary
      }
    },
    links: {
      fala_br: "https://falabr.cgu.gov.br",
      dados_abertos: "/dados/abertos"
    }
  };

  // 5. Salvar
  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Arquivo gerado com sucesso: ${OUTPUT_FILE}`);
}

main();
