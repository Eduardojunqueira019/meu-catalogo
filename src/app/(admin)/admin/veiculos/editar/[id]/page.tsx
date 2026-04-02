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

  // Form States (Controlled Components for reliability)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [gearbox, setGearbox] = useState("Automático");
  const [type, setType] = useState("sedan");
  const [status, setStatus] = useState("disponivel");
  const [plate, setPlate] = useState("");
  const [options, setOptions] = useState("");
  const [description, setDescription] = useState("");
  
  // Checkbox States
  const [isLeilao, setIsLeilao] = useState(false);
  const [isIpvaPago, setIsIpvaPago] = useState(false);
  const [isAlienado, setIsAlienado] = useState(false);
  const [isGarantia, setIsGarantia] = useState(false);

  // Facilitador States
  const [apiType, setApiType] = useState<"carros" | "motos">("carros");
  const [brands, setBrands] = useState<{codigo: string, nome: string}[]>([]);
  const [models, setModels] = useState<{codigo: string, nome: string}[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  
  // AI States
  const [aiLoading, setAiLoading] = useState<string | false>(false);

  // Initial Load
  useEffect(() => {
    async function loadVehicle() {
      try {
        const v = await getVehicleById(id);
        if (v) {
          setName(v.name);
          setPrice(String(v.price));
          setYear(String(v.year));
          setKm(String(v.km));
          setGearbox(v.gearbox);
          setType(v.type);
          setStatus(v.status);
          setPlate(v.plate || "");
          setOptions(v.options || "");
          setDescription(v.description || "");
          
          setIsLeilao(!!v.isLeilao);
          setIsIpvaPago(!!v.isIpvaPago);
          setIsAlienado(!!v.isAlienado);
          setIsGarantia(!!v.isGarantia);

          try {
            const imgs = JSON.parse(v.images);
            setPreviewUrls(imgs);
          } catch (e) {
            console.error("Error parsing images", e);
          }
        }
      } catch (err) {
        console.error("Error loading vehicle", err);
      } finally {
        setFetching(false);
      }
    }
    loadVehicle();
  }, [id]);

  // FIPE API Logics
  useEffect(() => {
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
           setName(`${cleanBrand} ${m}`.split(" ").slice(0, 5).join(" "));
       }
    }
  }, [selectedModel, selectedBrand, brands, models]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urls = filesArray.map(file => URL.createObjectURL(file));
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
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus("Processando alterações...");

    try {
      const fileInput = document.querySelector('input[name="images"]') as HTMLInputElement;
      const files = fileInput?.files ? Array.from(fileInput.files) : [];
      const existingUrls = previewUrls.filter(url => url.startsWith("http"));
      const imageUrls: string[] = [...existingUrls];

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadStatus(`Subindo nova foto ${i + 1} de ${files.length}...`);
          const fileToUpload = await compressImage(files[i]);
          const imageFormData = new FormData();
          imageFormData.append("image", fileToUpload);
          const uploadResult = await uploadVehicleImage(imageFormData);
          if (uploadResult.success && uploadResult.url) imageUrls.push(uploadResult.url);
          await new Promise(r => setTimeout(r, 200));
        }
      }

      setUploadStatus("Atualizando registro...");

      const vehicleData = {
        name,
        price: Number(price),
        year: Number(year),
        km: Number(km),
        gearbox,
        type,
        options,
        description,
        status,
        isLeilao,
        isIpvaPago,
        isAlienado,
        isGarantia,
        plate,
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
        body: JSON.stringify({ name, year, km, options, style })
      });
      const data = await res.json();
      if (data.success) setDescription(data.text);
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
            <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Preço (R$) *</label>
            <input required type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.01" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Placa (Opcional)</label>
            <input type="text" value={plate} onChange={e => setPlate(e.target.value)} placeholder="Ex: ABC-1234" style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Ano *</label>
            <input required type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>KM *</label>
            <input required type="number" value={km} onChange={e => setKm(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Câmbio *</label>
            <select required value={gearbox} onChange={e => setGearbox(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="Automático">Automático</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Tipo *</label>
            <select required value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="sedan">Sedan</option>
              <option value="hatch">Hatch</option>
              <option value="SUV">SUV</option>
              <option value="picape">Picape</option>
              <option value="moto">Moto</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Status *</label>
            <select required value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#334155", marginBottom: "16px" }}>Características Adicionais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input type="checkbox" checked={isIpvaPago} onChange={e => setIsIpvaPago(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>📄 IPVA Pago</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input type="checkbox" checked={isLeilao} onChange={e => setIsLeilao(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🔨 Leilão</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input type="checkbox" checked={isAlienado} onChange={e => setIsAlienado(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🏦 Alienado</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <input type="checkbox" checked={isGarantia} onChange={e => setIsGarantia(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>🛡️ Garantia</span>
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>Opcionais</label>
          <input type="text" value={options} onChange={e => setOptions(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
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
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "1rem" }} />
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
