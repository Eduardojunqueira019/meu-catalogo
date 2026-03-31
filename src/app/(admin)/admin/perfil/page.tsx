import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const profile = await prisma.profile.findFirst();
  
  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--text-dark)", marginBottom: "8px" }}>Configurações de Perfil</h1>
        <p style={{ color: "var(--text-light)" }}>As informações abaixo são exibidas no catálogo público para seus clientes.</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
