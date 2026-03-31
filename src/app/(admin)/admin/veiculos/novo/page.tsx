"use client";

import { useState, useEffect, useRef } from "react";
import { createVehicle, uploadVehicleImage } from "@/app/actions/vehicle";
import { ChevronLeft, Save, Loader2, ImagePlus, Zap, Sparkles, Bot, Flame, Diamond, Link as LinkIcon, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoVeiculoPage() {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const router = useRouter();

  // Facilitador States
  const [apiType, setApiType] = useState<"carros" | "motos">("carros");
  const [brands, setBrands] = useState<{codigo: string, nome: string}[]>([]);
  const [models, setModels] = useState<{codigo: string, nome: string}[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  
  // AI States
  const [aiLoading, setAiLoading] = useState<string | false>(false);
  const [aiError, setAiError] = useState("");
  
  // Options AI State
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  // Import States
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const importUrlRef = useRef<HTMLInputElement>(null);

  // Form Refs
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const kmRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

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
           setVehicleName(`${cleanBrand} ${m}`.split(" ").slice(0, 5).join(" "));
       }
    }
  }, [selectedModel, selectedBrand, brands, models]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setLoading(true);
    setUploadStatus("Iniciando processo...");

    try {
      const imagesInput = form.querySelector('input[name="images"]') as HTMLInputElement;
      const files = imagesInput?.files ? Array.from(imagesInput.files) : [];
      const imageUrls: string[] = [];

      // 1. Upload das Imagens uma por uma
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadStatus(`Subindo foto ${i + 1} de ${files.length}...`);
          
          const imageFormData = new FormData();
          imageFormData.append("image", files[i]);

          const uploadResult = await uploadVehicleImage(imageFormData);
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || `Erro no upload da foto ${i + 1}`);
          }
          
          if (uploadResult.url) imageUrls.push(uploadResult.url);
        }
      }

      setUploadStatus("Salvando dados do veículo...");

      // 2. Criação do Veículo no Banco
      const vehicleData = {
        name: formData.get("name") as string,
        price: Number(formData.get("price")),
        year: Number(formData.get("year")),
        km: Number(formData.get("km")),
        gearbox: formData.get("gearbox") as string,
        type: formData.get("type") as string,
        options: formData.get("options") as string,
        description: formData.get("description") as string,
        status: formData.get("status") as string,
        imageUrls
      };

      const result = await createVehicle(vehicleData);
      
      if (result.success) {
        setUploadStatus("Sucesso!");
        form.reset();
        
        setVehicleName("");
        setPreviewUrls([]);
        setSelectedBrand("");
        setSelectedModel("");
        setBrands([]);
        setModels([]);
        
        if (descriptionRef.current) descriptionRef.current.value = "";
        if (optionsRef.current) optionsRef.current.value = "";
        if (priceRef.current) priceRef.current.value = "";
        if (kmRef.current) kmRef.current.value = "";
        if (yearRef.current) yearRef.current.value = "";
        if (importUrlRef.current) importUrlRef.current.value = "";

        alert("✅ Veículo salvo e publicado com sucesso!");
      } else {
        alert("❌ Erro ao salvar veículo: " + (result.error || "Tente novamente."));
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  const generateAI = async (style: string) => {
    setAiLoading(style);
    setAiError("");
    try {
      const name = vehicleName;
      const year = yearRef.current?.value || "";
      const km = kmRef.current?.value || "";
      const options = optionsRef.current?.value || "";

      if (!name) { setAiError("Preencha o Nome do veículo acima antes de gerar (Use o Faciltador)."); setAiLoading(false); return; }

      const res = await fetch("/api/gerar-descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, year, km, options, style })
      });
      const data = await res.json();
      
      if (data.success && descriptionRef.current) {
         descriptionRef.current.value = data.text;
      } else {
         setAiError(data.error || "Erro na geração pela IA.");
      }
    } catch (e: any) {
      setAiError(e.message || "Falha na conexão com a internet.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImport = async () => {
    // ... logic code hidden here previously ... (don't overwrite this by using only start/endline wisely)
    const link = importUrlRef.current?.value;
    if (!link) { setImportError("Cole um link válido primeiro."); return; }
    
    setImportLoading(true); setImportError("");
    try {
      const res = await fetch("/api/importar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link })
      });
      const result = await res.json();
      
      if (result.success && result.data) {
         if (result.data.title && !vehicleName) setVehicleName(result.data.title);
         if (result.data.price && priceRef.current && !priceRef.current.value) priceRef.current.value = parseFloat(result.data.price).toFixed(2);
         if (result.data.year && yearRef.current && !yearRef.current.value) yearRef.current.value = result.data.year;
         if (result.data.km && kmRef.current && !kmRef.current.value) kmRef.current.value = result.data.km;
         if (result.data.description && descriptionRef.current && !descriptionRef.current.value) descriptionRef.current.value = result.data.description;
         
         if (result.data.images && result.data.images.length > 0) {
             const dataTransfer = new DataTransfer();
             const newUrls: string[] = [];
             
             for (const imgUrl of result.data.images) {
                 try {
                     const imgRes = await fetch(imgUrl);
                     const blob = await imgRes.blob();
                     const fileName = `foto_${Math.random().toString(36).substring(7)}.jpg`;
                     const file = new File([blob], fileName, { type: blob.type });
                     dataTransfer.items.add(file);
                     newUrls.push(imgUrl); // Pode usar URL.createObjectURL(file) tb
                 } catch(imgE) { console.error("Erro importando imagem", imgUrl); }
             }
             
             const fileInput = document.querySelector('input[name="images"]') as HTMLInputElement;
             if (fileInput && dataTransfer.files.length > 0) {
                 fileInput.files = dataTransfer.files;
                 setPreviewUrls(prev => [...prev, ...newUrls]);
             }
         }
      } else {
         setImportError(result.error || "Falha ao extrair dados.");
      }
    } catch(e: any) {
      setImportError("Erro de conexão com o extrator.");
    } finally {
      setImportLoading(false);
    }
  };

  const generateOptionsAI = async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const name = vehicleName;
      const year = yearRef.current?.value || "";

      if (!name) { setOptionsError("Preencha o Nome do carro primeiro."); setOptionsLoading(false); return; }

      const res = await fetch("/api/gerar-opcionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, year })
      });
      const data = await res.json();
      
      if (data.success && optionsRef.current) {
         optionsRef.current.value = data.text;
      } else {
         setOptionsError(data.error || "Erro na inteligência artificial.");
      }
    } catch (e: any) {
      setOptionsError("Computador servidor inacessível.");
    } finally {
      setOptionsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-light)", marginBottom: "24px" }}>
        <ChevronLeft size={20} />
        Voltar ao painel
      </Link>
      
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--text-dark)", marginBottom: "8px" }}>Cadastrar Novo Veículo</h1>
        <p style={{ color: "var(--text-light)" }}>Preencha os dados abaixo para adicionar um carro ou moto ao catálogo.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "white", padding: "32px", borderRadius: "12px", boxShadow: "var(--box-shadow)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* IMPORTADOR POR LINK */}
        <div style={{ padding: "20px", background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)", borderRadius: "8px", border: "1px dashed #90caf9", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ fontSize: "1.05rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
            <LinkIcon size={20} /> Importar dados por Link
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>Cole o link de um anúncio online (Webmotors, etc) para autopreencher os campos vazios.</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <input ref={importUrlRef} type="url" placeholder="Ex: https://www.webmotors.com.br/comprar/..." style={{ flex: 1, padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
            <button type="button" onClick={handleImport} disabled={importLoading} style={{ background: "var(--primary)", color: "white", padding: "0 20px", borderRadius: "6px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: importLoading ? "not-allowed" : "pointer" }}>
              {importLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Importar
            </button>
          </div>
          {importError && <p style={{ color: "red", fontSize: "0.85rem", fontWeight: "600" }}>❌ {importError}</p>}
        </div>

        {/* FACILITADOR AUTOPREDICT AREA */}
        <div style={{ padding: "24px", background: "#f4f6f8", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.05rem", color: "var(--primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
            <Zap size={20} /> Facilitador de Preenchimento Rápido
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-light)", marginBottom: "16px" }}>Selecione abaixo para auto-completar o Nome oficial do Veículo.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <select value={apiType} onChange={e => setApiType(e.target.value as "carros" | "motos")} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", fontSize: "0.9rem" }}>
              <option value="carros">Carro</option>
              <option value="motos">Moto</option>
            </select>
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", fontSize: "0.9rem" }}>
              <option value="">1. Marca</option>
              {brands.map(b => <option key={b.codigo} value={b.codigo}>{b.nome}</option>)}
            </select>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!models.length} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", fontSize: "0.9rem", opacity: models.length ? 1 : 0.6 }}>
              <option value="">2. Modelo</option>
              {models.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Nome do Veículo *</label>
            <input required type="text" name="name" placeholder="Ex: Honda Civic EXL 2.0" value={vehicleName} onChange={e => setVehicleName(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Preço (R$) *</label>
            <input ref={priceRef} step="0.01" required type="number" name="price" placeholder="Ex: 85000" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Ano *</label>
            <input ref={yearRef} required type="number" name="year" placeholder="Ex: 2021" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Quilometragem (KM) *</label>
            <input ref={kmRef} required type="number" name="km" placeholder="Ex: 45000" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Câmbio *</label>
            <select required name="gearbox" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }}>
              <option value="Automático">Automático</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Tipo *</label>
            <select required name="type" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }}>
              <option value="sedan">Sedan</option>
              <option value="hatch">Hatch</option>
              <option value="SUV">SUV</option>
              <option value="picape">Picape</option>
              <option value="moto">Moto</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Status *</label>
            <select required name="status" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }}>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-dark)" }}>Opcionais Múltiplos</label>
            <button type="button" onClick={generateOptionsAI} disabled={optionsLoading} style={{ background: "linear-gradient(90deg, #f0fdf4, #dcfce7)", color: "#16a34a", padding: "4px 12px", borderRadius: "12px", border: "1px solid #bbf7d0", fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: optionsLoading ? "not-allowed" : "pointer", transition: "0.2s" }}>
              {optionsLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
              {optionsLoading ? "Pesquisando modelo..." : "Sugerir com IA"}
            </button>
          </div>
          <input ref={optionsRef} required type="text" name="options" placeholder="Ex: Ar condicionado, Direção elétrica, Vidros elétricos..." style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-color)" }} />
          {optionsError && <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px", fontWeight: "600" }}>❌ {optionsError}</p>}
        </div>

        <div>
           {/* AI Description Panel */}
          <div style={{ background: "linear-gradient(to right, #e8f4fd, #f4e8fd)", padding: "20px", borderRadius: "8px", border: "1px solid #d0e8fc", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={18} /> Criar Descrição Mágica de Venda (IA)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-light)", marginBottom: "16px" }}>Cansado de escrever? A Inteligência Artificial vai ler o veículo que você montou e redigir uma isca mental completa. Selecione a pegada do anúncio:</p>
            
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
               <button type="button" onClick={() => generateAI("padrao")} disabled={!!aiLoading} style={{ background: "white", padding: "10px 16px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid #1E88E5", color: "#1E88E5", cursor: !!aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                 {aiLoading === "padrao" ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />} Descrição Padrão
               </button>
               <button type="button" onClick={() => generateAI("agressivo")} disabled={!!aiLoading} style={{ background: "white", padding: "10px 16px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid #E53935", color: "#E53935", cursor: !!aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                 {aiLoading === "agressivo" ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} color="#E53935" />} Descrição de Impacto
               </button>
               <button type="button" onClick={() => generateAI("premium")} disabled={!!aiLoading} style={{ background: "white", padding: "10px 16px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid #8E24AA", color: "#8E24AA", cursor: !!aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                 {aiLoading === "premium" ? <Loader2 size={16} className="animate-spin" /> : <Diamond size={16} color="#8E24AA" />} Descrição Premium
               </button>
            </div>
            {aiError && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "12px", fontWeight: "600" }}>{aiError}</p>}
          </div>

          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-dark)" }}>Texto da Descrição *</label>
          <textarea ref={descriptionRef} required name="description" rows={6} placeholder="Descreva o carro em detalhes, ou clique nos botões acima para a robô fazer isso por você..." style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white", fontFamily: "inherit", fontSize: "1rem" }} />
        </div>

        <div style={{ background: "var(--bg-color)", padding: "20px", borderRadius: "8px", border: "1px dashed var(--border-color)", textAlign: "center" }}>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", color: "var(--primary)" }}>
            <ImagePlus size={30} />
            <span style={{ fontWeight: "600" }}>Clique para selecionar múltiplas fotos</span>
            <input required type="file" name="images" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </label>
          
          {previewUrls.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
              {previewUrls.map((url, i) => (
                <div key={i} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "16px" }}>
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? (uploadStatus || "Salvando...") : "Salvar Veículo e Publicar"}
        </button>
      </form>
    </div>
  );
}
