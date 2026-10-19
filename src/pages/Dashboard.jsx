import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useBudgets } from '../hooks/useBudgets.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { formatDate, formatMoney, monthLabel } from '../utils/format.js'
import {
  expensesByCategory,
  monthlyTrend,
  sortTransactions,
  spentInMonth,
  summarizeTransactions,
} from '../utils/transactionHelpers.js'

const PIE_COLORS = ['#0f766e', '#0369a1', '#b45309', '#7c3aed', '#be123c', '#047857', '#4338ca']

function Dashboard() {
  const { user } = useAuth()
  const { transactions, loading, error } = useTransactions(user?.uid)
  const { budgets } = useBudgets(user?.uid)
  const summary = summarizeTransactions(transactions)
  const categoryData = expensesByCategory(transactions)
  const trendData = monthlyTrend(transactions)
  const recent = sortTransactions(transactions, 'date', 'desc').slice(0, 5)
  const budgetWarnings = budgets.filter((budget) => {
    const spent = spentInMonth(transactions, budget.month, budget.category)
    return spent >= budget.monthlyLimit
  })

  return (
    <Layout>
      <section className="page-header">
        <div>
          <p className="badge">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Totals are calculated from your Firestore records for{' '}
            <strong>{user?.email}</strong>.
          </p>
        </div>
        <Link className="btn btn-primary" to="/transactions">
          Add transaction
        </Link>
      </section>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading dashboard...</p>
      ) : (
        <>
          <section className="stats-grid">
            <article className="card stat-card">
              <p className="muted">Total income</p>
              <h2>{formatMoney(summary.income)}</h2>
            </article>
            <article className="card stat-card">
              <p className="muted">Total expenses</p>
              <h2>{formatMoney(summary.expense)}</h2>
            </article>
            <article className="card stat-card">
              <p className="muted">Current balance</p>
              <h2 className={summary.balance >= 0 ? 'positive' : 'negative'}>
                {formatMoney(summary.balance)}
              </h2>
            </article>
            <article className="card stat-card">
              <p className="muted">{monthLabel(summary.month)} expenses</p>
              <h2>{formatMoney(summary.monthExpense)}</h2>
            </article>
          </section>

          {budgetWarnings.length > 0 && (
            <p className="alert" role="status">
              {budgetWarnings.length} budget
              {budgetWarnings.length === 1 ? '' : 's'} reached or exceeded.{' '}
              <Link to="/budgets">Review budgets</Link>
            </p>
          )}

          <section className="chart-grid">
            <article className="card">
              <h2>Expense breakdown</h2>
              {categoryData.length === 0 ? (
                <p className="muted empty-state">
                  Add expenses to see a category pie chart.
                </p>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name }) => name}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>

            <article className="card">
              <h2>Monthly income vs expenses</h2>
              {transactions.length === 0 ? (
                <p className="muted empty-state">
                  Add income and expenses to see the 6-month comparison.
                </p>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatMoney(value)} />
                      <Legend />
                      <Bar dataKey="income" fill="#047857" name="Income" />
                      <Bar dataKey="expense" fill="#b91c1c" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
          </section>

          <section className="card stack">
            <div className="section-head">
              <h2>Recent transactions</h2>
              <Link to="/transactions">View all</Link>
            </div>
            {recent.length === 0 ? (
              <p className="muted empty-state">
                No transactions yet. Create your first record on the Transactions
                page.
              </p>
            ) : (
              <ul className="recent-list">
                {recent.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.category}</strong>
                      <p className="muted">
                        {formatDate(item.date)} · {item.description || item.type}
                      </p>
                    </div>
                    <span className={item.type === 'income' ? 'positive' : 'negative'}>
                      {item.type === 'income' ? '+' : '-'}
                      {formatMoney(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Layout>
  )
}

export default Dashboard
