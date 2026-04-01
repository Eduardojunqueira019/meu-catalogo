import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import VehicleActions from "./VehicleActions";
import styles from "./admin.module.css";
import { formatCurrency } from "@/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });

  const vehicleCount = vehicles.length;

  return (
    <div className={styles.adminContainer}>
      {/* Header Summary */}
      <div className={styles.summaryBar}>
        {vehicleCount} {vehicleCount === 1 ? "VEÍCULO" : "VEÍCULOS"} EM ESTOQUE
      </div>

      <div className={styles.vehicleList}>
        {vehicles.length === 0 ? (
          <div style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-light)", background: "white" }}>
            <Search size={48} style={{ opacity: 0.1, margin: "0 auto 16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>Nenhum veículo cadastrado.</p>
            <p style={{ marginTop: "8px" }}>Toque no botão "+" para começar.</p>
          </div>
        ) : (
          vehicles.map((v) => {
            let imageUrl = "/placeholder-car.jpg";
            try {
              if (v.images) {
                const images = JSON.parse(v.images);
                if (images.length > 0) imageUrl = images[0];
              }
            } catch (e) {
              console.error("Error parsing images for vehicle", v.id, e);
            }

            // In the screenshot, there is a plate. Since we don't have it, we use a 
            // partial ID or KM as a placeholder to match the visual weight.
            const platePlaceholder = v.km > 0 ? `${v.km.toLocaleString()} KM` : `ID-${v.id.substring(0, 4).toUpperCase()}`;

            return (
              <div key={v.id} className={styles.vehicleCard}>
                {/* Image Section */}
                <div className={styles.imageWrapper}>
                  <img src={imageUrl} alt={v.name} className={styles.thumbnail} />
                  <div className={styles.updatedTag}>Atualizado</div>
                </div>

                {/* Details Section */}
                <div className={styles.details}>
                  <div className={styles.titleLine}>
                    <h3 className={styles.name}>{v.name} {v.year}</h3>
                    <p className={styles.subtitle}>
                      {v.gearbox} • {v.type.toUpperCase()} • {v.description.substring(0, 40)}{v.description.length > 40 ? "..." : ""}
                    </p>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.plate}>{platePlaceholder}</span>
                    <span className={styles.price}>{formatCurrency(v.price)}</span>
                  </div>

                  {/* Quick Actions Integration */}
                  <div className={styles.actionsRow}>
                    <VehicleActions id={v.id} name={v.name} year={v.year} price={v.price} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <Link href="/admin/veiculos/novo" className={styles.fab} title="Cadastrar Veículo">
        <Plus size={32} />
      </Link>
    </div>
  );
}

