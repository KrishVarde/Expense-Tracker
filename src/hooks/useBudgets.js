import { useEffect, useState } from 'react'
import { subscribeBudgets } from '../services/budgets.js'
import { getFirestoreErrorMessage } from '../utils/firestoreErrors.js'

export function useBudgets(userId) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setBudgets([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = subscribeBudgets(
      userId,
      (items) => {
        setBudgets(items)
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

  return { budgets, loading, error }
}
