import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      vehicle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--text-dark)", marginBottom: "8px" }}>Leads Recebidos</h1>
        <p style={{ color: "var(--text-light)" }}>Histórico de clientes que simularam financiamento.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {leads.length === 0 ? (
          <div style={{ background: "white", padding: "40px", textAlign: "center", color: "var(--text-light)", borderRadius: "12px" }}>
            <p>Nenhum lead recebido ainda.</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "var(--box-shadow)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ background: "var(--primary-light)", padding: "12px", borderRadius: "50%" }}><User color="var(--primary)" /></div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-dark)" }}>{lead.name}</h3>
                    <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>{lead.whatsapp}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>Simulou pelo veículo:</p>
                  <Link href={`/catalogo/${lead.vehicleId}`} target="_blank" style={{ fontWeight: "700", color: "var(--primary)" }}>
                    {lead.vehicle?.name || "Veículo removido"}
                  </Link>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "4px" }}>
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(lead.createdAt))}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "0.95rem" }}>
                <div>
                  <strong style={{ color: "var(--text-dark)" }}>Perfil Financeiro:</strong>
                  <ul style={{ color: "var(--text-light)", marginLeft: "20px", marginTop: "4px" }}>
                    <li>Renda: {lead.income}</li>
                    <li>Entrada: {lead.hasDownPayment ? lead.downPayment : "Nenhum valor"}</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "var(--text-dark)" }}>Dados Pessoais:</strong>
                  <ul style={{ color: "var(--text-light)", marginLeft: "20px", marginTop: "4px" }}>
                    <li>Nasc: {lead.birthDate}</li>
                    <li>Estado Civil: {lead.maritalStatus}</li>
                    <li>CPF: {lead.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4")}</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "var(--text-dark)" }}>Endereço:</strong>
                  <p style={{ color: "var(--text-light)", marginTop: "4px" }}>
                    Rua {lead.street}, {lead.number} - {lead.neighborhood} <br/> {lead.city} - {lead.zipCode}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
