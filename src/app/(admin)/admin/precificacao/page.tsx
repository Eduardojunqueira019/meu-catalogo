"use client";

import { useState, useEffect, Suspense } from "react";
import { analyzePricing, PricingInput, PricingAnalysis } from "@/utils/pricingEngine";
import { useSearchParams } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  Plus,
  RefreshCw,
  Info,
  ArrowRight,
  LayoutDashboard,
  CarFront
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
    ano: 0, // Hydration safe: start at 0
    versao: "",
    km: 0,
    fipe: 0,
    valor_teste: 0,
    precos_mercado: []
  });

  const [platformData, setPlatformData] = useState<Record<string, PlatformSummary> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [error, setError] = useState("");

  // FIPE Facilitador States
  const [apiType, setApiType] = useState<"carros" | "motos">("carros");
  const [brands, setBrands] = useState<{codigo: string, nome: string}[]>([]);
  const [models, setModels] = useState<{codigo: string, nome: string}[]>([]);
  const [years, setYears] = useState<{codigo: string, nome: string}[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [fipeReference, setFipeReference] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  useEffect(() => {
    // Set current year on client to avoid hydration mismatch
    if (input.ano === 0) {
      const currentYear = new Date().getFullYear();
      setInput(prev => ({ ...prev, ano: prev.ano || currentYear }));
    }

    const name = searchParams.get("name");
    const year = searchParams.get("year");
    const km = searchParams.get("km");
    const fipe = searchParams.get("fipe");
    const testPrice = searchParams.get("venda");

    if (name || year || km || fipe || testPrice) {
      setInput(prev => ({
        ...prev,
        veiculo: name || prev.veiculo,
        ano: Number(year) || prev.ano,
        km: Number(km) || prev.km,
        fipe: Number(fipe) || prev.fipe,
        valor_teste: Number(testPrice) || prev.valor_teste
      }));
    }
  }, [searchParams]);

  // FIPE Facilitador Effects
  useEffect(() => {
    setSelectedBrand("");
    setSelectedModel("");
    setBrands([]);
    setModels([]);
    fetch(`https://parallelum.com.br/fipe/api/v1/${apiType}/marcas`)
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, [apiType]);

  useEffect(() => {
    if (!selectedBrand) { setModels([]); setSelectedModel(""); return; }
    fetch(`https://parallelum.com.br/fipe/api/v1/${apiType}/marcas/${selectedBrand}/modelos`)
      .then(res => res.json())
      .then(data => setModels(data.modelos || []))
      .catch(console.error);
  }, [selectedBrand, apiType]);

  useEffect(() => {
    if (selectedModel && selectedBrand) {
       const b = brands.find(x => String(x.codigo) === String(selectedBrand))?.nome || "";
       const m = models.find(x => String(x.codigo) === String(selectedModel))?.nome || "";
       if (b && m) {
           let cleanBrand = b.replace("VW - ", ""); // Cleanup VW name
           setInput(prev => ({ ...prev, veiculo: `${cleanBrand} ${m}`.split(" ").slice(0, 5).join(" ") }));
       }
    }
  }, [selectedModel, selectedBrand, brands, models]);

  useEffect(() => {
    if (!selectedModel) { setYears([]); setSelectedYear(""); return; }
    fetch(`https://parallelum.com.br/fipe/api/v1/${apiType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos`)
      .then(res => res.json())
      .then(data => setYears(data))
      .catch(console.error);
  }, [selectedModel, selectedBrand, apiType]);

  useEffect(() => {
    if (selectedYear) {
       const yearValue = selectedYear.split("-")[0];
       if (yearValue) {
           setInput(prev => ({ ...prev, ano: Number(yearValue) }));
       }

       // Fetch Final FIPE Value & Reference Month
       fetch(`https://parallelum.com.br/fipe/api/v1/${apiType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${selectedYear}`)
         .then(res => res.json())
         .then(data => {
            if (data.Valor) {
                const numericValue = Number(data.Valor.replace(/[R$\s.]/g, '').replace(',', '.'));
                setInput(prev => ({ ...prev, fipe: numericValue }));
                setFipeReference(data.MesReferencia || "");
            }
         })
         .catch(console.error);
    }
  }, [selectedYear, selectedBrand, selectedModel, apiType]);
  
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
                valor_teste: Number(input.valor_teste),
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
    <div className="main-container">
      {/* Header Premium com Gradiente */}
      <header className="page-header">
        <div>
          <h1 className="title-main">
            Negociação <span style={{ color: "#3b82f6" }}>Inteligente</span>
          </h1>
          <p className="subtitle">
            Compare preços reais em múltiplos canais antes de fechar o negócio.
          </p>
        </div>
        <div className="badge-mode">
            <span className="badge-text">
                <Search size={18} /> MODO: PESQUISA MULTICANAL
            </span>
        </div>
      </header>

      {/* FIPE Facilitador (Marca / Modelo) */}
      <section className="search-section fipe-facilitator">
        <div className="input-group">
            <label style={labelMiniStyle}>Tipo</label>
            <select value={apiType} onChange={e => setApiType(e.target.value as "carros" | "motos")} className="premium-select">
              <option value="carros">Carro</option>
              <option value="motos">Moto</option>
            </select>
        </div>
        <div className="input-group-lg">
            <label style={labelMiniStyle}>1. Marca</label>
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="premium-select">
              <option value="">Selecione a marca</option>
              {brands.map(b => <option key={b.codigo} value={b.codigo}>{b.nome}</option>)}
            </select>
        </div>
        <div className="input-group-xl">
            <label style={labelMiniStyle}>2. Modelo</label>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!models.length} className="premium-select" style={{ opacity: models.length ? 1 : 0.6 }}>
              <option value="">Selecione o modelo</option>
              {models.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
        </div>
        <div className="input-group-lg">
            <label style={labelMiniStyle}>3. Ano FIPE</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} disabled={!years.length} className="premium-select" style={{ opacity: years.length ? 1 : 0.6 }}>
              <option value="">Selecione o ano</option>
              {years.map(y => <option key={y.codigo} value={y.codigo}>{y.nome}</option>)}
            </select>
        </div>
      </section>

      {/* Seção de Entrada Principal (Pesquisa) */}
      <section className="search-section main-search">
        <div className="input-group-xl">
            <label style={labelMiniStyle}>O que você está negociando?</label>
            <input type="text" placeholder="Ex: Honda Civic G10, Corolla 2020..." value={input.veiculo} onChange={e => setInput({...input, veiculo: e.target.value})} className="premium-input" />
        </div>
        <div className="input-group-sm">
            <label style={labelMiniStyle}>Ano</label>
            <input type="number" value={input.ano} onChange={e => setInput({...input, ano: Number(e.target.value)})} className="premium-input" />
        </div>
        <div className="input-group">
            <label style={labelMiniStyle}>Tabela FIPE (R$)</label>
            <input type="number" placeholder="Valor ref." value={input.fipe || ""} onChange={e => setInput({...input, fipe: Number(e.target.value)})} className="premium-input highlight" />
            {fipeReference && <span className="ref-text">Ref: {fipeReference}</span>}
        </div>
        <div className="input-group">
            <label style={{ ...labelMiniStyle, color: "#1e293b" }}>Meu Valor de Venda (R$)</label>
            <input type="number" placeholder="Ex: 45000" value={input.valor_teste || ""} onChange={e => setInput({...input, valor_teste: Number(e.target.value)})} className="premium-input gray" />
        </div>
        <button onClick={handleAISearch} disabled={isSearching} className="btn-search">
            {isSearching ? <RefreshCw size={20} className="spin" /> : <Zap size={20} />} 
            {isSearching ? "Buscando..." : "Avaliar"}
        </button>
      </section>

      {error && (
        <div style={{ marginBottom: "32px", padding: "16px 24px", background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "8px", color: "#991b1b", fontWeight: "600", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Main Dashboard Result */}
      {platformData ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* DIAGNÓSTICO ESTILO WEBMOTORS (Card Negro Premium) */}
            <div className="diagnostic-card">
                <p className="card-label-light">Compare os preços (Diagnóstico Real de Mercado)</p>
                <div className="diag-grid">
                    {/* Pilar 1: Seu Preço */}
                    <div className="diag-col">
                        <span className="diag-label">Valor anunciado</span>
                        <h3 className="diag-value">{formatCurrency(input.valor_teste || 0)}</h3>
                        {analysis?.delta_teste_mercado !== undefined && (
                            <span className={`diag-badge ${analysis.delta_teste_mercado > 0 ? 'red' : 'green'}`}>
                                {analysis.delta_teste_mercado > 0 ? "ACIMA DA MÉDIA" : "EXCELENTE PREÇO"} 
                                ({Math.abs(analysis.delta_teste_mercado)}%)
                            </span>
                        )}
                    </div>

                    {/* Pilar 2: Média WebMotors */}
                    <div className="diag-col border-left">
                        <div className="brand-logo-container">
                            <img src="https://www.webmotors.com.br/assets/img/logo-webmotors.svg" alt="Webmotors" className="brand-logo-invert" />
                        </div>
                        <h3 className="diag-value">{formatCurrency(analysis?.media_mercado || 0)}</h3>
                        <p className="diag-subtext">Média real hoje</p>
                    </div>

                    {/* Pilar 3: FIPE */}
                    <div className="diag-col border-left">
                        <span className="diag-label green-text">FIPE</span>
                        <h3 className="diag-value">{formatCurrency(input.fipe || 0)}</h3>
                        <p className="diag-subtext">Referência oficial</p>
                    </div>
                </div>
            </div>

            {/* Cards de Destaque Detalhado */}
            <div className="summary-grid">
                {/* Score de Liquidez */}
                <div className="summary-card">
                    <p style={labelMiniStyle}>Liquidez Estimada</p>
                    <div className="liquidez-container">
                        <div className="progress-bg">
                            <div className="progress-bar" style={{ width: analysis?.liquidez === "ALTA" ? "100%" : analysis?.liquidez === "MEDIA" ? "60%" : "25%" }} />
                        </div>
                        <span className="liquidez-text">{analysis?.liquidez}</span>
                    </div>
                </div>

                {/* Card Especialista */}
                {analysis && (
                    <div className="expert-card">
                        <div className="expert-icon">
                           {analysis.classificacao === "FORTE" ? <TrendingUp size={32} color="#10b981" /> : <TrendingDown size={32} color="#3b82f6" />}
                        </div>
                        <p style={labelMiniStyle}>Oportunidade de Compra</p>
                        <h2 className="expert-title">Margem de {analysis.margem_estimada}%</h2>
                        <span className="expert-subtitle">SUGESTÃO: {formatCurrency(analysis.preco_compra_sugerido)}</span>
                    </div>
                )}
            </div>

            {/* Comparativo WebMotors / OLX / iCarros / Facebook */}
            <div>
               <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                 <TrendingUp size={20} color="#3b82f6" /> Comparativo Detalhado por Plataforma
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
                              <CheckCircle color="#2563eb" /> Resumo Estratégico
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
                                          <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
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
                <RefreshCw size={16} /> Fazer Nova Pesquisa
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
        .main-container { maxWidth: 1400px; margin: 0 auto; padding: 20px; color: #0f172a; }
        .page-header { margin-bottom: 48px; display: flex; justify-content: space-between; align-items: center; }
        .title-main { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin-bottom: 8px; letter-spacing: -1px; }
        .subtitle { color: #64748b; font-size: 1.1rem; font-weight: 500; }
        .badge-mode { background: #eff6ff; padding: 12px 20px; border-radius: 16px; border: 1px solid #dbeafe; }
        .badge-text { font-size: 0.85rem; font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 8px; }
        
        .search-section { background: white; padding: 24px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); display: flex; gap: 16px; align-items: flex-end; margin-bottom: 40px; }
        .fipe-facilitator { background: #f8fafc; padding: 16px 24px; margin-bottom: 20px; }
        
        .input-group { flex: 1; min-width: 150px; }
        .input-group-sm { flex: 0.8; min-width: 80px; }
        .input-group-lg { flex: 1.5; min-width: 200px; }
        .input-group-xl { flex: 2; min-width: 300px; }
        
        .premium-input { width: 100%; padding: 14px 18px; border-radius: 16px; border: 1px solid #f1f5f9; background: #f8fafc; font-size: 1rem; font-weight: 600; outline: none; color: #1e293b; transition: all 0.2s; }
        .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .premium-input.highlight { border-color: #3b82f6; color: #2563eb; font-weight: 800; }
        .premium-input.gray { background: #f1f5f9; border-color: #cbd5e1; }
        .premium-select { width: 100%; padding: 10px 14px; border-radius: 16px; border: 1px solid #f1f5f9; background: white; font-size: 1rem; font-weight: 600; outline: none; color: #1e293b; transition: all 0.2s; height: 48px; }
        
        .btn-search { background: #2563eb; color: white; border: none; padding: 14px 32px; border-radius: 16px; font-size: 1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.3s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); height: 48px; white-space: nowrap; }
        .btn-search:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-search:disabled { background: #93c5fd; cursor: not-allowed; transform: none; }
        
        .ref-text { font-size: 0.65rem; color: #94a3b8; font-weight: 700; margin-top: 4px; display: block; }
        
        .diagnostic-card { background: #111827; padding: 40px; border-radius: 32px; color: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .card-label-light { font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
        .diag-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; align-items: center; }
        .diag-col { display: flex; flex-direction: column; }
        .diag-label { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
        .diag-value { font-size: 2.4rem; font-weight: 900; margin: 12px 0; color: #fff; }
        .diag-badge { font-size: 0.9rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; align-self: flex-start; }
        .diag-badge.red { color: #f87171; background: rgba(248, 113, 113, 0.1); }
        .diag-badge.green { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
        .border-left { border-left: 1px solid #374151; padding-left: 40px; }
        .brand-logo-container { height: 18px; margin-bottom: 12px; }
        .brand-logo-invert { height: 100%; filter: brightness(0) invert(1); }
        .diag-subtext { font-size: 0.8rem; color: #94a3b8; margin: 0; }
        .green-text { color: #4ade80; font-weight: 900; text-transform: uppercase; }

        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; }
        .summary-card { background: white; padding: 32px; border-radius: 32px; border: 1px solid #e2e8f0; }
        .liquidez-container { display: flex; align-items: center; gap: 16px; margin-top: 12px; }
        .progress-bg { flex: 1; height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
        .progress-bar { height: 100%; background: #3b82f6; transition: width 1s ease-in-out; }
        .liquidez-text { font-weight: 800; color: #1e293b; min-width: 60px; }

        .expert-card { background: #f8fafc; padding: 32px; border-radius: 32px; border: 1px solid #e2e8f0; position: relative; }
        .expert-icon { position: absolute; top: 32px; right: 32px; }
        .expert-title { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 8px 0; }
        .expert-subtitle { font-size: 0.85rem; font-weight: 700; color: #64748b; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        @media (max-width: 1024px) {
          .diag-grid { grid-template-columns: 1fr; gap: 32px; }
          .border-left { border-left: none; padding-left: 0; padding-top: 24px; border-top: 1px solid #374151; }
          .summary-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .search-section { flex-direction: column; align-items: stretch; gap: 20px; }
          .title-main { font-size: 2rem; }
          .diag-value { font-size: 2rem; }
          .btn-search { width: 100%; }
        }
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
