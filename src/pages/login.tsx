import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { createUserDoc } from "@/lib/users"; // il helper per creare doc se non esiste

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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign In</button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </main>
  );
}
