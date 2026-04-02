/**
 * ESPECIALISTA EM PRECIFICAÇÃO AUTOMOTIVA
 * Versão: 1.0 (Brasil - Mercado de Revenda)
 */

export interface PricingInput {
  veiculo: string;
  ano: number;
  versao: string;
  km: number;
  fipe: number;
  precos_mercado: number[];
}

export interface PricingAnalysis {
  veiculo: string;
  fipe: number;
  media_mercado: number;
  percentil_25: number;
  percentil_75: number;
  classificacao: "FORTE" | "NORMAL" | "FRACO";
  estrategia_compra: "90%" | "85%" | "80%";
  preco_compra_sugerido: number;
  margem_estimada: number;
  liquidez: "ALTA" | "MEDIA" | "BAIXA";
  analise_resumida: string;
  riscos: string[];
}

export function analyzePricing(input: PricingInput): PricingAnalysis {
  // 1. Limpeza de Outliers (Lógica baseada em Desvio Padrão)
  const initialPrices = input.precos_mercado.filter(p => p > 0);
  if (initialPrices.length === 0) throw new Error("Lista de preços do mercado está vazia.");

  const mean = initialPrices.reduce((a, b) => a + b, 0) / initialPrices.length;
  const stdDev = Math.sqrt(initialPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / initialPrices.length);
  
  // Remover qualquer valor fora de 2.5 desvios padrão (para não ser agressivo demais)
  const cleanedPrices = initialPrices.filter(p => Math.abs(p - mean) <= 2.5 * stdDev).sort((a, b) => a - b);
  
  const finalMean = cleanedPrices.reduce((a, b) => a + b, 0) / cleanedPrices.length;
  
  // 2. Percentis
  const getPercentile = (arr: number[], q: number) => {
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (arr[base + 1] !== undefined) {
      return arr[base] + rest * (arr[base + 1] - arr[base]);
    } else {
      return arr[base];
    }
  };

  const p25 = getPercentile(cleanedPrices, 0.25);
  const p75 = getPercentile(cleanedPrices, 0.75);

  // 3. Classificação de Mercado
  let classificacao: "FORTE" | "NORMAL" | "FRACO" = "NORMAL";
  const fipeDiff = (finalMean - input.fipe) / input.fipe;

  if (fipeDiff > 0.03) classificacao = "FORTE";
  else if (fipeDiff < -0.03) classificacao = "FRACO";
  else classificacao = "NORMAL";

  // 4. Estratégia de Compra
  let percentualCompra = 0.85;
  let estrategiaDesc: "90%" | "85%" | "80%" = "85%";

  if (classificacao === "FORTE") {
    percentualCompra = 0.90;
    estrategiaDesc = "90%";
  } else if (classificacao === "FRACO") {
    percentualCompra = 0.80;
    estrategiaDesc = "80%";
  }

  let precoCompraSugerido = input.fipe * percentualCompra;

  // 5. Proteção de Risco (Regra 88%)
  const riskThreshold = finalMean * 0.88;
  if (precoCompraSugerido > riskThreshold) {
    precoCompraSugerido = riskThreshold;
  }

  // 6. Margem e Liquidez
  const margem = ((finalMean - precoCompraSugerido) / finalMean) * 100;
  
  let liquidez: "ALTA" | "MEDIA" | "BAIXA" = "MEDIA";
  if (classificacao === "FORTE" && input.km < 60000) liquidez = "ALTA";
  if (classificacao === "FRACO") liquidez = "BAIXA";

  // 7. Análise Narrativa
  let analise_resumida = "";
  if (classificacao === "FORTE") {
      analise_resumida = `${input.veiculo} apresenta valorização acima da FIPE, indicando alta demanda ou baixa oferta. Revenda facilitada.`;
  } else if (classificacao === "FRACO") {
      analise_resumida = `Mercado saturado para o ${input.veiculo}. Preços abaixo da FIPE exigem compra agressiva para garantir margem.`;
  } else {
      analise_resumida = `Veículo com comportamento estável dentro da média FIPE. Margem operacional padrão de mercado.`;
  }

  // 8. Riscos
  const riscos: string[] = [];
  if (input.km > 100000) riscos.push("Alta quilometragem reduz grupo de compradores.");
  if (classificacao === "FRACO") riscos.push("Baixa liquidez: estoque pode ficar parado.");
  if (margem < 12) riscos.push("Margem operacional apertada; pouco espaço para repasse.");
  if (cleanedPrices.length < 5) riscos.push("Amostragem de mercado pequena; preço pode variar.");

  return {
    veiculo: input.veiculo,
    fipe: input.fipe,
    media_mercado: Math.round(finalMean),
    percentil_25: Math.round(p25),
    percentil_75: Math.round(p75),
    classificacao,
    estrategia_compra: estrategiaDesc,
    preco_compra_sugerido: Math.round(precoCompraSugerido),
    margem_estimada: Number(margem.toFixed(2)),
    liquidez,
    analise_resumida,
    riscos
  };
}
