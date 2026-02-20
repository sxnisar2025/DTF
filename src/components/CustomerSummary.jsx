export default function CustomerSummary({ total, local, online }) {
  return (
    <div className="row g-3 text-center mb-4">

      <div className="col-md">
        <div className="card bg-primary text-white p-3">
          Total Users
          <h4>{total}</h4>
        </div>
      </div>

      <div className="col-md">
        <div className="card bg-success text-white p-3">
          Local Users
          <h4>{local}</h4>
        </div>
      </div>

      <div className="col-md">
        <div className="card bg-warning text-dark p-3">
          Online Users
          <h4>{online}</h4>
        </div>
      </div>

    </div>
  );
}