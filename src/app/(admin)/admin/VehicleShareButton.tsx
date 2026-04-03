"use client";

import { useState } from "react";
import { Share2, ChevronDown, X } from "lucide-react";
import styles from "./dashboard.module.css";
import { logPublication } from "@/app/actions/publicationActions";

export default function VehicleShareButton({ vehicle }: { vehicle: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async (channel: "WHATSAPP" | "FACEBOOK") => {
    const publicUrl = `${window.location.origin}/veiculo/${vehicle.id}`;
    const desc = `🚘 *${vehicle.name}*\n💰 R$ ${vehicle.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n👉 Fale comigo agora!\n\n${publicUrl}`;

    if (channel === "WHATSAPP") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(desc)}`, "_blank");
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}&quote=${encodeURIComponent(desc)}`, "_blank");
    }
    
    setIsOpen(false);
    await logPublication(vehicle.id, channel, publicUrl);
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.btnSolid}>
        Compartilhar <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />
          <div style={{ position: "absolute", top: "110%", right: 0, background: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 50, minWidth: "160px", border: "1px solid #e2e8f0" }}>
            <button 
              onClick={() => handleShare("WHATSAPP")} 
              style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid #e2e8f0", color: "#16a34a", fontWeight: "600" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
            <button 
              onClick={() => handleShare("FACEBOOK")} 
              style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer", color: "#3b5998", fontWeight: "600" }}
            >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
              Facebook
            </button>
          </div>
        </>
      )}
    </div>
  );
}
