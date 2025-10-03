// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/home"); // già loggato → vai alla home
      } else {
        router.push("/register"); // primo accesso → registrazione
      }
    });

    return () => unsub();
  }, [router]);

  return null; // eventualmente puoi mettere un loader
}
