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
  Info,
  Search,
  ArrowRight,
  Globe,
  LayoutDashboard
} from "lucide-react";

interface PlatformSummary {
    avg: number;
    count: number;
    prices: number[];
}

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

  const [platformData, setPlatformData] = useState<Record<string, PlatformSummary> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [error, setError] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

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
  
  const handleAISearch = async () => {
    if (!input.veiculo || !input.ano) {
      setError("Preencha o Nome e Ano para que a IA possa pesquisar o mercado.");
      return;
    }
    
    setError("");
    setIsSearching(true);
    setPlatformData(null);
    setAnalysis(null);
    
    try {
      const res = await fetch("/api/precificacao/search-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.veiculo, year: input.ano })
      });
      
      const data = await res.json();
      
      if (data.success || data.needsApiKey) {
        setPlatformData(data.platformSummaries);
        if (data.needsApiKey) {
            setError(`⚠️ Usando dados de demonstração (Configure SERPER_API_KEY no Vercel para dados em tempo real).`);
        }
        
        // Agregar todos os preços para a análise estratégica final
        const allPrices: number[] = [];
        Object.values(data.platformSummaries).forEach((p: any) => {
            allPrices.push(...p.prices);
        });
        
        if (allPrices.length >= 3 && input.fipe) {
           const result = analyzePricing({
                veiculo: input.veiculo || "",
                ano: input.ano || 2024,
                versao: "",
                km: Number(input.km) || 0,
                fipe: Number(input.fipe),
                precos_mercado: allPrices
          });
          setAnalysis(result);
        }
      } else {
        throw new Error(data.error || "Erro técnico na busca.");
      }
    } catch (err: any) {
      setError("Falha na conexão com o motor de IA: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const platforms = [
    { id: "webmotors", name: "WebMotors", logo: "https://www.webmotors.com.br/assets/img/logo-webmotors.svg", color: "#e21a2c" },
    { id: "olx", name: "OLX Brasil", logo: "https://static.olx.com.br/cdfe/static-common/logo.svg", color: "#6e0ad6" },
    { id: "icarros", name: "iCarros", logo: "https://img0.icarros.com.br/newsletter/img/logo_icarros.png", color: "#005baa" },
    { id: "facebook", name: "FB Marketplace", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg", color: "#0668E1" }
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px", color: "#0f172a" }}>
      {/* Header Premium com Gradiente */}
      <header style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "8px", letterSpacing: "-1px" }}>
            Negociação <span style={{ color: "#3b82f6" }}>Inteligente</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: "500" }}>
            Compare preços reais em múltiplos canais antes de fechar o negócio.
          </p>
        </div>
        <div style={{ background: "#eff6ff", padding: "12px 20px", borderRadius: "16px", border: "1px solid #dbeafe" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} /> MODO: PESQUISA MULTICANAL
            </span>
        </div>
      </header>

      {/* Seção de Entrada (Pesquisa) */}
      <section style={searchBarContainerStyle}>
        <div style={{ flex: 2 }}>
            <label style={labelMiniStyle}>O que você está negociando?</label>
            <input type="text" placeholder="Ex: Honda Civic G10, Corolla 2020..." value={input.veiculo} onChange={e => setInput({...input, veiculo: e.target.value})} style={inputPremiumStyle} />
        </div>
        <div style={{ flex: 0.8 }}>
            <label style={labelMiniStyle}>Ano</label>
            <input type="number" value={input.ano} onChange={e => setInput({...input, ano: Number(e.target.value)})} style={inputPremiumStyle} />
        </div>
        <div style={{ flex: 1.2 }}>
            <label style={labelMiniStyle}>Tabela FIPE (R$)</label>
            <input type="number" placeholder="Valor ref." value={input.fipe || ""} onChange={e => setInput({...input, fipe: Number(e.target.value)})} style={{ ...inputPremiumStyle, borderColor: "#3b82f6", color: "#2563eb", fontWeight: "800" }} />
        </div>
        <button onClick={handleAISearch} disabled={isSearching} style={btnMainStyle}>
            {isSearching ? <RefreshCcw size={20} className="spin" /> : <Zap size={20} />} 
            {isSearching ? "Buscando Preços..." : "Avaliar Agora"}
        </button>
      </section>

      {error && (
        <div style={{ marginBottom: "32px", padding: "16px 24px", background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "8px", color: "#991b1b", fontWeight: "600", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Main Dashboard Result */}
      {platformData ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Cards de Destaque Superior */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
                {/* Card FIPE */}
                <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #e2e8f0", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.05 }}><DollarSign size={120} /></div>
                    <p style={labelMiniStyle}>Referência Oficial</p>
                    <h2 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#1e293b", margin: "8px 0" }}>{formatCurrency(input.fipe || 0)}</h2>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>FONTE: TABELA FIPE (BRASIL)</span>
                </div>

                {/* Card Especialista */}
                {analysis && (
                    <div style={{ background: "#0f172a", padding: "32px", borderRadius: "32px", color: "white", position: "relative" }}>
                        <div style={{ position: "absolute", top: "32px", right: "32px" }}>
                           {analysis.classificacao === "FORTE" ? <TrendingUp size={40} color="#10b981" /> : <TrendingDown size={40} color="#3b82f6" />}
                        </div>
                        <p style={{ ...labelMiniStyle, color: "#94a3b8" }}>Diagnóstico do Especialista</p>
                        <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "8px" }}>Mercado {analysis.classificacao}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                           <div style={{ background: "#1e293b", padding: "8px 16px", borderRadius: "12px", border: "1px solid #334155" }}>
                               <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "700" }}>PAGAR ATÉ:</span>
                               <p style={{ fontSize: "1.2rem", fontWeight: "900", margin: 0 }}>{formatCurrency(analysis.preco_compra_sugerido)}</p>
                           </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Comparativo WebMotors / OLX / iCarros / Facebook */}
            <div>
               <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                 <BarChart3 size={20} color="#3b82f6" /> Comparativo Detalhado por Plataforma
               </h3>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                 {platforms.map(p => {
                    const data = platformData[p.id];
                    const hasData = data && data.count > 0;
                    const diff = hasData && input.fipe ? ((data.avg - input.fipe) / input.fipe) * 100 : 0;
                    
                    return (
                        <div key={p.id} style={{ ...platformCardStyle, opacity: hasData ? 1 : 0.6, transform: hasData ? "scale(1)" : "scale(0.98)" }}>
                           <div style={{ height: "45px", marginBottom: "24px", display: "flex", alignItems: "center" }}>
                               <img src={p.logo} alt={p.name} style={{ maxHeight: "100%", maxWidth: "150px", objectFit: "contain", filter: hasData ? "none" : "grayscale(1)" }} />
                           </div>
                           
                           {hasData ? (
                               <div>
                                  <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", margin: 0 }}>Preço Médio Anunciado</p>
                                  <h4 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b", margin: "4px 0" }}>{formatCurrency(data.avg)}</h4>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                                     <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{data.count} anúncios</span>
                                     <div style={{ padding: "4px 10px", borderRadius: "8px", background: diff > 0 ? "#f0fdf4" : "#fef2f2", color: diff > 0 ? "#16a34a" : "#dc2626", fontSize: "0.8rem", fontWeight: "800" }}>
                                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}% FIPE
                                     </div>
                                  </div>
                               </div>
                           ) : (
                               <div style={{ padding: "20px 0", textAlign: "center", color: "#cbd5e1" }}>
                                  <p style={{ margin: 0, fontWeight: "600", fontSize: "0.9rem" }}>Sem dados ativos hoje</p>
                               </div>
                           )}
                        </div>
                    );
                 })}
               </div>
            </div>

            {/* Parecer final */}
            {analysis && (
                <div style={{ background: "white", padding: "40px", borderRadius: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", gap: "48px" }}>
                        <div style={{ flex: 2 }}>
                           <h4 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                              <ShieldCheck color="#2563eb" /> Resumo Estratégico
                           </h4>
                           <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#475569", margin: 0 }}>
                              {analysis.analise_resumida}
                           </p>
                        </div>
                        <div style={{ flex: 1, borderLeft: "2px solid #f1f5f9", paddingLeft: "48px" }}>
                           <h4 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "16px" }}>Pontos de Atenção</h4>
                           <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                              {analysis.riscos.length > 0 ? (
                                  analysis.riscos.map((r, i) => (
                                      <div key={i} style={{ display: "flex", gap: "10px" }}>
                                          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                                          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>{r}</p>
                                      </div>
                                  ))
                              ) : (
                                  <p style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: "600" }}>Nenhum risco detectado.</p>
                              )}
                           </div>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => setPlatformData(null)} style={{ alignSelf: "center", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <RefreshCcw size={16} /> Fazer Nova Pesquisa
            </button>

        </div>
      ) : (
        /* Estado Vazio */
        <div style={emptyStateStyle}>
           <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                <LayoutDashboard size={32} color="#3b82f6" />
           </div>
           <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "12px" }}>Inicie a Avaliação</h2>
           <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto" }}>Digite o nome e ano do carro acima para que nossa IA busque os preços reais no WebMotors, OLX, iCarros e Facebook.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}

export default function PrecificacaoPage() {
  return (
    <Suspense fallback={<div>Preparando Inteligência de Mercado...</div>}>
      <PricingContent />
    </Suspense>
  );
}

// Estilos Reutilizáveis
const searchBarContainerStyle: React.CSSProperties = { background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "flex-end", marginBottom: "40px" };
const labelMiniStyle: React.CSSProperties = { display: "block", fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputPremiumStyle: React.CSSProperties = { width: "100%", padding: "14px 18px", borderRadius: "16px", border: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "1rem", fontWeight: "600", outline: "none", color: "#1e293b", transition: "all 0.2s" };
const btnMainStyle: React.CSSProperties = { background: "#2563eb", color: "white", border: "none", padding: "14px 32px", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.3s", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" };
const platformCardStyle: React.CSSProperties = { background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", transition: "all 0.3s" };
const emptyStateStyle: React.CSSProperties = { padding: "100px 40px", textAlign: "center", background: "white", borderRadius: "40px", border: "2px dashed #cbd5e1" };
