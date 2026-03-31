import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SimulacaoForm from "@/components/SimulacaoForm";
import Header from "@/components/Header";

export default async function SimulacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    notFound();
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { status: "disponivel" },
    select: { id: true, name: true, year: true, price: true }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: "white" }}>
      <Header title="Simulação de Financiamento" backTo={`/catalogo/${vehicle.id}`} color="var(--primary)" />
      
      <SimulacaoForm initialVehicleId={vehicle.id} initialVehicleName={`${vehicle.name} ${vehicle.year}`} vehicles={vehicles} />
    </div>
  );
}
