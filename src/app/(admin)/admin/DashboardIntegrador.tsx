"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { logPublication } from "@/app/actions/publicationActions";
import { Check } from "lucide-react";

type Vehicle = {
  id: string;
  name: string;
  price: number;
  year: number;
  options: string;
};

export default function DashboardIntegrador({ vehicles }: { vehicles: Vehicle[] }) {
  const [selected, setSelected] = useState<string[]>(vehicles.slice(0, 2).map((v) => v.id)); // Default first 2 selected
  const [wppState, setWppState] = useState<Record<string, boolean>>(
    vehicles.reduce((acc, v) => ({ ...acc, [v.id]: true }), {})
  );
  const [fbState, setFbState] = useState<Record<string, boolean>>(
    vehicles.reduce((acc, v) => ({ ...acc, [v.id]: true }), {})
  );
  const [publishing, setPublishing] = useState(false);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else setSelected([...selected, id]);
  };

  const toggleWpp = (id: string) => setWppState({ ...wppState, [id]: !wppState[id] });
  const toggleFb = (id: string) => setFbState({ ...fbState, [id]: !fbState[id] });

  const generateDescription = (v: Vehicle) => {
    return `🚘 *${v.name}*\n💰 R$ ${v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n👉 Fale comigo agora!`;
  };

  const handlePublish = async () => {
    if (selected.length === 0) return alert("Selecione veículos.");
    setPublishing(true);
    let delays = 0;

    for (const id of selected) {
      const v = vehicles.find((x) => x.id === id);
      if (!v) continue;

      const publicUrl = `${window.location.origin}/veiculo/${v.id}`;
      const desc = generateDescription(v) + `\n\n${publicUrl}`;

      if (wppState[id]) {
        setTimeout(async () => {
          const wppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(desc)}`;
          window.open(wppUrl, "_blank");
          await logPublication(v.id, "WHATSAPP", publicUrl);
        }, delays);
        delays += 500;
      }

      if (fbState[id]) {
        setTimeout(async () => {
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}&quote=${encodeURIComponent(desc)}`;
          window.open(fbUrl, "_blank");
          await logPublication(v.id, "FACEBOOK", publicUrl);
        }, delays);
        delays += 500;
      }
    }

    setTimeout(() => {
      setPublishing(false);
      alert("Publicações disparadas com sucesso!");
    }, delays + 500);
  };

  const firstSelected = vehicles.find(v => selected.includes(v.id)) || vehicles[0];

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Integrador de Anúncios</h3>
      
      <div className={styles.widgetList}>
        {vehicles.slice(0, 4).map((v) => (
          <div key={v.id} className={styles.widgetItem}>
            <div className={styles.widgetItemLeft}>
              <input 
                type="checkbox" 
                checked={selected.includes(v.id)} 
                onChange={() => toggleSelect(v.id)} 
                className={styles.widgetItemCheckbox}
              />
              <div className={styles.widgetItemDetails}>
                <span className={styles.wName}>{v.name}</span>
                <span className={styles.wPrice}>R$ {v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className={styles.widgetItemRight}>
              <button 
                 onClick={() => toggleWpp(v.id)}
                 className={`${styles.socialIcon} ${wppState[v.id] ? styles.socialWpp : styles.socialOff}`}
                 title="WhatsApp"
                 style={{ border: "none", cursor: "pointer" }}
              >
                {wppState[v.id] && <Check size={14} />}
              </button>
              <button 
                 onClick={() => toggleFb(v.id)}
                 className={`${styles.socialIcon} ${fbState[v.id] ? styles.socialFb : styles.socialOff}`}
                 title="Facebook"
                 style={{ border: "none", cursor: "pointer" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && <div className={styles.widgetItem}>Nenhum veículo</div>}
      </div>

      <button disabled={publishing || selected.length === 0} onClick={handlePublish} className={styles.btnPublishAll}>
        {publishing ? "PUBLICANDO..." : "PUBLICAR SELECIONADOS"}
      </button>

      {firstSelected && (
        <div className={styles.previewBox}>
          <div className={styles.previewTitle}>Preview</div>
          <div className={styles.previewText}>
            <span>🔥 {firstSelected.name}</span>
            <span>💰 R$ {firstSelected.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            <span>👉 Fale comigo agora:</span>
            <span className={styles.previewLink}>
               https://seucatalogo.com/veiculo/{firstSelected.id.substring(0,6)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
