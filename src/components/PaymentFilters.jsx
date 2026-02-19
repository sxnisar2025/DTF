export default function PaymentFilters({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  monthFilter,
  setMonthFilter,
  dateFilter,
  setDateFilter
}) {
  return (
    <div className="row g-2 mb-3">

      <div className="col-md-3">
        <input
          className="form-control"
          placeholder="Search by Name / Phone / ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <select
          className="form-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Cash">Cash</option>
          <option value="Transfer">Transfer</option>
          <option value="Balance">Balance</option>
        </select>
      </div>

      <div className="col-md-2">
        <select
          className="form-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="InProgress">InProgress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="col-md-2">
        <input
          type="month"
          className="form-control"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
      </div>

    </div>
  );
}
