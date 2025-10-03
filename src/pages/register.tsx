import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { createUserDoc } from "@/lib/users";

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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20, fontFamily: "Homemade Apple" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Registrazione</h1>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <input
          placeholder="Conferma Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}
        />

        <button
          type="submit"
          style={{
            marginTop: 10,
            backgroundColor: "#ED5C9B",
            color: "white",
            border: "none",
            padding: "12px 0",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Registrati
        </button>

        {msg && (
          <p style={{ color: msg.includes("errore") ? "red" : "green", textAlign: "center", marginTop: 5 }}>
            {msg}
          </p>
        )}
      </form>

      {/* Bottone per andare al login */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            backgroundColor: "white",
            color: "#ED5C9B",
            border: "2px solid #ED5C9B",
            padding: "10px 20px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            fontFamily: "Homemade Apple",
          }}
        >
          Hai già un account? Accedi
        </button>
      </div>
    </main>
  );
}
