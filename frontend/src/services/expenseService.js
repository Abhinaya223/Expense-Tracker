import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const EXPENSES_COL = 'expenses';

export async function addExpense(uid, { amount, category, note, date }) {
  const docRef = await addDoc(collection(db, EXPENSES_COL), {
    uid,
    amount: Number(amount),
    category,
    note: note || '',
    date,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function removeExpense(id) {
  await deleteDoc(doc(db, EXPENSES_COL, id));
}

export function subscribeExpenses(uid, callback) {
  const q = query(
    collection(db, EXPENSES_COL),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(expenses);
  });
}
