import { prisma } from "@/lib/prisma";
import LeadsList from "./LeadsList";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, profile] = await Promise.all([
    prisma.lead.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findFirst()
  ]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <div style={{ marginBottom: "40px", textAlign: "left" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>📦 Gestão de Leads</h1>
        <p style={{ color: "#64748b", fontSize: "1.05rem" }}>Acompanhe as simulações de financiamento e entre em contato com seus clientes.</p>
      </div>

      <LeadsList initialLeads={leads} profile={profile} />
    </div>
  );
}
