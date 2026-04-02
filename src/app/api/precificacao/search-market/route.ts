import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, year } = await req.json();

    if (!name || !year) {
      return NextResponse.json({ success: false, error: "Nome e Ano do veículo são necessários." }, { status: 400 });
    }

    const query = `${name} ${year} preço anunciar site:webmotors.com.br OR site:olx.com.br OR site:icarros.com.br OR site:facebook.com`;
    
    const apiKey = process.env.SERPER_API_KEY;
    
    interface PlatformData {
        total: number;
        count: number;
        avg: number;
        prices: number[];
    }

    const platformSummaries: Record<string, PlatformData> = {
        webmotors: { total: 0, count: 0, avg: 0, prices: [] },
        olx: { total: 0, count: 0, avg: 0, prices: [] },
        icarros: { total: 0, count: 0, avg: 0, prices: [] },
        facebook: { total: 0, count: 0, avg: 0, prices: [] }
    };

    if (apiKey) {
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
        
        results.forEach((item: any) => {
            const snippet = item.snippet || "";
            const title = item.title || "";
            const url = item.link || "";
            const textToSearch = `${title} ${snippet}`;
            
            const priceRegex = /R\$\s?(\d{2,3}\.?\d{3})/g;
            let match;
            
            let platform = "outros";
            if (url.includes("webmotors.com.br")) platform = "webmotors";
            else if (url.includes("olx.com.br")) platform = "olx";
            else if (url.includes("icarros.com.br")) platform = "icarros";
            else if (url.includes("facebook.com")) platform = "facebook";

            if (platformSummaries[platform]) {
                while ((match = priceRegex.exec(textToSearch)) !== null) {
                    const val = parseInt(match[1].replace(/\./g, ""));
                    if (val > 10000) {
                        platformSummaries[platform].prices.push(val);
                        platformSummaries[platform].total += val;
                        platformSummaries[platform].count += 1;
                    }
                }
            }
        });

        // Calcular médias
        Object.keys(platformSummaries).forEach(k => {
            const p = platformSummaries[k];
            if (p.count > 0) p.avg = Math.round(p.total / p.count);
        });

        return NextResponse.json({
            success: true,
            platformSummaries
        });

    } else {
        // MOCK DATA PARA DEMONSTRAÇÃO (Baseado em Corolla 2020)
        const mock: Record<string, any> = {
            webmotors: { avg: 122500, count: 4, prices: [121000, 123000, 122000, 124000] },
            olx: { avg: 118900, count: 6, prices: [115000, 119000, 117000, 121000, 118500, 123000] },
            icarros: { avg: 124000, count: 2, prices: [123500, 124500] },
            facebook: { avg: 115500, count: 3, prices: [112000, 116000, 118500] }
        };

        return NextResponse.json({
            success: false,
            needsApiKey: true,
            message: "Configuração de IA necessária. Para buscas REAIS, adicione a chave SERPER_API_KEY.",
            platformSummaries: mock
        });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Erro ao processar pesquisa: " + error.message }, { status: 500 });
  }
}
