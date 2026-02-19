export default function PaymentSummary({
  totalCost,
  totalCash,
  totalTransfer,
  totalBalance,
  totalAmount
}) {
  return (
    <div className="row g-3 mb-4 text-center">

      <div className="col">
        <div className="card bg-primary text-white p-3">
          Total Cost
          <h5>{totalCost}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-success text-white p-3">
          Total Cash
          <h5>{totalCash}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-info text-white p-3">
          Total Transfer
          <h5>{totalTransfer}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-warning text-dark p-3">
          Total Balance
          <h5>{totalBalance}</h5>
        </div>
      </div>

      <div className="col">
        <div className="card bg-dark text-white p-3">
          Total Amount
          <h5>{totalAmount}</h5>
        </div>
      </div>

    </div>
  );
}
