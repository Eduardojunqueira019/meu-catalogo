"use client";

import { useState } from "react";
import { User, Trash2, Eye, MessageCircle, X, ExternalLink, Calendar, MapPin, Briefcase, FileText, CreditCard } from "lucide-react";
import { deleteLead } from "@/app/actions/lead";
import Link from "next/link";

interface LeadsListProps {
  initialLeads: any[];
  profile: any;
}

export default function LeadsList({ initialLeads, profile }: LeadsListProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o lead de "${name}"?`)) return;
    
    setDeletingId(id);
    const result = await deleteLead(id);
    if (result.success) {
      setLeads(leads.filter(l => l.id !== id));
    } else {
      alert("Erro ao excluir lead: " + result.error);
    }
    setDeletingId(null);
  };

  const getWhatsAppLink = (lead: any) => {
    if (!lead.whatsapp) return null;
    
    const phone = lead.whatsapp.replace(/\D/g, "");
    let message = profile?.whatsappMessage || "Olá [nome], vi seu interesse no veículo [veiculo] em nosso site. Como posso te ajudar?";
    
    message = message.replace(/\[nome\]/gi, lead.name);
    message = message.replace(/\[veiculo\]/gi, lead.vehicle?.name || "veículo");
    
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {leads.length === 0 ? (
        <div style={{ background: "white", padding: "40px", textAlign: "center", color: "var(--text-light)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <p>Nenhum lead recebido ainda.</p>
        </div>
      ) : (
        leads.map((lead) => (
          <div key={lead.id} style={{ 
            background: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: lead.status === "novo" ? "0 4px 20px rgba(59, 130, 246, 0.12)" : "0 2px 4px rgba(0,0,0,0.02)", 
            border: lead.status === "novo" ? "1px solid #3b82f6" : "1px solid var(--border-color)", 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px",
            position: "relative",
            transition: "all 0.2s"
          }}>
            {lead.status === "novo" && (
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "24px",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "2px 10px",
                borderRadius: "20px",
                fontSize: "0.65rem",
                fontWeight: "800",
                letterSpacing: "0.05em"
              }}>
                NOVO
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "12px" }}>
                  <User color="#3b82f6" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>{lead.name}</h3>
                  <div style={{ display: "flex", gap: "12px", marginTop: "4px", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "0.9rem" }}>{lead.whatsapp}</span>
                    <a 
                      href={getWhatsAppLink(lead) || "#"} 
                      target="_blank" 
                      style={{ 
                        background: "#25d366", 
                        color: "white", 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontSize: "0.75rem", 
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right", minWidth: "180px" }}>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>Interesse:</p>
                <Link href={`/catalogo/${lead.vehicleId}`} target="_blank" style={{ fontWeight: "700", color: "#1e293b", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                  {lead.vehicle?.name || "Veículo removido"} <ExternalLink size={14} />
                </Link>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(lead.createdAt))}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "8px" }}>
              <button 
                onClick={() => setSelectedLead(lead)}
                style={{ 
                  flex: 1,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  background: "#f8fafc", 
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                <Eye size={18} /> Ver Todos os Dados
              </button>
              
              <button 
                onClick={() => handleDelete(lead.id, lead.name)}
                disabled={deletingId === lead.id}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  background: "#fff1f2", 
                  border: "1px solid #fecaca",
                  color: "#e11d48",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                title="Excluir Lead"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal de Detalhes */}
      {selectedLead && (
        <div style={{ 
          position: "fixed", 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(15, 23, 42, 0.5)", 
          zIndex: 1000,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{ 
            background: "white", 
            width: "100%", 
            maxWidth: "700px", 
            maxHeight: "90vh", 
            borderRadius: "20px", 
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Detalhes do Lead</h2>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>{selectedLead.name}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "8px", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Seção 1: Financeiro */}
              <section>
                <h3 style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={18} /> Perfil Financeiro
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>Renda Mensal</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: "4px 0 0" }}>{selectedLead.income || "Não informado"}</p>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>Entrada Disponível</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: "4px 0 0" }}>{selectedLead.hasDownPayment ? selectedLead.downPayment : "Sem entrada"}</p>
                  </div>
                </div>
              </section>

              {/* Seção 2: Dados Pessoais */}
              <section>
                <h3 style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={18} /> Dados Pessoais
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "CPF", value: selectedLead.cpf },
                    { label: "RG", value: selectedLead.rg },
                    { label: "Nascimento", value: selectedLead.birthDate },
                    { label: "Estado Civil", value: selectedLead.maritalStatus },
                    { label: "Possui CNH", value: selectedLead.hasCnh },
                    { label: "Nome da Mãe", value: selectedLead.motherName },
                    { label: "E-mail", value: selectedLead.email }
                  ].map((item, idx) => item.value && (
                    <div key={idx} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <p style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155", margin: "2px 0 0" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Seção 3: Endereço */}
              <section>
                <h3 style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={18} /> Endereço Residencial
                </h3>
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", color: "#334155" }}>
                  <p style={{ margin: 0, fontWeight: "600" }}>{selectedLead.street}, {selectedLead.number}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#64748b" }}>{selectedLead.neighborhood} - {selectedLead.city}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#64748b" }}>CEP: {selectedLead.zipCode}</p>
                </div>
              </section>

              {/* Seção 4: Profissional */}
              <section>
                <h3 style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={18} /> Dados Profissionais
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Profissão", value: selectedLead.profession },
                    { label: "Empresa", value: selectedLead.company },
                    { label: "Tempo de Trabalho", value: selectedLead.workTime },
                    { label: "Tipo de Contrato", value: selectedLead.jobType }
                  ].map((item, idx) => item.value && (
                    <div key={idx} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <p style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155", margin: "2px 0 0" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div style={{ padding: "24px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", gap: "12px" }}>
              <a 
                href={getWhatsAppLink(selectedLead) || "#"} 
                target="_blank" 
                style={{ 
                  flex: 2,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "10px", 
                  padding: "14px", 
                  borderRadius: "10px", 
                  background: "#25d366", 
                  color: "white", 
                  fontSize: "1rem", 
                  fontWeight: "700",
                  textDecoration: "none"
                }}
              >
                <MessageCircle size={20} /> Iniciar Conversa no WhatsApp
              </a>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ 
                  flex: 1,
                  padding: "14px", 
                  borderRadius: "10px", 
                  background: "white", 
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
