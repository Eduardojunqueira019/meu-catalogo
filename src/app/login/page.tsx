import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

async function loginUser(formData: FormData) {
  "use server";
  const pass = formData.get("password");
  
  // Hardcoded as requested or via env:
  if (pass === process.env.ADMIN_PASS || pass === "eduardo123") {
    (await cookies()).set("adminAuth", "authenticated", { path: "/", httpOnly: true });
    redirect("/admin");
  } else {
    redirect("/login?error=true");
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const isError = params?.error === "true";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
      <form action={loginUser} style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "var(--box-shadow)", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <div style={{ background: "var(--primary-light)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Lock size={30} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-dark)" }}>Login Administrativo</h1>
          <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Painel de controle Eduardo Junqueira</p>
        </div>

        {isError && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center" }}>
            Senha incorreta. Tente novamente.
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "bold", marginBottom: "8px" }}>Senha de acesso</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Digite sua senha..." 
            required 
            style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "1rem" }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
          Entrar no Panel
        </button>
      </form>
    </div>
  );
}
