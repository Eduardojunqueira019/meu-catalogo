import Link from "next/link";
import { CarFront, LogOut, LayoutDashboard, Users, User } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#1e293b", color: "white", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px", padding: "0 10px" }}>
          <CarFront size={24} color="#1d4ed8" />
          <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Admin Panel</span>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "#e2e8f0", textDecoration: "none" }}>
            <LayoutDashboard size={20} /> Dashboard / Veículos
          </Link>
          <Link href="/admin/leads" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "#e2e8f0", textDecoration: "none" }}>
            <Users size={20} /> Leads Recebidos
          </Link>
          <Link href="/admin/perfil" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "#e2e8f0", textDecoration: "none" }}>
            <User size={20} /> Meu Perfil
          </Link>
        </nav>
        
        <div style={{ position: "absolute", bottom: "24px" }}>
          <form action="/api/logout" method="POST">
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "1rem" }}>
              <LogOut size={20} /> Sair do sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
