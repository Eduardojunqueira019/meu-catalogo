export default function CatalogFooter({ profile }: { profile: any }) {
  if (!profile) return null;

  return (
    <footer style={{
      padding: "80px 20px 60px",
      textAlign: "center",
      background: "linear-gradient(to bottom, var(--app-bg), #ffffff)",
      marginTop: "40px",
      color: "var(--text-light)",
      fontSize: "0.9rem",
      borderTop: "1px solid var(--border-color)"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          {profile.storeLogoUrl ? (
            <img 
              src={profile.storeLogoUrl} 
              alt={profile.storeName} 
              style={{ 
                height: "80px", 
                width: "auto", 
                marginBottom: "16px",
                objectFit: "contain"
              }} 
            />
          ) : (
            <>
              <h3 style={{ 
                color: "var(--text-dark)", 
                marginBottom: "8px", 
                fontSize: "1.3rem", 
                fontWeight: "800",
                letterSpacing: "-0.5px"
              }}>
                {profile.storeName}
              </h3>
              <div style={{ 
                width: "40px", 
                height: "3px", 
                background: "var(--primary)", 
                margin: "0 auto",
                borderRadius: "2px"
              }}></div>
            </>
          )}
        </div>

        <div style={{ marginBottom: "32px", lineHeight: "1.6" }}>
          <p style={{ fontWeight: "600", color: "var(--text-dark)" }}>{profile.address}</p>
          <p>{profile.city}</p>
        </div>
        
        {/* Social Links in Footer */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-light)" }}>
              Instagram
            </a>
          )}
          {profile.whatsapp && (
            <a href={`https://wa.me/55${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-light)" }}>
              WhatsApp
            </a>
          )}
        </div>
        
        <p style={{ opacity: 0.6, fontSize: "0.8rem", letterSpacing: "0.5px" }}>
          © {new Date().getFullYear()} — {profile.name.toUpperCase()}
          <br/>
          <span style={{ fontSize: "0.7rem" }}>TODOS OS DIREITOS RESERVADOS</span>
        </p>
      </div>
    </footer>
  );
}

