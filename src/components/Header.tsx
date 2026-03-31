import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Header({ title, backTo, color = "var(--primary)" }: { title: string, backTo: string, color?: string }) {
  const isWhite = color === "white";
  
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "16px 20px",
      backgroundColor: isWhite ? "white" : "transparent",
      color: isWhite ? "var(--text-dark)" : color,
      position: "relative"
    }}>
      <Link href={backTo} style={{ position: "absolute", left: "20px", display: "flex" }}>
        <ChevronLeft size={24} color={isWhite ? "var(--primary)" : color} />
      </Link>
      <h2 style={{ flex: 1, textAlign: "center", fontSize: "1.1rem", fontWeight: "700", color: isWhite ? "var(--primary)" : color }}>
        {title}
      </h2>
    </div>
  );
}
