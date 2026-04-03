import { prisma } from "@/lib/prisma";
import IntegradorClient from "./IntegradorClient";

export const dynamic = "force-dynamic";

export default async function IntegradorPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "disponivel" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      year: true,
      images: true,
      options: true,
    }
  });

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "24px", color: "var(--primary)", margin: "0" }}>Integrador de Anúncios</h1>
        <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Selecione os veículos para publicação rápida em seus canais externos.</p>
      </div>

      <IntegradorClient vehicles={vehicles} />
    </div>
  );
}
