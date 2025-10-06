import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faList, faUser } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface Income {
  stipendio: number;
  extra: number;
}

interface Expense {
  category: string;
  predicted: number;
}

interface MonthlyExpense {
  category: string;
  eff: number;
}

interface MonthlyData {
  income: Income;
  expenses: MonthlyExpense[];
  actualSaving: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [predictedIncome, setPredictedIncome] = useState<Income>({ stipendio: 0, extra: 0 });
  const [predictedExpenses, setPredictedExpenses] = useState<Expense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);

  // Modali
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpensePredModal, setShowExpensePredModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false); // nuova modale

  // Form income
  const [incomeType, setIncomeType] = useState<"stipendio" | "extra">("stipendio");
  const [incomeMode, setIncomeMode] = useState<"predicted" | "effettivo">("predicted");
  const [incomeValue, setIncomeValue] = useState(0);

  // Form nuova categoria prevista
  const [newExpenseCat, setNewExpenseCat] = useState("");
  const [newExpensePred, setNewExpensePred] = useState(0);

  // Form spesa effettiva
  const [expenseCat, setExpenseCat] = useState("");
  const [expenseValue, setExpenseValue] = useState(0);

  // Form risparmio effettivo
  const [savingValue, setSavingValue] = useState(0);
  const [savingAdd, setSavingAdd] = useState(true); // true = Metti, false = Togli

  const [savingTarget] = useState(143);
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = () => {
    setToast("Fatto ✅");
    setTimeout(() => setToast(null), 3000);
  };

  // --- Load ---
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/register");
        return;
      }
      setUser(u);
      const userRef = doc(db, "users", u.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPredictedIncome(data.predictedIncomes || { stipendio: 0, extra: 0 });
        setPredictedExpenses(data.predictedExpenses || []);
        const monthly =
          data.monthlySavings?.[currentMonth] || {
            income: { stipendio: 0, extra: 0 },
            expenses: [],
            actualSaving: 0,
          };
        setMonthlyData(monthly);
      }
    });
    return () => unsub();
  }, [router]);

  // --- Salva entrata ---
  const saveIncome = async () => {
    if (!user || !monthlyData) return;
    const userRef = doc(db, "users", user.uid);

    if (incomeMode === "predicted") {
      const updated = { ...predictedIncome, [incomeType]: incomeValue };
      setPredictedIncome(updated);
      await updateDoc(userRef, { predictedIncomes: updated });
    } else {
      const updated = { ...monthlyData.income, [incomeType]: incomeValue };
      const newData = { ...monthlyData, income: updated };
      setMonthlyData(newData);
      await updateDoc(userRef, { [`monthlySavings.${currentMonth}`]: newData });
    }
    setShowIncomeModal(false);
    showToast();
  };

  // --- Aggiungi categoria prevista ---
  const addExpenseCategory = async () => {
    if (!user || !newExpenseCat || newExpensePred <= 0) return;
    const updated = [...predictedExpenses, { category: newExpenseCat, predicted: newExpensePred }];
    setPredictedExpenses(updated);
    setNewExpenseCat("");
    setNewExpensePred(0);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { predictedExpenses: updated });

    setShowExpensePredModal(false);
    showToast();
  };

  // --- Aggiungi spesa effettiva ---
  const addExpenseEff = async () => {
    if (!user || !monthlyData || !expenseCat || expenseValue <= 0) return;
    const existing = monthlyData.expenses.find((e) => e.category === expenseCat);
    let updatedExpenses;
    if (existing) {
      updatedExpenses = monthlyData.expenses.map((e) =>
        e.category === expenseCat ? { ...e, eff: (e.eff || 0) + expenseValue } : e
      );
    } else {
      updatedExpenses = [...monthlyData.expenses, { category: expenseCat, eff: expenseValue }];
    }
    const newData = { ...monthlyData, expenses: updatedExpenses };
    setMonthlyData(newData);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { [`monthlySavings.${currentMonth}`]: newData });

    setShowExpenseModal(false);
    setExpenseCat("");
    setExpenseValue(0);
    showToast();
  };

  // --- Salva risparmio effettivo ---
    const saveSaving = async () => {
    if (!user || !monthlyData || isNaN(parseFloat(savingValue as any))) return;

    const amount = parseFloat(savingValue as any);
    const updatedAmount = savingAdd ? monthlyData.actualSaving + amount : monthlyData.actualSaving - amount;

    const updated = { ...monthlyData, actualSaving: updatedAmount };
    setMonthlyData(updated);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { [`monthlySavings.${currentMonth}`]: updated });

    setShowSavingModal(false);
    setSavingValue(0);
    setSavingAdd(true); // reset toggle
    showToast();
    };



  if (!user || !monthlyData) return null;

  const totalPredictedExpenses = predictedExpenses.reduce((acc, e) => acc + e.predicted, 0);
  const predictedSaving = predictedIncome.stipendio + predictedIncome.extra - totalPredictedExpenses;

  const totalIncomePredicted = predictedIncome.stipendio + predictedIncome.extra;
  const totalIncomeEff = monthlyData.income.stipendio + monthlyData.income.extra;
  const totalExpensePred = predictedExpenses.reduce((acc, e) => acc + e.predicted, 0);
  const totalExpenseEff = monthlyData.expenses.reduce((acc, e) => acc + (e.eff || 0), 0);


  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: 20, paddingBottom: "80px" }}>
        {/* --- Entrate --- */}
        <section style={{ marginBottom: "2rem" }}>
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Homemade Apple", fontSize: "1.5rem" }}>Entrate</h2>
            <button className="profile-btn" onClick={() => setShowIncomeModal(true)}>➕</button>
          </span>
          <div className="table-wrapper">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th></th>
                    <th>Previsto</th>
                    <th>Effettivo</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Stipendio</td>
                    <td>{predictedIncome.stipendio}</td>
                    <td>{monthlyData.income.stipendio}</td>
                </tr>
                <tr>
                    <td>Extra</td>
                    <td>{predictedIncome.extra}</td>
                    <td>{monthlyData.income.extra}</td>
                </tr>
                </tbody>
                <tfoot>
                <tr style={{ fontWeight: "bold", borderTop: "1px solid #ccc" }}>
                    <td>Totale</td>
                    <td>{totalIncomePredicted}</td>
                    <td>{totalIncomeEff}</td>
                </tr>
                </tfoot>

            </table>
          </div>
        </section>

        {/* --- Uscite --- */}
        <section style={{ marginBottom: "2rem" }}>
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Homemade Apple", fontSize: "1.5rem" }}>Uscite</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="profile-btn" onClick={() => setShowExpensePredModal(true)}>➕</button>
              <button className="profile-btn" onClick={() => setShowExpenseModal(true)}>💸</button>
            </div>
          </span>
          <div className="table-wrapper">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Prevista</th>
                    <th>Effettiva</th>
                </tr>
                </thead>
                <tbody>
                {predictedExpenses.map((e, i) => (
                    <tr key={i}>
                    <td>{e.category}</td>
                    <td>{e.predicted}</td>
                    <td>{monthlyData.expenses.find((ex) => ex.category === e.category)?.eff || 0}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr style={{ fontWeight: "bold", borderTop: "1px solid #ccc" }}>
                    <td>Totale</td>
                    <td>{totalExpensePred}</td>
                    <td>{totalExpenseEff}</td>
                </tr>
                </tfoot>

            </table>
          </div>
        </section>

        {/* --- Risparmio --- */}
<section>
  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h2 style={{ fontFamily: "Homemade Apple", fontSize: "1.5rem" }}>Risparmio mensile</h2>
    <button className="profile-btn" onClick={() => setShowSavingModal(true)}>💰</button>
  </span>

  <div style={{ position: "relative", height: 20, background: "#eee", borderRadius: 15, marginTop: 10 }}>
    {/* Barra rosa */}
    <div
      style={{
        width: `${Math.min((monthlyData.actualSaving / savingTarget) * 100, 100)}%`,
        height: "100%",
        background: "#E0218A",
        borderRadius: 15,
        transition: "width 0.3s ease",
        position: "relative",
      }}
    >
      {/* Valore effettivo sopra la barra */}
      <span
        style={{
          position: "absolute",
          top: -20,
          left: "100%",
          transform: "translateX(-100%)",
          fontFamily: "Homemade Apple",
          fontSize: "0.9rem",
          fontWeight: "bold",
        }}
      >
        {monthlyData.actualSaving}€
      </span>
    </div>

    {/* Indicatore target */}
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: 2,
        background: "#F18DBC",
        borderRadius: 1,
      }}
      title={`Target: ${savingTarget}€`}
    />
  </div>

  {/* Etichetta target sotto la barra */}
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5, fontFamily: "Homemade Apple", fontSize: "0.9rem" }}>
    <span>{savingTarget}€</span>
  </div>

  <p>Hai risparmiato {monthlyData.actualSaving}€ sui {predictedSaving}€ previsti questo mese</p>
  <p style={{ fontFamily: 'Homemade Apple' }}>Per New York bastano 143€ al mese!!</p>
