// lib/users.ts
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserDoc = async (uid: string, name: string) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name,
      predictedIncomes: { stipendio: 0, extra: 0 },
      predictedExpenses: [],
      monthlySavings: {}
    });
  }
};
