"use client";
import { saveProfile } from "./actions";
import { useState } from "react";
import { Save, CheckCircle, Camera } from "lucide-react";

export default function ProfileForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(profile?.photoUrl || "/placeholder-user.jpg");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSuccess(false);
    await saveProfile(formData);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "var(--text-dark)",
    marginBottom: "8px",
    marginTop: "16px",
  };

  return (
    <form action={handleSubmit} style={{ 
      background: "white", 
      padding: "32px", 
      borderRadius: "16px", 
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", 
      border: "1px solid var(--border-color)",
      maxWidth: "900px"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
        {/* Personal Info */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #eff6ff", paddingBottom: "10px" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--primary)", margin: 0 }}>Informações Pessoais</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <div 
              onClick={() => document.getElementById("photo-upload")?.click()}
              style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "50%", 
                backgroundColor: "white", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                overflow: "hidden",
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                cursor: "pointer",
                position: "relative",
                marginBottom: "16px"
              }}
            >
              <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ 
                position: "absolute", 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: "rgba(0,0,0,0.4)", 
                color: "white", 
                padding: "4px 0", 
                fontSize: "0.7rem", 
                fontWeight: "bold",
                textAlign: "center"
              }}>
                ALTERAR
              </div>
            </div>
            
            <input 
              id="photo-upload"
              type="file" 
              name="photo" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }} 
            />
            
            {/* Hidden field to keep track of current URL if no new photo is uploaded */}
            <input type="hidden" name="photoUrl" value={profile?.photoUrl || ""} />

            <button 
              type="button"
              onClick={() => document.getElementById("photo-upload")?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "white",
                color: "var(--text-dark)",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <Camera size={16} /> Selecionar Foto
            </button>
          </div>

          <label style={labelStyle}>Nome Completo</label>
          <input type="text" name="name" defaultValue={profile?.name || ""} placeholder="Seu nome completo" required style={inputStyle} />
          
          <label style={labelStyle}>Cargo Professional</label>
          <input type="text" name="role" defaultValue={profile?.role || "Vendedor de Veículos"} placeholder="Ex: Vendedor de Veículos" required style={inputStyle} />
          
          <label style={labelStyle}>WhatsApp</label>
          <input type="text" name="whatsapp" defaultValue={profile?.whatsapp || ""} placeholder="Ex: (11) 98765-4321" required style={inputStyle} />
          
          <label style={labelStyle}>Instagram</label>
          <input type="text" name="instagram" defaultValue={profile?.instagram || ""} placeholder="Ex: eduardojunqueira" required style={inputStyle} />
          
          <label style={labelStyle}>Facebook (opcional)</label>
          <input type="text" name="facebook" defaultValue={profile?.facebook || ""} placeholder="Link do perfil" style={inputStyle} />
        </section>

        {/* Store Info */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #eff6ff", paddingBottom: "10px" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--primary)", margin: 0 }}>Dados da Loja</h2>
          </div>
          
          <label style={labelStyle}>Nome da Loja / Agência</label>
          <input type="text" name="storeName" defaultValue={profile?.storeName || ""} placeholder="Ex: Agência Campos" required style={inputStyle} />
          
          <label style={labelStyle}>Endereço Completo</label>
          <input type="text" name="address" defaultValue={profile?.address || ""} placeholder="Rua, número, bairro" required style={inputStyle} />
          
          <label style={labelStyle}>Cidade / Estado</label>
          <input type="text" name="city" defaultValue={profile?.city || ""} placeholder="Ex: São Paulo - SP" required style={inputStyle} />
          
          <label style={labelStyle} >Descrição Professional (Bio)</label>
          <textarea 
            name="bio" 
            defaultValue={profile?.bio || ""} 
            placeholder="Conte um pouco sobre sua experiência e como você ajuda seus clientes..." 
            rows={6} 
            style={{ ...inputStyle, resize: "none" }}
          ></textarea>
        </section>
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #eff6ff", paddingTop: "24px" }}>
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 40px", width: "auto" }}
        >
          {loading ? (
            "Salvando..."
          ) : success ? (
            <> <CheckCircle size={20} /> Informações Salvas!</>
          ) : (
            <> <Save size={20} /> Salvar Perfil</>
          )}
        </button>
      </div>
    </form>
  );
}
