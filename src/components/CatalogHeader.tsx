import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CatalogHeader({ profile }: { profile: any }) {
  if (!profile) return null;

  // Custom SVG Icons for maximum reliability and premium look
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
      color: "white",
      padding: "50px 20px 40px",
      borderRadius: "0 0 40px 40px",
      marginBottom: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      position: "relative"
    }}>
      {/* Back Button */}
      <Link href="/" style={{ 
        position: "absolute", 
        left: "24px", 
        top: "24px", 
        color: "white",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <ChevronLeft size={24} />
      </Link>

      {/* Profile Card Overlay */}
      <div style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(15px)",
        padding: "30px",
        borderRadius: "32px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Avatar */}
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          padding: "4px",
          background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          margin: "0 auto 16px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.4)"
        }}>
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "white"
          }}>
            <img 
              src={profile.photoUrl || "/placeholder-user.jpg"} 
              alt={profile.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
        </div>
        
        <h1 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "4px", letterSpacing: "-0.5px" }}>{profile.name}</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--primary-light)", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{profile.role}</p>
        
        {profile.bio && (
          <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "24px", lineHeight: "1.5" }}>
            {profile.bio}
          </p>
        )}
        
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <a 
            href={`https://wa.me/55${profile.whatsapp.replace(/\D/g, "")}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#25D366",
              color: "white",
              padding: "12px 20px",
              borderRadius: "16px",
              fontSize: "0.9rem",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          
          <a 
            href={`https://instagram.com/${profile.instagram.replace("@", "")}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
            title="Instagram"
          >
            <InstagramIcon />
          </a>

          {profile.facebook && (
            <a 
              href={profile.facebook.includes("http") ? profile.facebook : `https://facebook.com/${profile.facebook}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
