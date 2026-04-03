"use client";

import { useState } from "react";
import { logPublication } from "@/app/actions/publicationActions";
import styles from "./integrador.module.css";

type Vehicle = {
  id: string;
  name: string;
  price: number;
  year: number;
  images: string;
  options: string;
};

export default function IntegradorClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [wpp, setWpp] = useState(true);
  const [fb, setFb] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const parseImages = (json: string) => {
    try {
      const arr = JSON.parse(json);
      return arr.length > 0 ? arr[0] : "/placeholder-car.jpg";
    } catch {
      return "/placeholder-car.jpg";
    }
  };

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((v) => v !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectAll = () => {
    if (selected.length === vehicles.length) {
      setSelected([]);
    } else {
      setSelected(vehicles.map((v) => v.id));
    }
  };

  const generateDescription = (v: Vehicle) => {
    const opts = v.options.split(",").slice(0, 3).map((o) => o.trim()).filter(Boolean).join(", ");
    return `🚘 *${v.name}*\n📅 Ano: ${v.year}\n💰 R$ ${v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n✨ Destaques: ${opts}\n\n👉 Compre agora!`;
  };

  const handlePublish = async () => {
    if (selected.length === 0) return alert("Selecione ao menos um veículo.");
    if (!wpp && !fb) return alert("Selecione ao menos um canal de publicação.");

    setPublishing(true);
    let delays = 0;

    for (const id of selected) {
      const v = vehicles.find((x) => x.id === id);
      if (!v) continue;

      const publicUrl = `${window.location.origin}/veiculo/${v.id}`;
      const desc = generateDescription(v) + `\n\n📌 Mais fotos e detalhes aqui:\n${publicUrl}`;

      if (wpp) {
        setTimeout(async () => {
          const wppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(desc)}`;
          window.open(wppUrl, "_blank");
          await logPublication(v.id, "WHATSAPP", publicUrl);
        }, delays);
        delays += 500;
      }

      if (fb) {
        setTimeout(async () => {
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}&quote=${encodeURIComponent(desc)}`;
          window.open(fbUrl, "_blank");
          await logPublication(v.id, "FACEBOOK", publicUrl);
        }, delays);
        delays += 500; // Small delay to avoid pop-up blocking issues at once
      }
    }

    setTimeout(() => {
      setPublishing(false);
      alert("Publicações disparadas! Verifique se as abas foram abertas com sucesso no seu navegador.");
      setSelected([]);
    }, delays + 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controlsBar}>
        <div className={styles.channelOptions}>
          <h3>Canais de Publicação</h3>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={wpp} onChange={(e) => setWpp(e.target.checked)} />
            <span>WhatsApp (Texto Automático + Link)</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={fb} onChange={(e) => setFb(e.target.checked)} />
            <span>Facebook (Compartilhar Link)</span>
          </label>
        </div>
        
        <button 
          onClick={handlePublish} 
          disabled={publishing || selected.length === 0} 
          className={styles.publishButton}
        >
          {publishing ? "Enviando..." : `Publicar Selecionados (${selected.length})`}
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input 
                  type="checkbox" 
                  checked={selected.length === vehicles.length && vehicles.length > 0} 
                  onChange={selectAll} 
                  title="Selecionar Todos" 
                />
              </th>
              <th>Foto</th>
              <th>Veículo</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr 
                key={v.id} 
                className={selected.includes(v.id) ? styles.selectedRow : ""}
                onClick={() => handleSelect(v.id)}
              >
                <td>
                  <input 
                    type="checkbox" 
                    checked={selected.includes(v.id)} 
                    onChange={() => handleSelect(v.id)} 
                  />
                </td>
                <td>
                  <div className={styles.imageCell}>
                    <img src={parseImages(v.images)} alt={v.name} />
                  </div>
                </td>
                <td>
                  <div className={styles.carName}>{v.name}</div>
                  <div className={styles.carYear}>{v.year}</div>
                </td>
                <td className={styles.carPrice}>
                  R$ {v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum veículo disponível no estoque.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
