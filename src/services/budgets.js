import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const COLLECTION = 'budgets'

function mapDoc(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

export function subscribeBudgets(userId, onData, onError) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map(mapDoc))
    },
    onError,
  )
}

export function createBudget(userId, values) {
  return addDoc(collection(db, COLLECTION), {
    userId,
    category: values.category,
    monthlyLimit: Number(values.monthlyLimit),
    month: values.month,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateBudget(id, values) {
  return updateDoc(doc(db, COLLECTION, id), {
    category: values.category,
    monthlyLimit: Number(values.monthlyLimit),
    month: values.month,
    updatedAt: serverTimestamp(),
  })
}

export function deleteBudget(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}
