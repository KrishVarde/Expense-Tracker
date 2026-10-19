import { currentMonthValue } from './format.js'

export function spentInMonth(transactions, month, category) {
  return transactions
    .filter(
      (item) =>
        item.type === 'expense' &&
        item.date?.startsWith(month) &&
        (!category || item.category === category),
    )
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export function summarizeTransactions(transactions) {
  const totals = transactions.reduce(
    (acc, item) => {
      const amount = Number(item.amount) || 0
      if (item.type === 'income') {
        acc.income += amount
      } else if (item.type === 'expense') {
        acc.expense += amount
      }
      return acc
    },
    { income: 0, expense: 0 },
  )

  const month = currentMonthValue()
  const monthExpense = spentInMonth(transactions, month)

  return {
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
    monthExpense,
    month,
  }
}

export function expensesByCategory(transactions) {
  const totals = {}

  transactions.forEach((item) => {
    if (item.type !== 'expense') {
      return
    }
    const category = item.category || 'Other'
    totals[category] = (totals[category] || 0) + Number(item.amount || 0)
  })

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function monthlyTrend(transactions, months = 6) {
  const buckets = []
  const now = new Date()

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    buckets.push({
      key,
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expense: 0,
    })
  }

  const indexByKey = Object.fromEntries(buckets.map((bucket, index) => [bucket.key, index]))

  transactions.forEach((item) => {
    const key = item.date?.slice(0, 7)
    const index = indexByKey[key]
    if (index === undefined) {
      return
    }
    const amount = Number(item.amount) || 0
    if (item.type === 'income') {
      buckets[index].income += amount
    } else if (item.type === 'expense') {
      buckets[index].expense += amount
    }
  })

  return buckets
}

export function sortTransactions(items, sortBy, sortDir) {
  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'amount') {
      return Number(a.amount) - Number(b.amount)
    }
    return String(a.date).localeCompare(String(b.date))
  })

  return sortDir === 'asc' ? sorted : sorted.reverse()
}

export function filterTransactions(items, filters) {
  return items.filter((item) => {
    if (filters.type && item.type !== filters.type) {
      return false
    }
    if (filters.category && item.category !== filters.category) {
      return false
    }
    if (filters.from && item.date < filters.from) {
      return false
    }
    if (filters.to && item.date > filters.to) {
      return false
    }
    return true
  })
}

export function validateTransaction(values) {
  const amount = Number(values.amount)

  if (!values.type) {
    return 'Choose income or expense.'
  }
  if (!values.category) {
    return 'Choose a category.'
  }
  if (!values.amount || Number.isNaN(amount)) {
    return 'Enter a valid amount.'
  }
  if (amount <= 0) {
    return 'Amount must be greater than 0.'
  }
  if (!values.date) {
    return 'Choose a date.'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    return 'Date must be a valid calendar date.'
  }
  if ((values.description || '').length > 200) {
    return 'Description must be 200 characters or fewer.'
  }
  return ''
}

export function validateBudget(values, existing, editingId) {
  const limit = Number(values.monthlyLimit)

  if (!values.category) {
    return 'Choose a category.'
  }
  if (!values.month) {
    return 'Choose a month.'
  }
  if (!/^\d{4}-\d{2}$/.test(values.month)) {
    return 'Month must use YYYY-MM format.'
  }
  if (!values.monthlyLimit || Number.isNaN(limit)) {
    return 'Enter a valid budget limit.'
  }
  if (limit <= 0) {
    return 'Budget limit must be greater than 0.'
  }

  const duplicate = existing.some(
    (item) =>
      item.id !== editingId &&
      item.category === values.category &&
      item.month === values.month,
  )

  if (duplicate) {
    return 'A budget for this category and month already exists.'
  }

  return ''
}
