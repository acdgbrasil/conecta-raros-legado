/**
 * Converte uma string de data no formato "DD/MM/YYYY" para o formato "YYYY-MM-DDTHH:mm:ss+0000" (UTC).
 * A hora é definida como 00:00:00 UTC.
 * @param dataString A string da data a ser convertida (ex: "03/11/2020").
 * @returns A data formatada no padrão ISO 8601 com fuso horário UTC (+0000).
 */
export function converterDataStringParaIsoUtc(dataString: string): string {
  // 1. Dividir a string da data para obter dia, mês e ano.
  const partes: string[] = dataString.split('/');
  
  // Verifica se as partes são válidas
  if (partes.length !== 3) {
    throw new Error('Formato de data inválido. Use "DD/MM/YYYY".');
  }

  const dia: number = parseInt(partes[0], 10);
  // O mês é baseado em zero no objeto Date (0 para janeiro, 11 para dezembro).
  const mes: number = parseInt(partes[1], 10) - 1; 
  const ano: number = parseInt(partes[2], 10);

  // 2. Criar um objeto Date a partir das partes, usando Date.UTC para garantir que seja UTC.
  //    As horas, minutos e segundos são definidos como 0 para representar o início do dia em UTC.
  const data: Date = new Date(Date.UTC(ano, mes, dia, 0, 0, 0));

  // 3. Função auxiliar para garantir que números menores que 10 tenham um zero à esquerda.
  const pad = (num: number): string => num < 10 ? '0' + num : num.toString();

  const anoFormatado: string = data.getUTCFullYear().toString();
  const mesFormatado: string = pad(data.getUTCMonth() + 1); // Mês + 1 porque é baseado em zero.
  const diaFormatado: string = pad(data.getUTCDate());
  const horasFormatadas: string = pad(data.getUTCHours());
  const minutosFormatados: string = pad(data.getUTCMinutes());
  const segundosFormatados: string = pad(data.getUTCSeconds());

  // O fuso horário "+0000" indica UTC.
  const fusoHorario: string = '+0000';

  return `${anoFormatado}-${mesFormatado}-${diaFormatado}T${horasFormatadas}:${minutosFormatados}:${segundosFormatados}${fusoHorario}`;
}

// Exemplo de uso:
const dataOriginal: string = "03/11/2020";
try {
  const dataConvertida: string = converterDataStringParaIsoUtc(dataOriginal);
  console.log(dataConvertida); // Saída esperada: "2020-11-03T00:00:00+0000"
} catch (error: any) {
  console.error(error.message);
}

// ---

/**
 * Converte uma string de data no formato "DD/MM/YYYY" para o formato "YYYY-MM-DDTHH:mm:ss+0000",
 * utilizando a hora atual do momento da conversão.
 * @param dataString A string da data a ser convertida (ex: "03/11/2020").
 * @returns A data formatada no padrão ISO 8601 com a hora atual e fuso horário UTC (+0000).
 */
function converterDataStringComHoraAtualParaIsoUtc(dataString: string): string {
  const partes: string[] = dataString.split('/');
  
  if (partes.length !== 3) {
    throw new Error('Formato de data inválido. Use "DD/MM/YYYY".');
  }

  const dia: number = parseInt(partes[0], 10);
  const mes: number = parseInt(partes[1], 10) - 1;
  const ano: number = parseInt(partes[2], 10);

  // Cria um objeto Date com a data fornecida e a hora atual do sistema local.
  const dataLocal: Date = new Date();
  dataLocal.setFullYear(ano);
  dataLocal.setMonth(mes);
  dataLocal.setDate(dia);
  
  // Para obter a representação em UTC da hora atual definida na dataLocal:
  // Cria um novo objeto Date com os componentes da dataLocal em UTC.
  const dataUtc: Date = new Date(Date.UTC(
    dataLocal.getFullYear(),
    dataLocal.getMonth(),
    dataLocal.getDate(),
    dataLocal.getHours(),
    dataLocal.getMinutes(),
    dataLocal.getSeconds(),
    dataLocal.getMilliseconds()
  ));

  const pad = (num: number): string => num < 10 ? '0' + num : num.toString();

  const anoFormatado: string = dataUtc.getUTCFullYear().toString();
  const mesFormatado: string = pad(dataUtc.getUTCMonth() + 1);
  const diaFormatado: string = pad(dataUtc.getUTCDate());
  const horasFormatadas: string = pad(dataUtc.getUTCHours());
  const minutosFormatadas: string = pad(dataUtc.getUTCMinutes());
  const segundosFormatadas: string = pad(dataUtc.getUTCSeconds());

  const fusoHorario: string = '+0000';

  return `${anoFormatado}-${mesFormatado}-${diaFormatado}T${horasFormatadas}:${minutosFormatadas}:${segundosFormatadas}${fusoHorario}`;
}