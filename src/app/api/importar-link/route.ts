import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ success: false, error: "Link inválido ou não seguro." }, { status: 400 });
    }

    // Usar um pacote Request para "fingir" ser um navegador
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!res.ok) {
       return NextResponse.json({ success: false, error: "O site bloqueou nosso robô de leitura (Status: " + res.status + ")." }, { status: 500 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Extração Base (Metatags Sociais)
    let title = $('meta[property="og:title"]').attr("content") || $("title").text();
    let image = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");
    let description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content");
    
    let price = "";
    let year = "";
    let km = "";

    // 2. Extração Profunda (Microdados JSON-LD de SEO)
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (jsonText) {
          const data = JSON.parse(jsonText);

          const extractFields = (obj: any) => {
              if (!obj) return;
              if (obj.price) price = String(obj.price);
              if (obj.offers && obj.offers.price) price = String(obj.offers.price);
              if (obj.productionDate || obj.modelDate) year = String(obj.productionDate || obj.modelDate);
              if (obj.mileageFromOdometer) km = typeof obj.mileageFromOdometer === 'object' ? String(obj.mileageFromOdometer.value) : String(obj.mileageFromOdometer);
              if (obj.image && !image) image = typeof obj.image === 'object' ? obj.image[0] : obj.image;
          };

          if (Array.isArray(data)) {
             data.forEach(d => extractFields(d));
          } else {
             extractFields(data);
          }
        }
      } catch (e) {
         // ignorar json inválido
      }
    });

    // 3. Fallbacks Avançados (Agência Campos e outros Títulos Padronizados)
    // Tenta Quebrar um Título estilo "Nome Completo 2015/2015 - 150.000 km"
    const titleRegex = /(.+?)\s+(\d{4}\/\d{4}|\d{4})\s*-\s*([\d.]+)\s*km/i;
    const titleMatch = title.match(titleRegex);
    
    if (titleMatch) {
       title = titleMatch[1]; // Mantém só o Nome
       if (!year) year = titleMatch[2].split("/")[0]; // "2015/2015" vira "2015"
       if (!km) km = titleMatch[3].replace(/\./g, ""); // "150.000" vira "150000"
    }

    // Busca Forçada de Preço no Html se não achou no JSON-LD
    if (!price) {
        $("h1, h2, h3, h4, strong, span, div, p").each((_, el) => {
          const t = $(el).text().trim();
          if (t.includes("R$") && /\d/.test(t) && t.length < 25) {
             const nums = t.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".");
             if (parseFloat(nums) > 1000) { price = nums; return false; } // Quebra o loop se achou
          }
        });
    }

    // Filtros de Limpeza
    if (price) {
        price = price.replace(/[^\d.,]/g, "");
    }

    // Busca Avançada de Múltiplas Imagens (Galeria)
    const images: string[] = [];
    if (image) images.push(image);

    $("a, img, div").each((_, el) => {
        const href = $(el).attr("href");
        const src = $(el).attr("src") || $(el).attr("data-src");
        const style = $(el).attr("style"); // Para background-image
        
        let foundLink = href || src;
        
        if (style && style.includes("url(")) {
            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
            if (match) foundLink = match[1];
        }

        if (foundLink && (foundLink.includes(".jpg") || foundLink.includes(".jpeg") || foundLink.includes(".png") || foundLink.includes(".webp"))) {
            if (!foundLink.includes("icon") && !foundLink.includes("logo") && !foundLink.includes("banner")) {
                if (foundLink.startsWith("/")) {
                    foundLink = new URL(foundLink, url).href;
                }
                if (!images.includes(foundLink)) images.push(foundLink);
            }
        }
    });

    return NextResponse.json({
      success: true,
      data: {
        title: title?.trim(),
        image: image?.trim(),
        images: images.slice(0, 15), // Top 15 fotos no máximo
        description: description?.trim(),
        price: price?.toString(),
        year: year?.toString(),
        km: km?.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Falha técnica ao varrer o link: " + error.message }, { status: 500 });
  }
}
