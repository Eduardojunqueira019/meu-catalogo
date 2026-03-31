import Link from "next/link";
import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await prisma.profile.findFirst() || {
    name: "Eduardo Junqueira",
    role: "Vendedor de Veículos",
    storeName: "Agência Campos",
    photoUrl: "/placeholder-user.jpg",
    bio: "Te ajudo a encontrar e financiar o carro ideal com segurança"
  };

  const nameParts = profile.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div className={styles.homeContainer}>
      <div className={styles.headerHero}>
        <h1 className={styles.welcomeText}>Bem-vindo!</h1>
        <svg className={styles.wave} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="1" d="M0,160L80,149.3C160,139,320,117,480,122.7C640,128,800,160,960,170.7C1120,181,1280,171,1360,165.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      <div className={styles.profileSection}>
        <div 
          className={styles.avatarImage} 
          style={{ 
            backgroundImage: `url(${profile.photoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className={styles.profileText}>
          <h2>{firstName}<br/>{lastName}</h2>
          <span className={styles.jobTitle}>{profile.role}</span>
        </div>
      </div>

      <div className={styles.midSection}>
        <p className={styles.helperText}>
          {profile.bio}
        </p>

        <div className={styles.buttons}>
          <Link href="/catalogo" className="btn-primary">
            Ver Veículos Disponíveis
          </Link>
          <Link href="/simulacao" className="btn-outline" style={{ marginTop: "12px" }}>
            Fazer Simulação de Financiamento
          </Link>
        </div>
      </div>

      <div className={styles.footerSection}>
        <div className={styles.footerWaves}></div>
        
        <div className={styles.footerContent}>
          <div className={styles.wppIcon}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <p style={{ flex: 1 }}>Veículos disponíveis pela <strong>{profile.storeName}</strong></p>
          <Link href="/login" style={{ color: "var(--text-light)", padding: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

