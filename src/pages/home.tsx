// pages/home.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Countdown from "@/components/Countdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { requestPermissionAndToken, listenForegroundMessages } from "@/lib/fcm";
import { updateDoc } from "firebase/firestore";


type Expense = { id: string; title: string; amount: number; date: string };

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saved, setSaved] = useState(0);
  const [showSquinzie, setShowSquinzie] = useState(false);
  const [otherSavings, setOtherSavings] = useState<{ name: string; total: number }[]>([]);
  const targetDate = new Date(2026, 4, 7, 0, 0, 0);
  
  useEffect(() => {
  if (!user) return;

  (async () => {
    const token = await requestPermissionAndToken();
    if (token) {
      await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
    }
    listenForegroundMessages();
  })();
}, [user]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/register");
      } else {
        setUser(u);
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const monthlySavings = data.monthlySavings || {};
          let total = 0;
          Object.values(monthlySavings).forEach((m: any) => {
            total += m.actualSaving || 0;
          });
          setSaved(total);

          const allExpenses: Expense[] = [];
          Object.values(monthlySavings).forEach((m: any) => {
            (m.expenses || []).forEach((e: any) =>
              allExpenses.push({ id: e.id, title: e.category, amount: e.eff, date: e.date })
            );
          });
          setExpenses(allExpenses);

          // --- Carica risparmi degli altri utenti ---
          const userUIDs = {
            Claudia: "nMQa2oFHJmcTMByW2rTcQitbSd02",
            Marietta: "OUao5wz7B2WZEGfWCOD7djYAABA3",
            Silvietta: "EeMS1W0ACIcTKjWO4I7IBfxTn5w1",
          };

          const fetchedOtherSavings: { name: string; total: number }[] = [];

          for (const [name, uid] of Object.entries(userUIDs)) {
            // salta l'utente attualmente loggato
            if (uid === u.uid) continue;

            const otherDoc = await getDoc(doc(db, "users", uid));
            let otherTotal = 0;

            if (otherDoc.exists()) {
              const otherData = otherDoc.data();
              const monthly = otherData.monthlySavings || {};
              Object.values(monthly).forEach((m: any) => {
                otherTotal += m.actualSaving || 0;
              });
            }

            fetchedOtherSavings.push({ name, total: otherTotal });
          }
          setOtherSavings(fetchedOtherSavings);
        }
      }
    });

    return () => unsub();
  }, [router]);

  if (!user) return null;

  return (
    <>
      <Header />
      <div style={{ justifyItems: 'center', marginTop: '3rem' }}>
        <Countdown targetDate={targetDate} />
      </div>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: 20, paddingBottom: "80px" }}>
        <section style={{ marginTop: 16 }}>
          <h2 style={{ fontFamily: 'Homemade Apple', fontSize: '1.5rem', marginBottom: '3rem' }}>Road to New York</h2>

          <div style={{ position: 'relative', height: 15, background: 'white', borderRadius: 15, margin: '20px 0' }}>
            <div style={{
              width: `${Math.min(saved / 1000 * 100, 100)}%`,
              height: '100%',
              background: '#E0218A',
              borderRadius: 15,
              transition: 'width 0.3s ease'
            }} />

            <div style={{ position: 'absolute', left: `${350 / 1000 * 100}%`, top: '-33px', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>✈️</div>
            <div style={{ position: 'absolute', left: `${350 / 1000 * 100}%`, top: '18px', transform: 'translateX(-50%)', fontFamily: 'Homemade Apple', fontSize: '1rem' }}>350</div>

            <div style={{ position: 'absolute', left: `${650 / 1000 * 100}%`, top: '-33px', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>🏨</div>
            <div style={{ position: 'absolute', left: `${650 / 1000 * 100}%`, top: '18px', transform: 'translateX(-50%)', fontFamily: 'Homemade Apple', fontSize: '1rem' }}>650</div>

            <div style={{ position: 'absolute', left: `${800 / 1000 * 100}%`, top: '-33px', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>🍔</div>
            <div style={{ position: 'absolute', left: `${800 / 1000 * 100}%`, top: '18px', transform: 'translateX(-50%)', fontFamily: 'Homemade Apple', fontSize: '1rem' }}>800</div>
          </div>

          <p style={{ marginTop: '3rem' }}>Hai raccolto {saved}€ su 1000€</p>
          <div style={{ display: 'inline-flex', marginLeft: '55px', marginTop: '-33px' }}>
            <p style={{ fontFamily: 'Homemade Apple', fontSize: '1.5rem', marginTop: '40px' }}>Risparmia!!</p>
            <img src="/chuck.png" alt="Logo" style={{ width: '50%' }} />
          </div>
        </section>

        {/* Dropdown Squinzie */}
      <div style={{ marginTop: 30, borderRadius: 10, backgroundColor: '#ED5C9B' }}>
        <button
          onClick={() => setShowSquinzie(!showSquinzie)}
          style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 8,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          Controlla le Squinzie <FontAwesomeIcon icon={faChevronDown} />
        </button>

        {showSquinzie && (
          <div style={{ paddingTop: 50, height: '20vh', padding: '50px 30px', paddingBottom: '0px' }}>
            {otherSavings.map((o, i) => (
          <section key={i} style={{ marginBottom: 65 }}>
            <div style={{ position: 'relative', height: 15, background: 'white', borderRadius: 15 }}>
              <div style={{
                width: `${Math.min(o.total / 1000 * 100, 100)}%`,
                height: '100%',
                background: '#E0218A',
                borderRadius: 15,
                transition: 'width 0.3s ease'
              }} />

              <div style={{
                position: 'absolute',
                left: `${Math.min(o.total / 1000 * 100, 100)}%`,
                top: '-19px',
                transform: 'translateX(-50%)'
              }}>
                <img src={`/${o.name.toLowerCase()}.png`} alt={o.name} style={{ width: 50, height: 50, borderRadius: '50%' }} />
                <div style={{ textAlign: 'center', fontFamily: 'Homemade Apple', fontSize: '0.9rem', marginTop: 1, color: 'white' }}>{o.total}€</div>
              </div>
               <button
                  style={{
                    marginTop: 4,
                    padding: "4px 8px",
                    fontSize: "1rem",
                    borderRadius: 30,
                    cursor: "pointer",
                    background: "#E0218A",
                    color: "white",
                    border: "none",
                    position: 'absolute',
                    right: '-19px',
                    top: '35px'
                  }}
                  onClick={async () => {
                    try {
                      const uidMap: Record<string, string> = {
                        Claudia: "nMQa2oFHJmcTMByW2rTcQitbSd02",
                        Marietta: "OUao5wz7B2WZEGfWCOD7djYAABA3",
                        Silvietta: "EeMS1W0ACIcTKjWO4I7IBfxTn5w1",
                      };
                      const targetUid = uidMap[o.name];
                      if (!targetUid) return alert("UID non trovato");
                      await fetch("/api/sendNotification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetUid }),
                      });
                      alert("📩 Notifica inviata a " + o.name);
                    } catch (err) {
                      console.error(err);
                      alert("Errore durante l’invio");
                    }
                  }}
                >
                  📩
                </button>
            </div>
               

          </section>
          
))}

          </div>
        )}
      </div>

      </main>

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
        <div style={{ width: '50%', justifyContent: 'center', display: 'flex' }}>
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
        <div style={{ width: '50%', justifyContent: 'center', display: 'flex' }}>
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
