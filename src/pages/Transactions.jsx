import { useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import TransactionFilters from '../components/TransactionFilters.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionList from '../components/TransactionList.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useTransactions } from '../hooks/useTransactions.js'
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '../services/transactions.js'
import { getFirestoreErrorMessage } from '../utils/firestoreErrors.js'
import { filterTransactions, sortTransactions } from '../utils/transactionHelpers.js'

const defaultFilters = {
  type: '',
  category: '',
  from: '',
  to: '',
  sortBy: 'date',
  sortDir: 'desc',
}

function Transactions() {
  const { user } = useAuth()
  const { transactions, loading, error } = useTransactions(user?.uid)
  const [filters, setFilters] = useState(defaultFilters)
  const [editing, setEditing] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const visible = useMemo(() => {
    const filtered = filterTransactions(transactions, filters)
    return sortTransactions(filtered, filters.sortBy, filters.sortDir)
  }, [transactions, filters])

  async function handleSubmit(values) {
    setSubmitting(true)
    setFormError('')

    try {
      if (editing) {
        await updateTransaction(editing.id, values)
        setEditing(null)
      } else {
        await createTransaction(user.uid, values)
        setFormKey((current) => current + 1)
      }
    } catch (saveError) {
      setFormError(getFirestoreErrorMessage(saveError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete this ${item.type} of ${item.amount} in ${item.category}?`,
    )
    if (!confirmed) {
      return
    }

    try {
      await deleteTransaction(item.id)
      if (editing?.id === item.id) {
        setEditing(null)
      }
    } catch (deleteError) {
      setFormError(getFirestoreErrorMessage(deleteError))
    }
  }

  return (
    <Layout>
      <section className="page-header">
        <div>
          <p className="badge">Cloud Firestore</p>
          <h1>Transactions</h1>
          <p className="muted">
            Add income and expenses. Records are stored in Firestore and belong
            only to your account.
          </p>
        </div>
      </section>

      <section className="card stack">
        <h2>{editing ? 'Edit transaction' : 'Add transaction'}</h2>
        {formError && (
          <p className="alert" role="alert">
            {formError}
          </p>
        )}
        <TransactionForm
          key={editing?.id || `create-${formKey}`}
          initialValues={
            editing
              ? {
                  amount: String(editing.amount),
                  type: editing.type,
                  category: editing.category,
                  date: editing.date,
                  description: editing.description || '',
                }
              : undefined
          }
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </section>

      <section className="card stack">
        <h2>All transactions</h2>
        <TransactionFilters filters={filters} onChange={setFilters} />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="muted">Loading transactions...</p>
        ) : (
          <TransactionList
            transactions={visible}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        )}
      </section>
    </Layout>
  )
}

export default Transactions
