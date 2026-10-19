export const TRANSACTION_TYPES = ['income', 'expense']

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Scholarship',
  'Gift',
  'Other income',
]

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Education',
  'Shopping',
  'Health',
  'Entertainment',
  'Bills',
  'Other',
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export function categoriesForType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}
