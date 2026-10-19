import { useEffect, useState } from 'react'
import { subscribeTransactions } from '../services/transactions.js'
import { getFirestoreErrorMessage } from '../utils/firestoreErrors.js'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = subscribeTransactions(
      userId,
      (items) => {
        setTransactions(items)
        setError('')
        setLoading(false)
      },
      (snapshotError) => {
        setError(getFirestoreErrorMessage(snapshotError))
        setLoading(false)
      },
    )

    return unsubscribe
  }, [userId])

  return { transactions, loading, error }
}
