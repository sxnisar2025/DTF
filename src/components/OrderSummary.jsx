export default function OrderSummary({
  createdOrders,
  inProgressOrders,
  completedOrders,
  totalItemSize,
  totalItemCost
}) {
  return (
    <div className="row g-3 mb-4 text-center">

      <div className="col">
        <div className="card bg-primary text-white p-3">
          Created Orders
          <h5>{createdOrders}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-warning text-dark p-3">
          InProgress Orders
          <h5>{inProgressOrders}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-success text-white p-3">
          Completed Orders
          <h5>{completedOrders}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-info text-white p-3">
          Total Size (M)
          <h5>{totalItemSize}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-dark text-white p-3">
          Total Cost
          <h5>{totalItemCost}</h5>
        </div>
      </div>

    </div>
  );
}
