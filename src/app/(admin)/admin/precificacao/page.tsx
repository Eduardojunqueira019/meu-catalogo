"use client";

import { useState, useEffect, Suspense } from "react";
import { analyzePricing, PricingInput, PricingAnalysis } from "@/utils/pricingEngine";
import { useSearchParams } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight, 
  BarChart3, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Plus,
  RefreshCcw,
  LucideIcon,
  Info
} from "lucide-react";

function PricingContent() {
  const searchParams = useSearchParams();
  
  const [input, setInput] = useState<Partial<PricingInput>>({
    veiculo: "",
    ano: new Date().getFullYear(),
    versao: "",
    km: 0,
    fipe: 0,
    precos_mercado: []
  });

  useEffect(() => {
    const name = searchParams.get("name");
    const year = searchParams.get("year");
    const km = searchParams.get("km");
    const fipe = searchParams.get("fipe");

    if (name || year || km || fipe) {
      setInput({
        veiculo: name || "",
        ano: Number(year) || new Date().getFullYear(),
        km: Number(km) || 0,
        fipe: Number(fipe) || 0,
        versao: "",
        precos_mercado: []
      });
    }
  }, [searchParams]);
  
  const [rawPrices, setRawPrices] = useState("");
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    setError("");
    try {
      const prices = rawPrices
        .split(/[\s,;\n]+/)
        .map(p => p.replace(/\D/g, ""))
        .filter(p => p.length > 0)
        .map(Number);
        
      if (prices.length < 3) {
        throw new Error("Insira pelo menos 3 preços de mercado para uma análise mínima.");
      }

      if (!input.fipe || input.fipe <= 0) {
        throw new Error("O valor da FIPE é obrigatório.");
      }

      const result = analyzePricing({
        veiculo: input.veiculo || "Veículo não identificado",
        ano: input.ano || 2024,
        versao: input.versao || "",
        km: Number(input.km) || 0,
        fipe: Number(input.fipe),
        precos_mercado: prices
      });

      setAnalysis(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
          <TrendingUp size={36} color="#3b82f6" /> Analista de Preços
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
          Ferramenta estratégica para decisão de compra e precificação de estoque.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px", alignItems: "start" }}>
        <section style={{ background: "white", padding: "32px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
             <Zap size={20} color="#3b82f6" /> Dados do Veículo
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Veículo / Modelo</label>
              <input required type="text" placeholder="Ex: Toyota Corolla XEi" value={input.veiculo} onChange={e => setInput({...input, veiculo: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Ano</label>
                <input type="number" value={input.ano} onChange={e => setInput({...input, ano: Number(e.target.value)})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>KM</label>
                <input type="number" value={input.km} onChange={e => setInput({...input, km: Number(e.target.value)})} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Valor FIPE (R$)</label>
              <input type="number" placeholder="Quanto vale na tabela?" value={input.fipe || ""} onChange={e => setInput({...input, fipe: Number(e.target.value)})} style={{ ...inputStyle, fontWeight: "700", color: "#3b82f6" }} />
            </div>

            <div>
              <label style={labelStyle}>Preços de Mercado (Analise Concorrente)</label>
              <textarea placeholder="Ex: 85000, 89900, 87500, 92000..." value={rawPrices} onChange={e => setRawPrices(e.target.value)} rows={5} style={{ ...inputStyle, resize: "none" }} />
            </div>

            {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid #fee2e2" }}><strong>Erro:</strong> {error}</div>}

            <button onClick={handleAnalyze} style={{ background: "#0f172a", color: "white", border: "none", padding: "16px", borderRadius: "12px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <BarChart3 size={20} /> Gerar Análise Especialista
            </button>
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {!analysis ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: "20px", border: "1px dashed #cbd5e1", padding: "60px", textAlign: "center" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "50%", marginBottom: "20px" }}><TrendingUp size={40} color="#cbd5e1" /></div>
              <h3 style={{ color: "#64748b", margin: 0 }}>Aguardando Dados</h3>
            </div>
          ) : (
            <>
              <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "4px", fontWeight: "600" }}>Classificação de Mercado</p>
                  <span style={{ fontSize: "1.5rem", fontWeight: "900", color: analysis.classificacao === "FORTE" ? "#10b981" : analysis.classificacao === "NORMAL" ? "#3b82f6" : "#f59e0b" }}>{analysis.classificacao}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                 <div style={{ background: "#0f172a", color: "white", padding: "24px", borderRadius: "20px" }}>
                   <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>Sugestão de Compra</p>
                   <h3 style={{ fontSize: "1.8rem", fontWeight: "900" }}>{formatCurrency(analysis.preco_compra_sugerido)}</h3>
                 </div>
                 <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                   <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>Média de Mercado</p>
                   <h3 style={{ fontSize: "1.8rem", fontWeight: "900" }}>{formatCurrency(analysis.media_mercado)}</h3>
                 </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, color: "#475569", lineHeight: "1.6" }}>{analysis.analise_resumida}</p>
              </div>

              {analysis.riscos.length > 0 && (
                <div style={{ background: "#fffaf0", padding: "24px", borderRadius: "20px", border: "1px solid #feebc8" }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: "1rem", color: "#9c4221" }}>Pontos de Atenção</h4>
                  {analysis.riscos.map((r, i) => <p key={i} style={{ color: "#9c4221", fontSize: "0.9rem", margin: "4px 0" }}>• {r}</p>)}
                </div>
              )}

              <button onClick={() => setAnalysis(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem" }}><RefreshCcw size={14} /> Nova Análise</button>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}

export default function PrecificacaoPage() {
  return (
    <Suspense fallback={<div>Carregando Analista...</div>}>
      <PricingContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" };
