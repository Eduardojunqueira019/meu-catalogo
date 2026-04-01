"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { User, Bell, X, MessageSquare, MapPin, CarFront } from "lucide-react";

interface LeadNotification {
  id: string;
  name: string;
  whatsapp: string;
  city: string;
  vehicle: string;
  price: number;
}

export default function LeadNotifier() {
  const [notification, setNotification] = useState<LeadNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only initialize if keys are present
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "sa1",
    });

    const channel = pusher.subscribe("admin-notifications");
    
    channel.bind("new-lead", (data: LeadNotification) => {
      console.log("New lead received via Pusher:", data);
      
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
      }

      setNotification(data);
      setVisible(true);

      // Auto hide after 15 seconds
      setTimeout(() => {
        // Only hide if it's the same notification
        setNotification(prev => prev?.id === data.id ? null : prev);
      }, 15000);
    });

    return () => {
      pusher.unsubscribe("admin-notifications");
    };
  }, []);

  if (!visible || !notification) return (
    <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
  );

  return (
    <>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      <div 
        className="notification-toast"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "350px",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: "2px solid #3b82f6",
          zIndex: 9999,
          padding: "20px",
          animation: "slideIn 0.5s ease-out",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6" }}>
            <Bell size={18} fill="#3b82f6" fillOpacity={0.2} />
            <span style={{ fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Novo Lead Recebido!</span>
          </div>
          <button 
            onClick={() => setVisible(false)} 
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f8fafc", padding: "12px", borderRadius: "10px" }}>
          <div style={{ background: "#3b82f6", padding: "10px", borderRadius: "50%", color: "white" }}>
            <User size={20} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notification.name}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <MessageSquare size={14} /> {notification.whatsapp}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{ background: "#eff6ff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", display: "block" }}>Veículo</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
              <CarFront size={12} /> {notification.vehicle}
            </span>
          </div>
          <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#22c55e", textTransform: "uppercase", display: "block" }}>Cidade</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} /> {notification.city || "Não informada"}
            </span>
          </div>
        </div>

        <button 
          onClick={() => window.location.href = "/admin/leads"}
          style={{ 
            marginTop: "8px",
            background: "#3b82f6", 
            color: "white", 
            border: "none", 
            padding: "12px", 
            borderRadius: "10px", 
            fontWeight: "700", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#2563eb"}
          onMouseOut={(e) => e.currentTarget.style.background = "#3b82f6"}
        >
          Ver Todos os Leads
        </button>

        <style jsx>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
