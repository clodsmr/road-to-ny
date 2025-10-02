import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { saveUser, getUser } from "../lib/session";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (getUser()) router.push("/"); // Se già loggato → home
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!name || !password || password !== confirm) {
      setMsg("Compila tutti i campi e assicurati che le password coincidano.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (data.ok) {
      saveUser(data.user); // Salva sessione
      router.push("/");
    } else {
      setMsg(data.message);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <h1>Registrazione</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input placeholder="Conferma Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit">Registrati</button>
        {msg && <p style={{ color: msg.includes("errore") ? "red" : "green" }}>{msg}</p>}
      </form>
    </main>
  );
}
