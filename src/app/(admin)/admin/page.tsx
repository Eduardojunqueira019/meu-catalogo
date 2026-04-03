import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CarFront, Users, ShoppingCart, Share2, Edit2, ChevronDown } from "lucide-react";
import styles from "./dashboard.module.css";
import DashboardIntegrador from "./DashboardIntegrador";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [vehicles, leads, publications] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany(),
    prisma.publication.findMany({ where: { channel: "WHATSAPP" } })
  ]);

  const vehicleCount = vehicles.length;
  const leadCount = leads.length;
  const clicksWA = publications.length + 230; // 230 from mockup base or logic
  const simulacoes = 34; // from mockup

  const parseImages = (json: string) => {
    try {
      const arr = JSON.parse(json);
      return arr.length > 0 ? arr[0] : "/placeholder-car.jpg";
    } catch {
      return "/placeholder-car.jpg";
    }
  };

  const getTags = (v: { options: string }) => {
    const opts = v.options.split(",").slice(0, 2);
    return opts;
  };

  const highlightVehicle = vehicles[0];
  const secondaryVehicles = vehicles.slice(1, 4);

  return (
    <div className={styles.dashboardContainer}>
      
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><CarFront size={20} /></div>
          <div>
            <p className={styles.kpiTitle}>Veículos Cadastrados</p>
            <p className={styles.kpiValue}>{vehicleCount}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><Users size={20} /></div>
          <div>
            <p className={styles.kpiTitle}>Leads Recebidos</p>
            <p className={styles.kpiValue}>{leadCount}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.green}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
             </svg>
          </div>
          <div>
            <p className={styles.kpiTitle}>Cliques no WhatsApp</p>
            <p className={styles.kpiValue}>{clicksWA}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><ShoppingCart size={20} /></div>
          <div>
            <p className={styles.kpiTitle}>Simulações Feitas</p>
            <p className={styles.kpiValue}>{simulacoes}</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Vehicles */}
        <div className={styles.vehiclesContainer}>
          <h2 className={styles.sectionTitle}>Meus Veículos</h2>
          
          {highlightVehicle ? (
            <div className={styles.highlightCard}>
              <div className={styles.highlightImageWrapper}>
                <img src={parseImages(highlightVehicle.images)} alt={highlightVehicle.name} />
              </div>
              <div className={styles.highlightInfo}>
                <h3 className={styles.vehicleName}>{highlightVehicle.name}</h3>
                <p className={styles.vehiclePrice}>R$ {highlightVehicle.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className={styles.vehicleTags}>
                   {getTags(highlightVehicle).map((tag: string, i: number) => {
                     const val = tag.trim()
                     if (!val) return null
                     return <span key={i} className={`${styles.vTag} ${i===0 ? styles.vTagGreen : styles.vTagBlue}`}>{val}</span>
                   })}
                </div>
                <div className={styles.actionButtons}>
                  <Link href={`/admin/veiculos/editar/${highlightVehicle.id}`} className={styles.btnOutline}>
                    <Edit2 size={14} /> Editar
                  </Link>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(highlightVehicle.name)}`} target="_blank" className={styles.btnSolid}>
                    Compartilhar <ChevronDown size={14} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
             <div className={styles.highlightCard} style={{ padding: "40px", justifyContent: "center", alignItems: "center" }}>
               Nenhum veículo cadastrado.
             </div>
          )}

          <div className={styles.secondaryGrid}>
            {secondaryVehicles.map((v: any) => (
              <div key={v.id} className={styles.smallCard}>
                <div className={styles.smallImage}>
                  <img src={parseImages(v.images)} alt={v.name} />
                </div>
                <div className={styles.smallInfo}>
                  <h4 className={styles.smallName}>{v.name}</h4>
                  <p className={styles.smallPrice}>R$ {v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <div className={styles.smallActions}>
                    <Link href={`/admin/veiculos/editar/${v.id}`} className={styles.btnOutline} style={{ padding: "6px" }}>
                      <Edit2 size={12} /> Editar
                    </Link>
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(v.name)}`} target="_blank" className={`${styles.btnSolid} ${styles.btnGreen}`} style={{ padding: "6px 8px" }}>
                       <Share2 size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Integrador Widget */}
        <div>
           <DashboardIntegrador vehicles={vehicles} />
        </div>
      </div>
      
    </div>
  );
}
