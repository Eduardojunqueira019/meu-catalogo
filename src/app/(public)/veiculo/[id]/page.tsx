import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { formatCurrency, formatKM } from "@/utils/format";
import Header from "@/components/Header";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  
  if (!vehicle) return { title: "Veículo não encontrado" };

  let images: string[] = ["/placeholder-car.jpg"];
  try {
    const parsed = JSON.parse(vehicle.images);
    if (parsed.length > 0) images = parsed;
  } catch (e) {}

  return {
    title: `${vehicle.name} - ${vehicle.year}`,
    description: `Por apenas ${formatCurrency(vehicle.price)}. ${vehicle.options.split(",").slice(0, 3).join(", ")}. Confira essa oportunidade.`,
    openGraph: {
      title: `${vehicle.name} - ${vehicle.year}`,
      description: `Por apenas ${formatCurrency(vehicle.price)}.`,
      images: [images[0]],
      type: "website",
    }
  }
}

export default async function LeadVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) notFound();

  let images: string[] = ["/placeholder-car.jpg"];
  try {
    const parsed = JSON.parse(vehicle.images);
    if (parsed.length > 0) images = parsed;
  } catch (e) {}

  const profile = await prisma.profile.findFirst() || {
    whatsapp: "35999999999",
    name: "Vendedor"
  };

  const wppNumber = profile.whatsapp.replace(/\D/g, "");
  const wppMessage = encodeURIComponent(`Olá! Quero saber mais sobre: ${vehicle.name} (${formatCurrency(vehicle.price)}). Vi o anúncio.`);
  const wppHref = `https://wa.me/55${wppNumber}?text=${wppMessage}`;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", backgroundColor: "#fff", minHeight: "100vh", position: "relative" }}>
        <div style={{ backgroundColor: "var(--primary)" }}>
            <Header title={vehicle.name} backTo="/catalogo" color="white" />
        </div>
        <div style={{ marginTop: "-1px" }}>
            <ImageGallery images={images} alt={vehicle.name} />
        </div>

        <div style={{ padding: "20px" }}>
            <h1 style={{ fontSize: "28px", color: "#0f172a", margin: "0 0 5px 0", lineHeight: "1.2" }}>{vehicle.name}</h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 15px 0", fontWeight: "500" }}>Ano {vehicle.year} • {formatKM(vehicle.km).replace(' km', '')} km • {vehicle.gearbox}</p>
            
            <div style={{ fontSize: "32px", fontWeight: "800", color: "var(--primary)", marginBottom: "25px" }}>
                {formatCurrency(vehicle.price)}
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", color: "#334155", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                   <span style={{color: "var(--primary)"}}>✨</span> Destaques do carro:
                </h3>
                <ul style={{ paddingLeft: "15px", color: "#475569", margin: "0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {vehicle.options.split(",").slice(0, 6).map((opt, i) => {
                        const val = opt.trim();
                        if (!val) return null;
                        return (
                           <li key={i} style={{ fontSize: "14px", listStyle: "circle" }}>{val}</li>
                        )
                    })}
                </ul>
            </div>

            {vehicle.description && (
                <div style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", marginBottom: "40px", whiteSpace: "pre-wrap" }}>
                    {vehicle.description}
                </div>
            )}
            
            <a href={wppHref} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", justifyContent: "center", alignItems: "center", gap: "10px",
                backgroundColor: "#25D366", color: "white", padding: "18px", borderRadius: "12px",
                textDecoration: "none", fontWeight: "bold", fontSize: "18px", boxShadow: "0 4px 15px rgba(37,211,102,0.3)",
                width: "100%", boxSizing: "border-box", transition: "transform 0.2s"
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                FALAR NO WHATSAPP
            </a>
            <div style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
                Compre com segurança e agilidade.
            </div>
        </div>
    </div>
  );
}
