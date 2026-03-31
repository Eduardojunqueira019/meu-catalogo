import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { name, year, km, options, style } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "Chave GEMINI_API_KEY não está configurada no arquivo .env" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let styleInstruction = "";
    if (style === "padrao") {
      styleInstruction = "Seja equilibrado, profissional e claro. Construa confiança e evite exageros.";
    } else if (style === "agressivo") {
      styleInstruction = "Use linguagem de impacto, gatilhos de escassez (ex: venha logo, oportunidade única) e foco em venda rápida. Pareça imperdível.";
    } else if (style === "premium") {
      styleInstruction = "Use linguagem sofisticada, focando em exclusividade, status, conforto e procedência impecável.";
    }

    const prompt = `
Você é um consultor automotivo experiente escrevendo a descrição para o anúncio de um veículo na internet.

--- DADOS DO VEÍCULO ---
Nome: ${name || "Não informado"}
Ano: ${year || "Não informado"}
Quilometragem: ${km || "0"} km
Opcionais: ${options || "Sem informações adicionais"}

--- REGRAS OBRIGATÓRIAS ---
1. A descrição deve ter OBRIGATORIAMENTE entre 3 e 6 linhas no máximo (seja claro e objetivo).
2. NUNCA invente itens, equipamentos ou opcionais que não foram passados nos dados (apenas exalte os que existem). Se a lista estiver vazia, foque na qualidade.
3. NUNCA faça promessas irreais ou prometa "aprovação 100% garantida".
4. Destaque conservação, procedência e benefícios na ótica do comprador.
5. Tom e Estilo EXIGIDO para a venda: ${styleInstruction}

INSTRUÇÃO FINAL E CRÍTICA: Retorne APENAS o texto livre final do anúncio pronto para uso. Não escreva "Aqui está a descrição", não use aspas ou asteriscos graves ao redor do texto, e não coloque o título do carro acima do texto se não fizer sentido na narrativa.
    `.trim();

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ success: true, text: responseText.trim() });
  } catch (error: any) {
    console.error("Erro na integração IA:", error);
    return NextResponse.json({ success: false, error: "Falha na geração com IA. A chave pode estar inválida." }, { status: 500 });
  }
}
