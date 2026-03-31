"use client";

import { useState } from "react";
import styles from "./SimulacaoForm.module.css";
import { Loader2, Lock, CarFront, HelpCircle, CheckCircle } from "lucide-react";

export type SelectableVehicle = { id: string; name: string; year: number; price: number; };

export default function SimulacaoForm({ 
  initialVehicleId, 
  initialVehicleName,
  vehicles = []
}: { 
  initialVehicleId?: string, 
  initialVehicleName?: string,
  vehicles?: SelectableVehicle[]
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || "");
  const [selectedVehicleName, setSelectedVehicleName] = useState(initialVehicleName || "");

  const [formData, setFormData] = useState({
    name: "", whatsapp: "",
    income: "", hasDownPayment: "não", downPayment: "",
    cpf: "", rg: "", hasCnh: "não", motherName: "", birthDate: "", maritalStatus: "Solteiro",
    zipCode: "", street: "", number: "", neighborhood: "", city: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === "whatsapp") value = value.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (name === "cpf") value = value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    if (name === "birthDate") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    }
    if (name === "zipCode") {
      value = value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadio = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchCep = async () => {
    const cep = formData.zipCode.replace("-", "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: `${data.localidade} - ${data.uf}` }));
      }
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    if (step === 4) {
      setLoading(true);
      try {
        const finalVehicleId = selectedVehicleId === "nao_sei" || !selectedVehicleId ? null : selectedVehicleId;

        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, vehicleId: finalVehicleId, hasDownPayment: formData.hasDownPayment === "sim" })
        });
        setLoading(false);
        setStep(5);
        
        // ENVIO AUTOMÁTICO PARA WHATSAPP
        setTimeout(() => {
          openWhatsApp(formData);
        }, 500);
      } catch (err) {
        alert("Erro ao enviar dados, tente novamente");
        setLoading(false);
      }
    }
  };

  const openWhatsApp = (currentData = formData) => {
    const number = "5535984356108";
    const commonData = `
👤 *Dados Pessoais:*
Nome: ${currentData.name}
WhatsApp: ${currentData.whatsapp}
CPF: ${currentData.cpf} | RG: ${currentData.rg}
CNH: ${currentData.hasCnh === "sim" ? "Sim" : "Não"}
Mãe: ${currentData.motherName}
Nasc: ${currentData.birthDate}
Estado Civil: ${currentData.maritalStatus}

💰 *Financeiro:*
Renda: ${currentData.income}
Entrada: ${currentData.hasDownPayment === "sim" ? currentData.downPayment : "Não possui"}

📍 *Endereço:*
CEP: ${currentData.zipCode}
${currentData.street}, ${currentData.number}
${currentData.neighborhood}
${currentData.city}
`;
    
    let vehicleText = "Ainda não definido";
    if (selectedVehicleId === "nao_sei") {
      vehicleText = "Ainda não sei / Quero ajuda";
    } else if (selectedVehicleName) {
      vehicleText = selectedVehicleName;
    }

    const wppText = `Olá Eduardo, solicito uma análise de crédito no seu sistema 👇\n\n📌 *Veículo de interesse:*\n${vehicleText}\n${commonData}`;

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(wppText)}`, "_blank");
    window.location.href = selectedVehicleId && selectedVehicleId !== "nao_sei" ? `/catalogo/${selectedVehicleId}` : `/catalogo`;
  };

  const renderStepIndicators = () => {
    return (
      <div className={styles.segmentsContainer}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`${styles.segment} ${i <= step ? styles.segmentActive : ""}`} />
        ))}
      </div>
    )
  }
  
  const renderVehicleSelection = () => {
    if (selectedVehicleId === "nao_sei") {
      return (
        <div style={{ background: "#F3F4F6", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HelpCircle size={22} color="var(--primary)" />
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase" }}>Veículo selecionado:</p>
              <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.95rem" }}>Ainda não sei / Ajuda</p>
            </div>
          </div>
          <button type="button" onClick={() => { setSelectedVehicleId(""); setSelectedVehicleName(""); }} style={{ background: "white", border: "1px solid var(--border-color)", padding: "6px 12px", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", color: "var(--text-dark)", fontWeight: "600" }} >
            Trocar
          </button>
        </div>
      );
    }

    if (selectedVehicleId && selectedVehicleId !== "nao_sei") {
      return (
        <div style={{ background: "#EBF5FB", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #AED6F1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "white", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <CarFront size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase" }}>🚗 Veículo selecionado</p>
              <p style={{ fontWeight: "700", color: "var(--text-dark)", fontSize: "1rem", marginTop: "2px" }}>{selectedVehicleName}</p>
            </div>
          </div>
          <button type="button" onClick={() => { setSelectedVehicleId(""); setSelectedVehicleName(""); }} style={{ background: "white", border: "1px solid #AED6F1", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", color: "var(--primary)", fontWeight: "600", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8f9fa"} onMouseOut={(e) => e.currentTarget.style.background = "white"}>
            Trocar
          </button>
        </div>
      );
    }

    return (
      <div className={styles.inputGroup} style={{ marginBottom: "24px" }}>
        <label>Veículo de interesse</label>
        <select 
          required 
          className={styles.selectNative}
          value={selectedVehicleId}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedVehicleId(val);
            if (val === "nao_sei") setSelectedVehicleName("Ainda não sei / Quero ajuda");
            else {
              const v = vehicles.find(x => x.id === val);
              if (v) setSelectedVehicleName(`${v.name} ${v.year}`);
            }
          }}
          style={{ padding: "14px", fontWeight: "500", border: "2px solid var(--border-color)" }}
        >
          <option value="">- Selecione uma opção -</option>
          <optgroup label="Precisa de ajuda?">
            <option value="nao_sei">🙋‍♂️ Ainda não sei / Quero ajuda</option>
          </optgroup>
          {vehicles.length > 0 && (
            <optgroup label="Veículos do Catálogo">
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} {v.year} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    );
  }

  const renderStepContent = () => {
    switch(step) {
      case 1: return (
        <>
          <div className={styles.stepHeader}>
            <h3 className={styles.formTitle}>Preencha em menos de 1 minuto</h3>
            <p className={styles.formSubtitle}>Leve e rápido!</p>
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input required type="text" name="name" placeholder="Nome completo" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input required type="text" name="whatsapp" placeholder="Seu WhatsApp" value={formData.whatsapp} onChange={handleChange} maxLength={15} />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>Continuar</button>
          
          <div className={styles.footerInfo} style={{ borderTop: "1px solid var(--border-color)", marginTop: "30px", paddingTop: "15px" }}>
            Seus dados são 100% confidenciais.
          </div>
        </>
      );
      case 2: return (
        <>
          <div className={styles.stepHeader}>
            <h3 className={styles.formTitleSmall}>Perfil + Veículo</h3>
          </div>
          
          {renderVehicleSelection()}

          <div className={styles.inputGroup}>
            <label>Renda Mensal</label>
            <input required type="text" name="income" placeholder="R$" value={formData.income} onChange={handleChange} />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Possui entrada?</label>
            <div className={styles.radioGroup}>
              <button type="button" className={styles.radioBtn} onClick={() => handleRadio("hasDownPayment", "sim")}>
                <div className={`${styles.radioCircle} ${formData.hasDownPayment === "sim" ? styles.radioSelected : ""}`}></div>
                Sim
              </button>
              <button type="button" className={styles.radioBtn} onClick={() => handleRadio("hasDownPayment", "não")}>
                <div className={`${styles.radioCircle} ${formData.hasDownPayment === "não" ? styles.radioSelected : ""}`}></div>
                Não
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Valor da Entrada</label>
            <input type="text" name="downPayment" placeholder="R$" value={formData.downPayment} onChange={handleChange} disabled={formData.hasDownPayment === "não"} />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>Próximo</button>
        </>
      );
      case 3: return (
        <>
          <div className={styles.stepHeader}>
            <h3 className={styles.formTitle}>Dados Pessoais</h3>
          </div>
          <div className={styles.inputGroup}>
            <label>CPF</label>
            <input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} maxLength={14} />
          </div>
          <div className={styles.inputGroup}>
            <label>RG</label>
            <input required type="text" name="rg" value={formData.rg} onChange={handleChange} maxLength={14} />
          </div>
          <div className={styles.inputGroup}>
            <label>Nome da Mãe</label>
            <input required type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Possui CNH?</label>
            <div className={styles.radioGroup}>
              <button type="button" className={styles.radioBtn} onClick={() => handleRadio("hasCnh", "sim")}>
                <div className={`${styles.radioCircle} ${formData.hasCnh === "sim" ? styles.radioSelected : ""}`}></div>
                Sim
              </button>
              <button type="button" className={styles.radioBtn} onClick={() => handleRadio("hasCnh", "não")}>
                <div className={`${styles.radioCircle} ${formData.hasCnh === "não" ? styles.radioSelected : ""}`}></div>
                Não
              </button>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Data de Nascimento</label>
            <input required type="text" name="birthDate" placeholder="DD/MM/AAAA" value={formData.birthDate} onChange={handleChange} maxLength={10} />
          </div>
          <div className={styles.inputGroup}>
            <label>Estado Civil</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={styles.selectNative}>
              <option value="Selecione">- Selecione -</option>
              <option value="Solteiro">Solteiro</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viúvo">Viúvo</option>
            </select>
          </div>

          <div className={styles.footerSecure}>
            <Lock size={18} color="var(--primary)" />
            <span>Seus dados são protegidos e usados apenas para analise.</span>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>Próximo</button>
        </>
      );
      case 4: return (
        <>
          <div className={styles.stepHeader}>
            <h3 className={styles.formTitle}>Informe seu Endereço</h3>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.cepWrapper}>
              <input required type="text" name="zipCode" placeholder="CEP" value={formData.zipCode} onChange={handleChange} maxLength={9} />
              <button type="button" className={styles.btnSearchCep} onClick={fetchCep}>Buscar</button>
            </div>
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input type="text" name="street" placeholder="Rua" value={formData.street} onChange={handleChange} />
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input required type="text" name="number" placeholder="Número" value={formData.number} onChange={handleChange} />
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input type="text" name="neighborhood" placeholder="Bairro" value={formData.neighborhood} onChange={handleChange} />
          </div>
          <div className={styles.inputGroupNoLabel}>
            <input type="text" name="city" placeholder="Cidade" value={formData.city} onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "20px" }}>
            {loading ? <Loader2 className="animate-spin" /> : "Próximo"}
          </button>
        </>
      );
      case 5: return (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ background: "#dcfce7", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
            <CheckCircle color="#166534" size={40} style={{ margin: "0 auto 12px" }} />
            <h3 className={styles.formTitleSmall} style={{ color: "#166534" }}>Enviado com sucesso!</h3>
          </div>
          <p className={styles.formSubtitle} style={{ marginTop: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
            Você será redirecionado para o WhatsApp em instantes...
          </p>

          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "25px", color: "var(--text-dark)" }}>Obrigado!</h2>
          <p style={{ fontWeight: "600", color: "var(--primary)", marginTop: "10px", marginBottom: "30px" }}>Clique abaixo se não for redirecionado:</p>

          <button type="button" onClick={() => openWhatsApp()} className="btn-primary green">
            Falar com Eduardo no WhatsApp
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.formContainerWrapper}>
      <div className={styles.formCard}>
        <div className={styles.progressSection}>
          <div className={styles.progressText}>
            <span style={{ color: "var(--primary)" }}>Etapa {step}</span> de 5
          </div>
          {renderStepIndicators()}
        </div>

        <form onSubmit={step < 5 ? handleSubmit : (e) => e.preventDefault()} className={styles.formFields}>
          {renderStepContent()}
        </form>
      </div>
    </div>
  );
}
