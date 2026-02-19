export default function OrderFilters({
  search,
  setSearch,
  setStatusFilter,
  setMonthFilter,
  setDateFilter
}) {
  return (
    <div className="row g-2 mb-3">

      <div className="col-md">
        <input
          className="form-control"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="col-md">
        <select
          className="form-select"
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="InProgress">InProgress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="col-md">
        <input
          type="month"
          className="form-control"
          onChange={e => setMonthFilter(e.target.value.split("-")[1])}
        />
      </div>

      <div className="col-md">
        <input
          type="date"
          className="form-control"
          onChange={e => setDateFilter(e.target.value)}
        />
      </div>

    </div>
  );
}
