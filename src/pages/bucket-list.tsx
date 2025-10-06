// pages/bucket-list.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

interface BucketItem {
  id?: string;
  luogo: string;
  indirizzo: string;
  priorita: "bassa" | "media" | "alta";
  costo: number;
  creator: string; // UID
}

// Mappa UID -> nome e immagine, come in home.tsx
const uidMap: Record<string, { name: string; img: string }> = {
  "nMQa2oFHJmcTMByW2rTcQitbSd02": { name: "Claudia", img: "/claudia.png" },
  "OUao5wz7B2WZEGfWCOD7djYAABA3": { name: "Marietta", img: "/marietta.png" },
  "EeMS1W0ACIcTKjWO4I7IBfxTn5w1": { name: "Silvietta", img: "/silvietta.png" },
};

const priorityColor: Record<string, string> = {
  alta: "red",
  media: "orange",
  bassa: "green",
};

export default function BucketList() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [luogo, setLuogo] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [priorita, setPriorita] = useState<"bassa" | "media" | "alta">("bassa");
  const [costo, setCosto] = useState<number>(0);

  // --- Load user & bucket list ---
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/register");
        return;
      }
      setUser(u);

      try {
        const q = query(collection(db, "bucketList"), orderBy("priorita", "desc"));
        const snapshot = await getDocs(q);
        const loaded: BucketItem[] = [];
        snapshot.forEach((doc) => loaded.push({ id: doc.id, ...(doc.data() as any) }));

        // Ordinamento secondario per costo
        loaded.sort((a, b) => (a.priorita === b.priorita ? a.costo - b.costo : 0));

        setItems(loaded);
      } catch (err) {
        console.error("Errore caricamento bucket list:", err);
      }
    });
    return () => unsub();
  }, [router]);

  // --- Salva nuovo item ---
  const saveItem = async () => {
    if (!user || !luogo || !indirizzo || !priorita) return;

    try {
      const newItem: BucketItem = {
        luogo,
        indirizzo,
        priorita,
        costo,
        creator: user.uid,
      };
      const docRef = await addDoc(collection(db, "bucketList"), newItem);

      setItems((prev) => [...prev, { ...newItem, id: docRef.id }]);
      setShowModal(false);
      setLuogo("");
      setIndirizzo("");
      setPriorita("bassa");
      setCosto(0);
    } catch (err) {
      console.error("Errore salvataggio bucket list: ", err);
      alert("Errore durante il salvataggio: " + err);
    }
  };

  // --- Ordina items per priorità ---
  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder = { alta: 3, media: 2, bassa: 1 };
    return priorityOrder[b.priorita] - priorityOrder[a.priorita];
  });

  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: 20, paddingBottom: "80px" }}>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <h2 style={{ fontFamily: "Homemade Apple", fontSize: "1.5rem", marginRight: 10 }}>
            Lista dei desideri
          </h2>
          <button className="profile-btn" onClick={() => setShowModal(true)} style={{ marginBottom: 0 }}>
            ➕
          </button>
        </span>

        {/* Lista items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedItems.map((item) => {
            const userInfo = uidMap[item.creator] || { name: "Unknown", img: "/placeholder.png" };

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                {/* Priorità */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: priorityColor[item.priorita],
                    marginRight: 10,
                  }}
                />

                {/* Luogo cliccabile */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.indirizzo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, fontFamily: "Homemade Apple", fontSize: "1rem", textDecoration: "none", color: "black" }}
                >
                  {item.luogo}
                </a>

                {/* Foto creatore */}
                <img
                  src={userInfo.img}
                  alt={userInfo.name}
                  style={{ width: 32, height: 32, borderRadius: "50%", marginLeft: 10 }}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div>
            <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
            <h3>Aggiungi destinazione</h3>
            <input placeholder="Luogo" value={luogo} onChange={(e) => setLuogo(e.target.value)} />
            <input placeholder="Indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} />
            <select value={priorita} onChange={(e) => setPriorita(e.target.value as any)}>
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <input
              type="number"
              placeholder="Costo"
              value={costo}
              onChange={(e) => setCosto(parseFloat(e.target.value))}
            />
            <button className="save-btn" onClick={saveItem}>Salva</button>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "60px",
        background: "#F18DBC",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 -2px 5px rgba(0,0,0,0.2)"
      }}>
        <div style={{ width: '33.33%', justifyContent: 'center', display: 'flex' }}>
          <button onClick={() => router.push("/home")} style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "1.5rem",
            borderBottom: router.pathname === '/home' ? '2px solid white' : 'none'
          }}>
            <FontAwesomeIcon icon={faHome} />
          </button>
        </div>
        <div style={{ width: '33.33%', justifyContent: 'center', display: 'flex' }}>
          <button onClick={() => router.push("/bucket-list")} style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "1.5rem",
            borderBottom: router.pathname === '/bucket-list' ? '2px solid white' : 'none'
          }}>
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
        <div style={{ width: '33.33%', justifyContent: 'center', display: 'flex' }}>
          <button onClick={() => router.push("/profile")} style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "1.5rem",
            borderBottom: router.pathname === '/profile' ? '2px solid white' : 'none'
          }}>
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
      </nav>
    </>
  );
}
