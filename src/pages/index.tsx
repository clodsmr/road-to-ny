import { useState } from "react";

export default function Home() {
  const [saved, setSaved] = useState(50);
  const monthlyTarget = 200;
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Volo", amount: 150 },
    { id: 2, title: "Hotel", amount: 300 },
  ]);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Road to NY ✈️
      </h1>

      <section style={{ marginBottom: 30 }}>
        <h2>Risparmio mensile</h2>
        <progress value={saved} max={monthlyTarget} style={{ width: "100%" }} />
        <p>
          Hai risparmiato {saved}€ su {monthlyTarget}€
        </p>
        <button onClick={() => setSaved(saved + 20)}>
          Aggiungi 20€
        </button>
      </section>

      <section>
        <h2>Spese</h2>
        <ul>
          {expenses.map((e) => (
            <li key={e.id}>
              {e.title} — €{e.amount}
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            setExpenses([
              ...expenses,
              { id: expenses.length + 1, title: "Cena", amount: 50 },
            ])
          }
        >
          Aggiungi spesa nuova
        </button>
      </section>
    </main>
  );
}
