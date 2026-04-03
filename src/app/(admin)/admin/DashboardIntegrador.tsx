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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
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
