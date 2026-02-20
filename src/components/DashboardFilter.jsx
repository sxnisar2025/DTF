export default function DashboardFilter({
  fromDate,
  toDate,
  month,
  setFromDate,
  setToDate,
  setMonth
}) {
  return (
    <div className="card p-4 shadow mb-4">
      <div className="row g-3 align-items-center">

        <div className="col-md-2 fw-bold fs-5">
          Dashboard
        </div>

        <div className="col-md">
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="col-md">
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="col-md">
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="form-select"
          >
            <option value="">All Months</option>

            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long"
                })}
              </option>
            ))}

          </select>
        </div>

      </div>
    </div>
  );
}