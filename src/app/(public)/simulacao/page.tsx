import SimulacaoForm from "@/components/SimulacaoForm";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SimulacaoGeralPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "disponivel" },
    select: { id: true, name: true, year: true, price: true }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: "white" }}>
      <Header title="Simulação de Financiamento" backTo="/" color="var(--primary)" />
      
      <SimulacaoForm vehicles={vehicles} />
    </div>
  );
}
