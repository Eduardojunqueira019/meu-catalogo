"use client";
import { useState } from "react";
import Link from "next/link";
import { CarFront, LogOut, LayoutDashboard, Users, User, Menu, X, Share2, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import LeadNotifier from "@/components/admin/LeadNotifier";
 
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
    { name: "Veículos", href: "/admin", icon: CarFront },
    { name: "Leads", href: "/admin/leads", icon: Users },
    { name: "Marketing", href: "#", icon: Share2 },
    { name: "Financeiro", href: "#", icon: MessageSquare },
    { name: "Perfil", href: "/admin/perfil", icon: User },
  ];
 
  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1F5F9" }}>
      
      {/* Real-time Notification Listener */}
      <LeadNotifier />
      
      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CarFront size={22} color="#3b82f6" />
          <span style={{ fontWeight: "700", fontSize: "1rem" }}>Admin</span>
        </div>
        <button onClick={toggleSidebar} style={{ background: "transparent", color: "white", padding: "8px" }}>
          <Menu size={24} />
        </button>
      </header>
 
      {/* Sidebar Overlay */}
      <div className={`admin-sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar} />
 
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ width: "80px", backgroundColor: "#0f172a", color: "white", padding: "20px 0", flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: "40px", padding: "10px" }}>
          <div style={{ background: "#3b82f6", padding: "8px", borderRadius: "8px" }}>
            <CarFront size={24} color="white" />
          </div>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", alignItems: "center" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={closeSidebar}
                title={item.name}
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center", 
                  gap: "4px", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  color: active ? "white" : "#94a3b8", 
                  backgroundColor: active ? "#1e293b" : "transparent",
                  textDecoration: "none",
                  transition: "0.2s",
                  minWidth: "60px"
                }}
              >
                <Icon size={22} />
                <span style={{ fontSize: "0.6rem", fontWeight: "600" }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={{ position: "absolute", bottom: "32px", width: "100%", padding: "0 10px" }}>
          <form action="/api/logout" method="POST">
            <button type="submit" title="Sair" style={{ width: "100%", display: "flex", justifyContent: "center", padding: "12px", background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}>
              <LogOut size={22} />
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
