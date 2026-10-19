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

const COLLECTION = 'transactions'

function mapDoc(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

export function subscribeTransactions(userId, onData, onError) {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map(mapDoc))
    },
    onError,
  )
}

export function createTransaction(userId, values) {
  return addDoc(collection(db, COLLECTION), {
    userId,
    amount: Number(values.amount),
    type: values.type,
    category: values.category,
    date: values.date,
    description: (values.description || '').trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateTransaction(id, values) {
  return updateDoc(doc(db, COLLECTION, id), {
    amount: Number(values.amount),
    type: values.type,
    category: values.category,
    date: values.date,
    description: (values.description || '').trim(),
    updatedAt: serverTimestamp(),
  })
}

export function deleteTransaction(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}
