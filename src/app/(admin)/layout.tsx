"use client";
import { useState } from "react";
import Link from "next/link";
import { CarFront, LogOut, LayoutDashboard, Users, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
 
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
 
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
 
  const navItems = [
    { name: "Dashboard / Veículos", href: "/admin", icon: LayoutDashboard },
    { name: "Leads Recebidos", href: "/admin/leads", icon: Users },
    { name: "Meu Perfil", href: "/admin/perfil", icon: User },
  ];
 
  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      
      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CarFront size={22} color="#1d4ed8" />
          <span style={{ fontWeight: "700", fontSize: "1rem" }}>Admin</span>
        </div>
        <button onClick={toggleSidebar} style={{ background: "transparent", color: "white", padding: "8px" }}>
          <Menu size={24} />
        </button>
      </header>
 
      {/* Sidebar Overlay */}
      <div className={`admin-sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar} />
 
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ width: "260px", backgroundColor: "#1e293b", color: "white", padding: "24px 16px", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", padding: "0 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CarFront size={24} color="#1d4ed8" />
            <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Admin Panel</span>
          </div>
          <button onClick={closeSidebar} className="mobile-only" style={{ display: "none", background: "transparent", color: "white" }}>
             <X size={24} />
          </button>
          <style jsx>{`
            @media (max-width: 768px) {
              .mobile-only { display: block !important; }
            }
          `}</style>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={closeSidebar}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  color: active ? "white" : "#94a3b8", 
                  backgroundColor: active ? "#334155" : "transparent",
                  textDecoration: "none",
                  fontWeight: active ? "600" : "500",
                  transition: "0.2s"
                }}
              >
                <Icon size={20} /> {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ position: "absolute", bottom: "32px", left: "16px", right: "16px" }}>
          <form action="/api/logout" method="POST">
            <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)", borderRadius: "10px", color: "#f87171", cursor: "pointer", fontSize: "0.95rem", fontWeight: "600" }}>
              <LogOut size={20} /> Sair do sistema
            </button>
          </form>
        </div>
      </aside>
 
      {/* Main Content */}
      <main className="admin-main" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "var(--admin-padding, 20px)" }}>
           {children}
        </div>
        <style jsx global>{`
          :root {
            --admin-padding: 16px;
          }
          @media (min-width: 768px) {
            :root {
              --admin-padding: 40px;
            }
          }
           .admin-main {
             width: 100%;
             max-width: 100vw;
             overflow-x: hidden;
           }
        `}</style>
      </main>
    </div>
  );
}
