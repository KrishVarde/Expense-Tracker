import { formatDate, formatMoney } from '../utils/format.js'

function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <p className="muted empty-state">
        No transactions match these filters. Add one above or clear a filter.
      </p>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Description</th>
            <th className="num">Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td>{formatDate(item.date)}</td>
              <td>
                <span className={`pill pill-${item.type}`}>{item.type}</span>
              </td>
              <td>{item.category}</td>
              <td>{item.description || '—'}</td>
              <td className={`num ${item.type === 'income' ? 'positive' : 'negative'}`}>
                {item.type === 'income' ? '+' : '-'}
                {formatMoney(item.amount)}
              </td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-ghost btn-small" type="button" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    type="button"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
