import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUser, clearUser } from "../lib/session";
import Header from "@/components/Header";
import Countdown from "@/components/Countdown";

type Expense = { id: string; title: string; amount: number; date: string };

export default function Expenses() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saved, setSaved] = useState(0);
  const monthlyTarget = 200;
  const targetDate = new Date(2026, 4, 7, 0, 0, 0); 

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/register");
    } else {
      setUser(u);
      loadExpenses(u.id);
    }
  }, [router]);

  function loadExpenses(userId: number) {
    const raw = localStorage.getItem(`expenses_${userId}`);
    if (!raw) {
      setExpenses([]);
      setSaved(0);
      return;
    }
    const arr = JSON.parse(raw) as Expense[];
    setExpenses(arr);
    const total = arr.reduce((acc, e) => acc + e.amount, 0);
    setSaved(total);
  }

  function saveExpenses(userId: number, arr: Expense[]) {
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(arr));
    setExpenses(arr);
    const total = arr.reduce((acc, e) => acc + e.amount, 0);
    setSaved(total);
  }

  function addExpense(title: string, amount: number) {
    if (!user) return;
    const e: Expense = { id: "e" + Date.now(), title, amount, date: new Date().toISOString() };
    saveExpenses(user.id, [...expenses, e]);
  }

  function handleLogout() {
    clearUser();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <>
    <Header />
    <div style={{justifyItems: 'center', marginTop: '3rem'}}>
      <Countdown targetDate={targetDate} />
    </div>
    
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>

    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontFamily: 'Homemade Apple', fontSize: '1.5rem', marginBottom: '3rem' }}>Road to New York</h2>

      <div style={{ position: 'relative', height: 15, background: '#eee', borderRadius: 15, margin: '20px 0' }}>
        {/* Riempimento fucsia */}
        <div style={{
          width: `${Math.min(saved / 1000 * 100, 100)}%`,
          height: '100%',
          background: '#E0218A',
          borderRadius: 15,
          transition: 'width 0.3s ease'
        }} />

        {/* Marker aereo */}
        <div style={{
          position: 'absolute',
          left: `${350 / 1000 * 100}%`,
          top: '-33px',
          transform: 'translateX(-50%)',
          fontSize: '1.5rem'
        }}>✈️</div>
        <div style={{
          position: 'absolute',
          left: `${350 / 1000 * 100}%`,
          top: '18px',
          transform: 'translateX(-50%)',
          fontFamily: 'Homemade Apple',
          fontSize: '1rem'
        }}>350</div>

        {/* Marker hotel */}
        <div style={{
          position: 'absolute',
          left: `${650 / 1000 * 100}%`,
          top: '-33px',
          transform: 'translateX(-50%)',
          fontSize: '1.5rem'
        }}>🏨</div>
        <div style={{
          position: 'absolute',
          left: `${650 / 1000 * 100}%`,
          top: '18px',
          transform: 'translateX(-50%)',
          fontFamily: 'Homemade Apple',
          fontSize: '1rem'
        }}>650</div>

        {/* Marker hamburger */}
        <div style={{
          position: 'absolute',
          left: `${800 / 1000 * 100}%`,
          top: '-33px',
          transform: 'translateX(-50%)',
          fontSize: '1.5rem'
        }}>🍔</div>
        <div style={{
          position: 'absolute',
          left: `${800 / 1000 * 100}%`,
          top: '18px',
          transform: 'translateX(-50%)',
          fontFamily: 'Homemade Apple',
          fontSize: '1rem'
        }}>800</div>
      </div>

      <p style={{marginTop: '3rem'}}>Hai raccolto {saved}€ su 1000€</p>
      <div style={{display: 'inline-flex', marginLeft: '55px', marginTop: '-33px'}}>
        <p style={{fontFamily: 'Homemade Apple', fontSize: '1.5rem', marginTop: '31px'}}>Risparmia!!</p>
        <img src="/chuck.png" alt="Logo" width={40} />
      </div>
    </section>


      <section style={{ marginTop: 16 }}>
        <h2>Controlla le squinzie</h2>


      </section>
    </main>
    </>
  );
}
