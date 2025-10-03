import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { createUserDoc } from "@/lib/users";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

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
    setErr(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await createUserDoc(res.user.uid, res.user.displayName || email);
      router.push("/home");
    } catch (err: any) {
      setErr(err.message);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20, fontFamily: "Homemade Apple" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          Accedi
        </button>

        {err && (
          <p style={{ color: "red", textAlign: "center", marginTop: 5 }}>
            {err}
          </p>
        )}
      </form>

      {/* Bottone per andare alla registrazione */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => router.push("/register")}
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
          Non hai un account? Registrati
        </button>
      </div>
    </main>
  );
}
