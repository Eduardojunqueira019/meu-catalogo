import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Filter, ArrowUpDown, Download, Eye, MessageSquare, AlertCircle, Clock, Trash2, ExternalLink, Share2 } from "lucide-react";
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
      {/* Header section with Search & Actions */}
      <header className={styles.adminHeader}>
        <div className={styles.titleLine}>
          <h1 className={styles.pageTitle}>Veículos</h1>
        </div>

        <div className={styles.searchToolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Buscar por placa, modelo, marca..." 
              className={styles.searchInput} 
            />
          </div>
          <button className={styles.toolBtn} title="Filtrar"><Filter size={18} /></button>
          <button className={styles.toolBtn} title="Ordenar"><ArrowUpDown size={18} /></button>
          <button className={styles.toolBtn} title="Exportar"><Download size={18} /></button>
        </div>
        
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>{vehicleCount} veículos</p>
      </header>

      {/* Vehicle Grid */}
      <div className={styles.vehicleGrid}>
        {vehicles.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "80px 40px", textAlign: "center", color: "var(--text-light)", background: "white", borderRadius: "12px" }}>
            <Search size={48} style={{ opacity: 0.1, margin: "0 auto 16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>Nenhum veículo no estoque.</p>
          </div>
        ) : (
          vehicles.map((v) => {
            let imageUrl = "/placeholder-car.jpg";
            try {
              if (v.images) {
                const images = JSON.parse(v.images);
                if (images.length > 0) imageUrl = images[0];
              }
            } catch (e) {}

            // Mocked labels to match the provided design
            const plate = `PER-7C${v.id.substring(0, 2).toUpperCase()}`;

            return (
              <div key={v.id} className={styles.vehicleCard}>
                <Link href={`/catalogo/${v.id}`} className={styles.cardClickableArea} target="_blank">
                  <div className={styles.cardMain}>
                    {/* Left: Image Section */}
                    <div className={styles.imageSection}>
                      <div className={styles.imageOverlay}>{plate}</div>
                      <img src={imageUrl} alt={v.name} className={styles.thumbnail} />
                      <div className={styles.imageBadge}>PRÓPRIO</div>
                    </div>

                    {/* Right: Details Section */}
                    <div className={styles.detailsSection}>
                      <div className={styles.nameLine}>
                        <h3 className={styles.vehicleName}>{v.name}</h3>
                        <p className={styles.vehicleSub}>
                          {v.gearbox} • {v.year}/{v.year} • {v.km.toLocaleString()} km
                        </p>
                      </div>

                      <div className={styles.statusTags}>
                        {v.isIpvaPago && <span className={`${styles.tag} ${styles.tagIpva}`} title="IPVA Pago">📄 IPVA</span>}
                        {v.isLeilao && <span className={`${styles.tag} ${styles.tagLeilao}`} title="Veículo de Leilão">🔨 Leilão</span>}
                        {v.isAlienado && <span className={`${styles.tag} ${styles.tagAlienado}`} title="Possui Alienação">🏦 Alienado</span>}
                        {v.isGarantia && <span className={`${styles.tag} ${styles.tagGarantia}`} title="Garantia de 3 meses">🛡️ Garantia</span>}
                        
                        {!v.isIpvaPago && !v.isLeilao && !v.isAlienado && !v.isGarantia && (
                          <span className={styles.tag} style={{ opacity: 0.5 }}>Sem tags</span>
                        )}
                      </div>

                      <div className={styles.featuresRow}>
                        <span className={styles.feature}>Completo</span>
                        <span className={styles.feature}>Estoque</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{v.type.toUpperCase()}</span>
                        <span style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b" }}>{formatCurrency(v.price)}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Card Footer stays separate for actions */}
                <div className={styles.cardFooter}>
                  <div className={styles.storeInfo}>
                     <Eye size={14} /> Minha Loja T1
                  </div>
                  <div className={styles.statsInfo}>
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


