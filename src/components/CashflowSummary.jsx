export default function CashflowSummary({
  totalCashReceived,
  totalSubmitted,
  balanceInHand
}) {
  return (
    <div className="row g-3 mb-4 text-center">

      <div className="col-md">
        <div className="card bg-primary text-white p-3">
          Total Cash Received
          <h5>{totalCashReceived}</h5>
        </div>
      </div>

      <div className="col-md">
        <div className="card bg-success text-white p-3">
          Total Submitted
          <h5>{totalSubmitted}</h5>
        </div>
      </div>

      <div className="col-md">
        <div className="card bg-warning text-dark p-3">
          Balance In Hand
          <h5>{balanceInHand}</h5>
        </div>
      </div>

    </div>
  );
}
