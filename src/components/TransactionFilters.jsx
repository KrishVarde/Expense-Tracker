import { ALL_CATEGORIES, TRANSACTION_TYPES } from '../utils/categories.js'

function TransactionFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="filterType">Type</label>
        <select
          id="filterType"
          value={filters.type}
          onChange={(event) => update('type', event.target.value)}
        >
          <option value="">All</option>
          {TRANSACTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filterCategory">Category</label>
        <select
          id="filterCategory"
          value={filters.category}
          onChange={(event) => update('category', event.target.value)}
        >
          <option value="">All</option>
          {ALL_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filterFrom">From</label>
        <input
          id="filterFrom"
          type="date"
          value={filters.from}
          onChange={(event) => update('from', event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="filterTo">To</label>
        <input
          id="filterTo"
          type="date"
          value={filters.to}
          onChange={(event) => update('to', event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="sortBy">Sort by</label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={(event) => update('sortBy', event.target.value)}
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="sortDir">Order</label>
        <select
          id="sortDir"
          value={filters.sortDir}
          onChange={(event) => update('sortDir', event.target.value)}
        >
          <option value="desc">Newest / highest first</option>
          <option value="asc">Oldest / lowest first</option>
        </select>
      </div>
    </div>
  )
}

export default TransactionFilters
