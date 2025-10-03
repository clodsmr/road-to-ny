import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleName = (name: string | null) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header
      style={{
        background: "#F18DBC",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <img src="/logo-ny.png" alt="Logo" width={40} />
        <h1
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            fontFamily: "Homemade Apple",
            color: "black",
            paddingTop: "5px",
          }}
        >
          {handleName(user.displayName)}
        </h1>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "50%",
          padding: "6px",
          cursor: "pointer",
        }}
        title="Logout"
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
      </button>
    </header>
  );
}
