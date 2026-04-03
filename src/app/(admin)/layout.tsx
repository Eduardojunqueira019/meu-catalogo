"use client";
import { useState } from "react";
import Link from "next/link";
import { CarFront, LayoutDashboard, Users, User, Menu, X, Share2, Megaphone, CheckSquare, Settings, Bell, ChevronDown } from "lucide-react";
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
    { name: "Dashboard", href: "/admin", icon: CheckSquare },
    { name: "Veículos", href: "/admin/veiculos", icon: CarFront },
    { name: "Integrador de Anúncios", href: "/admin/integrador", icon: Megaphone },
    { name: "Simulações", href: "#", icon: LayoutDashboard },
    { name: "Clientes", href: "/admin/leads", icon: User },
    { name: "Configurações", href: "/admin/perfil", icon: Settings },
  ];

  return (
    <div className="admin-layout">
      <LeadNotifier />
      
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="logo-area">
          <CarFront size={22} color="white" />
          <span>SeuCatálogo</span>
        </div>
        <button onClick={toggleSidebar} className="menu-btn">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar} />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="white"/>
            <path d="M12 8L8 12L12 16L16 12L12 8Z" fill="#3b82f6"/>
          </svg>
          <span>SeuCatálogo</span>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href) && item.href !== "#";
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={closeSidebar}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <div className="nav-icon"><Icon size={20} /></div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
           <div className="search-bar">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "#94a3b8"}}>
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
             </svg>
             <input type="text" placeholder="Buscar..." />
           </div>
           
           <div className="header-actions">
             <button className="icon-btn">
               <Bell size={20} strokeWidth={2.5} />
             </button>
             <div className="user-profile">
               <div className="avatar">
                 <img src="/placeholder-user.jpg" alt="User" />
               </div>
               <span className="user-name">André</span>
               <ChevronDown size={16} />
             </div>
           </div>
        </header>

        <div className="page-content">
           {children}
        </div>
      </main>

      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #f4f7fb; font-family: 'Inter', sans-serif; }
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }
        
        /* Mobile Header */
        .mobile-header {
          display: none;
          justify-content: space-between;
          align-items: center;
          background-color: #2b3a4a;
          color: white;
          padding: 15px 20px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
        }
        .logo-area { display: flex; gap: 8px; align-items: center; font-weight: bold; font-size: 1.2rem; }
        .menu-btn { background: transparent; border: none; color: white; }
        
        /* Sidebar */
        .sidebar {
          width: 250px;
          background-color: #2b3a4a;
          color: white;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        
        .sidebar-logo {
          padding: 25px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 700;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .sidebar-nav {
          padding: 20px 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          border-radius: 8px;
          color: #a0b2c6;
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .nav-item.active { background-color: #3165b5; color: white; font-weight: 600; }
        
        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .top-header {
          background: white;
          height: 70px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          flex-shrink: 0;
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          width: 300px;
        }
        .search-bar input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
        
        .header-actions { display: flex; align-items: center; gap: 24px; }
        .icon-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0; }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name { font-weight: 600; color: #1e293b; font-size: 14px; }
        
        .page-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
        }
        
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        
        @media (max-width: 768px) {
          .mobile-header { display: flex; }
          .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .main-content { margin-top: 60px; }
          .top-header { display: none; }
          .page-content { padding: 15px; }
        }
      `}</style>
    </div>
  );
}
