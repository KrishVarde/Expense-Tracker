import { useState } from 'react'
import { TRANSACTION_TYPES, categoriesForType } from '../utils/categories.js'
import { todayValue } from '../utils/format.js'
import { validateTransaction } from '../utils/transactionHelpers.js'

const emptyForm = {
  amount: '',
  type: 'expense',
  category: 'Food',
  date: todayValue(),
  description: '',
}

function TransactionForm({ initialValues, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues || emptyForm)
  const [error, setError] = useState('')

  const categories = categoriesForType(values.type)

  function handleTypeChange(type) {
    const nextCategories = categoriesForType(type)
    setValues((current) => ({
      ...current,
      type,
      category: nextCategories.includes(current.category)
        ? current.category
        : nextCategories[0],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateTransaction(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    await onSubmit(values)
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={values.type}
            onChange={(event) => handleTypeChange(event.target.value)}
            disabled={submitting}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({ ...current, category: event.target.value }))
            }
            disabled={submitting}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={(event) =>
              setValues((current) => ({ ...current, amount: event.target.value }))
            }
            disabled={submitting}
          />
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={values.date}
            onChange={(event) =>
              setValues((current) => ({ ...current, date: event.target.value }))
            }
            disabled={submitting}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          maxLength={200}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          disabled={submitting}
        />
      </div>

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initialValues ? 'Save changes' : 'Add transaction'}
        </button>
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TransactionForm
