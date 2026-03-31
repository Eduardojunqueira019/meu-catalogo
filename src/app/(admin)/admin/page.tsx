import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import VehicleActions from "./VehicleActions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "var(--text-dark)", marginBottom: "8px" }}>Gestão de Veículos</h1>
          <p style={{ color: "var(--text-light)" }}>Gerencie seu estoque de veículos cadastrados.</p>
        </div>
        
        <Link href="/admin/veiculos/novo" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PlusCircle size={20} />
          Cadastrar Veículo
        </Link>
      </div>

      <div className="table-container" style={{ background: "white", borderRadius: "12px", boxShadow: "var(--box-shadow)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
        {vehicles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
            <Search size={40} style={{ opacity: 0.3, margin: "0 auto 16px" }} />
            <p>Nenhum veículo cadastrado ainda.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
            <thead>
              <tr style={{ background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-light)" }}>Veículo</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-light)" }}>Ano</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-light)" }}>Preço</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-light)" }}>Status</th>
                <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-light)", textAlign: "right" }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "16px", fontWeight: "600" }}>
                    <Link href={`/catalogo/${v.id}`} target="_blank" style={{ color: "var(--primary)" }}>
                      {v.name}
                    </Link>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-dark)" }}>{v.year}</td>
                  <td style={{ padding: "16px", color: "var(--text-dark)" }}>R$ {v.price}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      background: v.status === "disponivel" ? "#dcfce7" : "#fee2e2", 
                      color: v.status === "disponivel" ? "#166534" : "#991b1b", 
                      padding: "4px 12px", 
                      borderRadius: "20px", 
                      fontSize: "0.85rem", 
                      fontWeight: "bold",
                      whiteSpace: "nowrap"
                    }}>
                      {v.status === "disponivel" ? "Disponível" : "Vendido"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <VehicleActions id={v.id} name={v.name} year={v.year} price={v.price} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
