"use client";

import { Link as LinkIcon, Share2, ExternalLink, Trash2 } from "lucide-react";
import { deleteVehicle } from "@/app/actions/vehicle";

export default function VehicleActions({ id, name, year, price }: { id: string, name: string, year: string | number, price: number }) {
  
  const handleCopy = () => {
    const url = `${window.location.origin}/catalogo/${id}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copiado para a área de transferência com sucesso!");
  }

  const handleWhatsApp = () => {
    const url = `${window.location.origin}/catalogo/${id}`;
    const text = `🚗 Olha essa novidade no estoque:\n\n*${name}* (${year})\nValor: R$ ${Number(price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n\nVeja todas as fotos clicando no link abaixo:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir o veículo "${name}" do estoque permanentemente?`)) {
       const res = await deleteVehicle(id);
       if (res.success) {
          alert("✅ Veículo removido com sucesso!");
       } else {
          alert("❌ Erro ao excluir veículo.");
       }
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-start", width: "100%" }}>
      <button type="button" onClick={handleDelete} title="Excluir Veículo" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
        <Trash2 size={14} />
      </button>
      <a href={`/catalogo/${id}`} target="_blank" title="Ver no Catálogo" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
        <ExternalLink size={14} />
      </a>
      <button type="button" onClick={handleCopy} title="Copiar Link" style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
        <LinkIcon size={14} />
      </button>
      <button type="button" onClick={handleWhatsApp} title="Enviar WhatsApp" style={{ background: "#f0fdf4", color: "#22c55e", border: "1px solid #bbf7d0", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex" }}>
        <Share2 size={14} />
      </button>
    </div>
  )
}
