import { useEffect } from "react";
import { useRouter } from "next/router";
import { getUser } from "../lib/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/register"); // primo accesso → registrazione
    } else {
      router.push("/expenses"); // già loggato → vai alla pagina spese
    }
  }, [router]);

  return null; // oppure un piccolo loader
}
