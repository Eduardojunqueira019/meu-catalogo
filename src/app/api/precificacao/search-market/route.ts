import { NextResponse } from "next/server";

/**
 * API DE PESQUISA DE MERCADO AUTOMOTIVA (IA)
 * -----------------------------------------
 * Esta rota simula ou utiliza uma API de busca (como Serper.dev)
 * para encontrar anúncios reais em sites como WebMotors, OLX e iCarros.
 */

export async function POST(req: Request) {
  try {
    const { name, year } = await req.json();

    if (!name || !year) {
      return NextResponse.json({ success: false, error: "Nome e Ano do veículo são necessários." }, { status: 400 });
    }

    // 1. Definir a consulta de busca focada em marketplaces brasileiros
    const query = `${name} ${year} preço anunciar site:webmotors.com.br OR site:olx.com.br OR site:icarros.com.br`;
    
    // NOTA: Para produção, o ideal é usar uma chave de API do Serper.dev ou Google Search API.
    // Como estamos implementando agora, vou usar um "Scraper Lite" ou Instruções de Integração.
    
    const apiKey = process.env.SERPER_API_KEY;
    
    if (apiKey) {
        // INTEGRAÇÃO REAL COM SERPER.DEV
        const serperRes = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ q: query, gl: "br", hl: "pt-br" })
        });
        
        const data = await serperRes.json();
        const results = data.organic || [];
        
        const prices: number[] = [];
        const sources: { title: string, url: string, price: number }[] = [];

        results.forEach((item: any) => {
            const snippet = item.snippet || "";
            const title = item.title || "";
            const textToSearch = `${title} ${snippet}`;
            
            // Regex para capturar valores de R$ (ex: R$ 85.000, 85k, 85.000,00)
            const priceRegex = /R\$\s?(\d{2,3}\.?\d{3})/g;
            let match;
            while ((match = priceRegex.exec(textToSearch)) !== null) {
                const val = parseInt(match[1].replace(/\./g, ""));
                if (val > 10000 && !prices.includes(val)) {
                    prices.push(val);
                    sources.push({ title, url: item.link, price: val });
                }
            }
        });

        return NextResponse.json({
            success: true,
            prices: prices.slice(0, 15),
            sources: sources.slice(0, 15)
        });

    } else {
        // FALLBACK: Caso não tenha chave, vamos realizar um SCRAPE manual leve ou retornar um aviso.
        // Simulando resultados REAIS baseados em análise de mercado (Demonstração)
        // Em um sistema real, o usuário deve configurar a chave SERPER_API_KEY no .env.
        
        return NextResponse.json({
            success: false,
            needsApiKey: true,
            message: "Configuração de IA necessária. Para buscas REAIS, adicione a chave SERPER_API_KEY ao seu arquivo .env.",
            // Exemplos reais configurados para demonstrar o visual (Baseados no Corolla XEi 2020)
            mockData: [122800, 118900, 121500, 115000, 125900, 119900, 117500, 128000, 114900, 122000]
        });
    }

  } catch (error: any) {
    console.error("Erro na busca de mercado:", error);
    return NextResponse.json({ success: false, error: "Erro ao processar pesquisa: " + error.message }, { status: 500 });
  }
}
