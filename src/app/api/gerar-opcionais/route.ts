import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { name, year } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "Chave de IA não configurada." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ success: false, error: "Preencha o Nome do veículo primeiro." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Você é um catálogo técnico automotivo oficial do Brasil (Tabela FIPE / Webmotors).
Eu preciso da lista de ITENS DE SÉRIE e OPCIONAIS RACIONAIS que vem de fábrica ou que fazem total sentido para este veículo: 

Nome/Modelo: ${name}
Ano de Fabricação: ${year || "Não informado"}

--- REGRAS OBRIGATÓRIAS ---
1. Apenas liste equipamentos/opcionais automotivos reais.
2. Seja objetivo e profissional. 
3. Retorne EXCLUSIVAMENTE os itens separados por vírgula e espaço (Exemplo: Ar-condicionado, Direção elétrica, Vidros elétricos).
4. Sem ponto final no último item.
5. Nunca responda "Como modelo de IA", não coloque introduções nem fechechos, não insira asteriscos ou listas marcadas (nada de hifens, nem Markdown).

GERE A STRING VÍRGULADA AGORA:
    `.trim();

    const result = await model.generateContent(prompt);
    
    // Algumas limpezas para garantir o "apenas separadas por virgula" se a IA falhar
    let responseText = result.response.text().trim();
    responseText = responseText.replace(/\*/g, ''); // Remover asteriscos
    responseText = responseText.replace(/^- /gm, ''); // Remover traces list
    responseText = responseText.replace(/\n/g, ', ').replace(/, \s*,/g, ',');

    return NextResponse.json({ success: true, text: responseText.trim() });
  } catch (error: any) {
    console.error("Erro na inteligência IA (Opcionais):", error);
    return NextResponse.json({ success: false, error: "Falha na geração de opcionais." }, { status: 500 });
  }
}
