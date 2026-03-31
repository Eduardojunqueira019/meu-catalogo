import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/utils/format";
import styles from "./page.module.css";
import CatalogHeader from "@/components/CatalogHeader";
import CatalogFooter from "@/components/CatalogFooter";
import CatalogControls from "@/components/CatalogControls";
import { Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const typeFilter = typeof resolvedParams?.type === "string" ? resolvedParams.type : "Todos";
  const query = typeof resolvedParams?.q === "string" ? resolvedParams.q : "";
  const sort = typeof resolvedParams?.sort === "string" ? resolvedParams.sort : "newest";

  const whereClause: any = { status: "disponivel" };
  
  if (typeFilter !== "Todos") {
    whereClause.type = typeFilter;
  }

  if (query) {
    whereClause.name = { contains: query };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    orderBy: orderBy,
  });

  const profile = await prisma.profile.findFirst() || {
    name: "Eduardo Junqueira",
    role: "Vendedor de Veículos",
    storeName: "Agência Campos",
    photoUrl: "https://ui-avatars.com/api/?name=EJ&background=1d4ed8&color=fff",
    whatsapp: "35984356108",
    instagram: "eduardojunqueira",
    bio: "Te ajudo a encontrar e financiar o carro ideal com segurança",
    address: "Rua Exemplo, 123",
    city: "Pouso Alegre - MG"
  };

  const categories = ["Todos", "Hatch", "Sedan", "SUV"];

  return (
    <div className={styles.catalogContainer} style={{ background: "var(--app-bg)" }}>
      <CatalogHeader profile={profile} />

      {/* Search and Sort Section (Client Component) */}
      <CatalogControls 
        initialQuery={query} 
        initialSort={sort} 
        typeFilter={typeFilter} 
      />

      {/* Segmented Controls */}
      <div className={styles.tabsContainer}>
        {categories.map((cat) => (
          <Link 
            key={cat}
            href={`/catalogo?type=${cat}${query ? `&q=${query}` : ""}${sort ? `&sort=${sort}` : ""}`}
            className={`${styles.tab} ${typeFilter === cat ? styles.tabActive : ""}`}
            replace
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Vehicle List */}
      <div className={styles.vehiclesList}>
        {vehicles.map((v) => {
          let imageUrl = "/placeholder-car.jpg";
          try {
            const images = JSON.parse(v.images);
            if (images.length > 0) imageUrl = images[0];
          } catch (e) {}

          return (
            <div key={v.id} className={styles.vehicleItem}>
              <div className={styles.thumbnail}>
                <img src={imageUrl} alt={v.name} />
              </div>
              <div className={styles.details}>
                <h3 className={styles.name}>{v.name}</h3>
                <p className={styles.price}>{formatCurrency(v.price)}</p>
                <Link href={`/catalogo/${v.id}`} className={styles.detailsBtn}>
                  Ver Detalhes &gt;
                </Link>
              </div>
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-light)", width: "100%" }}>
            <Search size={48} style={{ margin: "0 auto", opacity: 0.2, marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>Nenhum veículo encontrado</p>
            <p style={{ marginTop: "8px" }}>Tente ajustar sua busca ou filtros.</p>
            <Link href="/catalogo" style={{ display: "inline-block", marginTop: "20px", color: "var(--primary)", fontWeight: "bold" }}>
              Limpar Filtros
            </Link>
          </div>
        )}
      </div>
      
      <CatalogFooter profile={profile} />
    </div>
  );
}
