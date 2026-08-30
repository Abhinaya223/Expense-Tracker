import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const GOALS_COL = 'goals';

export async function setMonthlyBudget(uid, monthlyBudget) {
  await setDoc(doc(db, GOALS_COL, uid), { monthlyBudget: Number(monthlyBudget) }, { merge: true });
}

export function subscribeBudget(uid, callback) {
  return onSnapshot(doc(db, GOALS_COL, uid), (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ monthlyBudget: 0 });
    }
  });
}