</section>


      </main>

      {/* --- Modale Entrate --- */}
      {showIncomeModal && (
        <div className="modal">
          <div>
            <button className="close-btn" onClick={() => setShowIncomeModal(false)}>✖</button>
            <h3>Aggiungi Entrata</h3>
            <select value={incomeType} onChange={(e) => setIncomeType(e.target.value as any)}>
              <option value="stipendio">Stipendio</option>
              <option value="extra">Extra</option>
            </select>
            <select value={incomeMode} onChange={(e) => setIncomeMode(e.target.value as any)}>
              <option value="predicted">Prevista</option>
              <option value="effettivo">Effettiva</option>
            </select>
            <input type="number" value={incomeValue} onChange={(e) => setIncomeValue(parseFloat(e.target.value))} />
            <button className="save-btn" onClick={saveIncome}>Salva</button>
          </div>
        </div>
      )}

      {/* --- Modale Uscita Prevista --- */}
      {showExpensePredModal && (
        <div className="modal">
          <div>
            <button className="close-btn" onClick={() => setShowExpensePredModal(false)}>✖</button>
            <h3>Nuova Categoria Uscita</h3>
            <input placeholder="Categoria" value={newExpenseCat} onChange={(e) => setNewExpenseCat(e.target.value)} />
            <input type="number" placeholder="Previsto" value={newExpensePred} onChange={(e) => setNewExpensePred(parseFloat(e.target.value))} />
            <button className="save-btn" onClick={addExpenseCategory}>Salva</button>
          </div>
        </div>
      )}

      {/* --- Modale Uscita Effettiva --- */}
      {showExpenseModal && (
        <div className="modal">
          <div>
            <button className="close-btn" onClick={() => setShowExpenseModal(false)}>✖</button>
            <h3>Aggiungi Spesa Effettiva</h3>
            <select value={expenseCat} onChange={(e) => setExpenseCat(e.target.value)}>
              <option value="">-- Scegli categoria --</option>
              {predictedExpenses.map((e, i) => (
                <option key={i} value={e.category}>{e.category}</option>
              ))}
            </select>
            <input type="number" value={expenseValue} onChange={(e) => setExpenseValue(parseFloat(e.target.value))} />
            <button className="save-btn" onClick={addExpenseEff}>Salva</button>
          </div>
        </div>
      )}

      {/* --- Modale Risparmio Effettivo --- */}
{showSavingModal && (
  <div className="modal">
    <div>
      <button className="close-btn" onClick={() => setShowSavingModal(false)}>✖</button>
      <h3>Aggiungi risparmio</h3>
      <input type="number" value={savingValue} onChange={(e) => setSavingValue(parseFloat(e.target.value))} placeholder="Importo" />
      <span
      style={{
          display: 'flex',
          justifyContent:'space-between',
          alignItems: 'center'
        }}
      >
              {/* Switch Metti / Togli */}
      <div
        onClick={() => setSavingAdd(!savingAdd)}
        style={{
          width: 70,
          height: 30,
          borderRadius: 15,
          background: savingAdd ? "#E0218A" : "#F18DBC",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.3s"
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "white",
            position: "absolute",
            top: 2,
            left: savingAdd ? 2 : 40,
            transition: "left 0.3s",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: savingAdd ? 35 : 8,
            transform: "translateY(-50%)",
            fontSize: 12,
            color: "white",
            fontWeight: "bold",
            pointerEvents: "none",
          }}
        >
          {savingAdd ? "Metti" : "Togli"}
        </span>
      </div>
            <button className="save-btn" onClick={saveSaving}>Salva</button>
      </span>
    </div>
  </div>
)}



      {/* --- Toast --- */}
      {toast && <div className="toast">{toast}</div>}

      {/* Bottom nav */}
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
