"use client";

import { useState, useEffect, useRef } from "react";
import { getVehicleById, updateVehicle, uploadVehicleImage } from "@/app/actions/vehicle";
import { ChevronLeft, Save, Loader2, ImagePlus, Zap, Sparkles, Bot, Flame, Diamond, Link as LinkIcon, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function EditarVeiculoPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const plateRef = useRef<HTMLInputElement>(null);
  const gearboxRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  
  // Checkbox Refs
  const isLeilaoRef = useRef<HTMLInputElement>(null);
  const isIpvaPagoRef = useRef<HTMLInputElement>(null);
  const isAlienadoRef = useRef<HTMLInputElement>(null);
  const isGarantiaRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    async function loadVehicle() {
      const vehicle = await getVehicleById(id);
      if (vehicle) {
        setVehicleName(vehicle.name);
        if (priceRef.current) priceRef.current.value = String(vehicle.price);
        if (yearRef.current) yearRef.current.value = String(vehicle.year);
        if (kmRef.current) kmRef.current.value = String(vehicle.km);
        if (descriptionRef.current) descriptionRef.current.value = vehicle.description;
        if (optionsRef.current) optionsRef.current.value = vehicle.options;
        if (plateRef.current) plateRef.current.value = vehicle.plate || "";
        if (gearboxRef.current) gearboxRef.current.value = vehicle.gearbox;
        if (typeRef.current) typeRef.current.value = vehicle.type;
        if (statusRef.current) statusRef.current.value = vehicle.status;
        
        if (isLeilaoRef.current) isLeilaoRef.current.checked = vehicle.isLeilao;
        if (isIpvaPagoRef.current) isIpvaPagoRef.current.checked = vehicle.isIpvaPago;
        if (isAlienadoRef.current) isAlienadoRef.current.checked = vehicle.isAlienado;
        if (isGarantiaRef.current) isGarantiaRef.current.checked = vehicle.isGarantia;

        try {
          const images = JSON.parse(vehicle.images);
          setPreviewUrls(images);
        } catch (e) {
          console.error("Error parsing images", e);
        }
      }
      setFetching(false);
    }
    loadVehicle();
  }, [id]);

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
           let cleanBrand = b.replace("VW - ", ""); 
           setVehicleName(`${cleanBrand} ${m}`.split(" ").slice(0, 5).join(" "));
       }
    }
  }, [selectedModel, selectedBrand, brands, models]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      // Keep existing preview URLs when updating
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else { resolve(file); }
          }, "image/jpeg", 0.75);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };
 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setLoading(true);
    setUploadStatus("Processando alterações...");

    try {
      const imagesInput = form.querySelector('input[name="images"]') as HTMLInputElement;
      const files = imagesInput?.files ? Array.from(imagesInput.files) : [];
      
      // We keep existing URLs that were already there
      const existingUrls = previewUrls.filter(url => url.startsWith("http"));
      const imageUrls: string[] = [...existingUrls];

      // 1. Upload only NEW images
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadStatus(`Otimizando nova foto ${i + 1} de ${files.length}...`);
          const fileToUpload = await compressImage(files[i]);
          setUploadStatus(`Subindo nova foto ${i + 1} de ${files.length}...`);
          const imageFormData = new FormData();
          imageFormData.append("image", fileToUpload);
          const uploadResult = await uploadVehicleImage(imageFormData);
          if (uploadResult.success && uploadResult.url) imageUrls.push(uploadResult.url);
          await new Promise(r => setTimeout(r, 200));
        }
      }

      setUploadStatus("Atualizando registro...");

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
        isLeilao: formData.get("isLeilao") === "on",
        isIpvaPago: formData.get("isIpvaPago") === "on",
        isAlienado: formData.get("isAlienado") === "on",
        isGarantia: formData.get("isGarantia") === "on",
        plate: formData.get("plate") as string,
        imageUrls
      };
 
      const result = await updateVehicle(id, vehicleData);
      
      if (result.success) {
        alert("✅ Veículo atualizado com sucesso!");
        router.push("/admin");
      } else {
        alert("❌ Erro ao atualizar: " + result.error);
      }
    } catch (err: any) {
      alert("Erro fatal: " + err.message);
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  const generateAI = async (style: string) => {
    setAiLoading(style);
    try {
      const res = await fetch("/api/gerar-descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vehicleName, year: yearRef.current?.value, km: kmRef.current?.value, options: optionsRef.current?.value, style })
      });
      const data = await res.json();
      if (data.success && descriptionRef.current) descriptionRef.current.value = data.text;
    } catch (e) {} finally { setAiLoading(false); }
  };

  if (fetching) return <div style={{ padding: "40px", textAlign: "center" }}><Loader2 className="animate-spin" /> Carregando dados...</div>;

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-light)" }}>
          <ChevronLeft size={20} /> Voltar ao painel
        </Link>
        <Link href={`/catalogo/${id}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#3b82f6", fontSize: "0.9rem", fontWeight: "600" }}>
          Ver no catálogo <ExternalLink size={16} />
        </Link>
      </div>
      
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--text-dark)", marginBottom: "8px" }}>Editar Veículo</h1>
        <p style={{ color: "var(--text-light)" }}>Ajuste os dados e fotos do veículo abaixo.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "white", padding: "32px", borderRadius: "12px", boxShadow: "var(--box-shadow)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* FACILITADOR */}
        <div style={{ padding: "24px", background: "#f4f6f8", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.05rem", color: "var(--primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
            <Zap size={20} /> Facilitador (Opcional)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <select value={apiType} onChange={e => setApiType(e.target.value as "carros" | "motos")} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white" }}>
              <option value="carros">Carro</option>
              <option value="motos">Moto</option>
            </select>
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white" }}>
              <option value="">1. Marca</option>
              {brands.map(b => <option key={b.codigo} value={b.codigo}>{b.nome}</option>)}
            </select>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!models.length} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white" }}>
              <option value="">2. Modelo</option>
              {models.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Nome do Veículo *</label>
            <input required type="text" name="name" value={vehicleName} onChange={e => setVehicleName(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Preço (R$) *</label>
            <input ref={priceRef} step="0.01" required type="number" name="price" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Placa (Opcional)</label>
            <input ref={plateRef} type="text" name="plate" placeholder="Ex: ABC-1234" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Ano *</label>
            <input ref={yearRef} required type="number" name="year" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>KM *</label>
            <input ref={kmRef} required type="number" name="km" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Câmbio *</label>
            <select ref={gearboxRef} required name="gearbox" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="Automático">Automático</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Tipo *</label>
            <select ref={typeRef} required name="type" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="sedan">Sedan</option>
              <option value="hatch">Hatch</option>
              <option value="SUV">SUV</option>
              <option value="picape">Picape</option>
              <option value="moto">Moto</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Status *</label>
            <select ref={statusRef} required name="status" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#334155", marginBottom: "16px" }}>Características Adicionais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input ref={isIpvaPagoRef} type="checkbox" name="isIpvaPago" style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>📄 IPVA Pago</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input ref={isLeilaoRef} type="checkbox" name="isLeilao" style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🔨 Leilão</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input ref={isAlienadoRef} type="checkbox" name="isAlienado" style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🏦 Alienado</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input ref={isGarantiaRef} type="checkbox" name="isGarantia" style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🛡️ Garantia</span>
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Opcionais</label>
          <input ref={optionsRef} type="text" name="options" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
        </div>

        <div>
          <div style={{ background: "linear-gradient(to right, #e8f4fd, #f4e8fd)", padding: "20px", borderRadius: "8px", border: "1px solid #d0e8fc", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><Sparkles size={18} /> IA Descrição</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
               <button type="button" onClick={() => generateAI("padrao")} style={{ background: "white", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #1E88E5", cursor: "pointer" }}>IA Padrão</button>
               <button type="button" onClick={() => generateAI("agressivo")} style={{ background: "white", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #E53935", cursor: "pointer" }}>IA Impacto</button>
               <button type="button" onClick={() => generateAI("premium")} style={{ background: "white", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #8E24AA", cursor: "pointer" }}>IA Premium</button>
            </div>
          </div>
          <textarea ref={descriptionRef} required name="description" rows={6} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "1rem" }} />
        </div>

        <div style={{ background: "var(--bg-color)", padding: "20px", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
          <label style={{ cursor: "pointer", color: "var(--primary)", textAlign: "center", display: "block" }}>
            <ImagePlus size={30} style={{ margin: "0 auto 10px" }} />
            <strong>Adicionar mais fotos</strong>
            <input type="file" name="images" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
            {previewUrls.map((url, i) => (
              <div key={i} style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid #eee", position: "relative" }}>
                 <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 <button type="button" onClick={() => setPreviewUrls(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 0, right: 0, background: "rgba(255,0,0,0.7)", color: "white", border: "none", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? (uploadStatus || "Salvando...") : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
