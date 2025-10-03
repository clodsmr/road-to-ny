import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { createUserDoc } from "@/lib/users"; // il helper che abbiamo creato

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // crea doc se non esiste
        await createUserDoc(user.uid, user.displayName || email);
        router.push("/home");
      }
    });
    return () => unsub();
  }, [router, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!name || !email || !password || password !== confirm) {
      setMsg("Compila tutti i campi e assicurati che le password coincidano.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await createUserDoc(userCredential.user.uid, name);
      router.push("/home");
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <h1>Registrazione</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input placeholder="Conferma Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit">Registrati</button>
        {msg && <p style={{ color: msg.includes("errore") ? "red" : "green" }}>{msg}</p>}
      </form>
    </main>
  );
}
