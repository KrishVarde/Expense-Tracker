import { useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useBudgets } from '../hooks/useBudgets.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { createBudget, deleteBudget, updateBudget } from '../services/budgets.js'
import { EXPENSE_CATEGORIES } from '../utils/categories.js'
import { currentMonthValue, formatMoney, monthLabel } from '../utils/format.js'
import { getFirestoreErrorMessage } from '../utils/firestoreErrors.js'
import { spentInMonth, validateBudget } from '../utils/transactionHelpers.js'

const emptyForm = {
  category: 'Food',
  monthlyLimit: '',
  month: currentMonthValue(),
}

function Budgets() {
  const { user } = useAuth()
  const { budgets, loading, error } = useBudgets(user?.uid)
  const { transactions } = useTransactions(user?.uid)
  const [values, setValues] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const rows = useMemo(() => {
    return [...budgets]
      .sort((a, b) => String(b.month).localeCompare(String(a.month)))
      .map((budget) => {
        const spent = spentInMonth(transactions, budget.month, budget.category)
        const remaining = budget.monthlyLimit - spent
        let status = 'ok'
        if (spent >= budget.monthlyLimit) {
          status = spent > budget.monthlyLimit ? 'over' : 'reached'
        } else if (spent >= budget.monthlyLimit * 0.8) {
          status = 'warning'
        }
        return { ...budget, spent, remaining, status }
      })
  }, [budgets, transactions])

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateBudget(values, budgets, editingId)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      if (editingId) {
        await updateBudget(editingId, values)
        setEditingId(null)
      } else {
        await createBudget(user.uid, values)
      }
      setValues({ ...emptyForm, month: values.month })
    } catch (saveError) {
      setFormError(getFirestoreErrorMessage(saveError))
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(budget) {
    setEditingId(budget.id)
    setValues({
      category: budget.category,
      monthlyLimit: String(budget.monthlyLimit),
      month: budget.month,
    })
    setFormError('')
  }

  async function handleDelete(budget) {
    const confirmed = window.confirm(
      `Delete the ${budget.category} budget for ${monthLabel(budget.month)}?`,
    )
    if (!confirmed) {
      return
    }

    try {
      await deleteBudget(budget.id)
      if (editingId === budget.id) {
        setEditingId(null)
        setValues(emptyForm)
      }
    } catch (deleteError) {
      setFormError(getFirestoreErrorMessage(deleteError))
    }
  }

  return (
    <Layout>
      <section className="page-header">
        <div>
          <p className="badge">Monthly limits</p>
          <h1>Budgets</h1>
          <p className="muted">
            Set a spending cap per category and month. Spent amounts come from
            your expense transactions.
          </p>
        </div>
      </section>

      <section className="card stack">
        <h2>{editingId ? 'Edit budget' : 'Add budget'}</h2>
        {formError && (
          <p className="alert" role="alert">
            {formError}
          </p>
        )}
        <form className="stack" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="budgetCategory">Category</label>
              <select
                id="budgetCategory"
                value={values.category}
                onChange={(event) =>
                  setValues((current) => ({ ...current, category: event.target.value }))
                }
                disabled={submitting}
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="budgetMonth">Month</label>
              <input
                id="budgetMonth"
                type="month"
                value={values.month}
                onChange={(event) =>
                  setValues((current) => ({ ...current, month: event.target.value }))
                }
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="monthlyLimit">Monthly limit</label>
              <input
                id="monthlyLimit"
                type="number"
                min="0.01"
                step="0.01"
                value={values.monthlyLimit}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    monthlyLimit: event.target.value,
                  }))
                }
                disabled={submitting}
              />
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Save budget' : 'Add budget'}
            </button>
            {editingId && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setValues(emptyForm)
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card stack">
        <h2>Budget progress</h2>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="muted">Loading budgets...</p>
        ) : rows.length === 0 ? (
          <p className="muted empty-state">
            No budgets yet. Add a category limit to start tracking overspend.
          </p>
        ) : (
          <div className="budget-list">
            {rows.map((budget) => {
              const percent = Math.min(
                100,
                Math.round((budget.spent / budget.monthlyLimit) * 100),
              )
              return (
                <article key={budget.id} className={`budget-card status-${budget.status}`}>
                  <div className="budget-head">
                    <div>
                      <h3>{budget.category}</h3>
                      <p className="muted">{monthLabel(budget.month)}</p>
                    </div>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-small" type="button" onClick={() => startEdit(budget)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        type="button"
                        onClick={() => handleDelete(budget)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p>
                    Spent {formatMoney(budget.spent)} of {formatMoney(budget.monthlyLimit)}.{' '}
                    {budget.remaining >= 0
                      ? `${formatMoney(budget.remaining)} remaining.`
                      : `${formatMoney(Math.abs(budget.remaining))} over budget.`}
                  </p>
                  {(budget.status === 'reached' || budget.status === 'over') && (
                    <p className="alert" role="status">
                      {budget.status === 'over'
                        ? 'This budget has been exceeded.'
                        : 'This budget has been reached.'}
                    </p>
                  )}
                  <div className="progress" aria-hidden="true">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default Budgets
