export default function PaymentHistoryModal({
  showHistoryModal,
  historyOrder,
  payments,
  setShowHistoryModal
}) {
  if (!showHistoryModal || !historyOrder) return null

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5>Payment History — {historyOrder.id}</h5>
            <button className="btn-close" onClick={() => setShowHistoryModal(false)} />
          </div>

          <div className="modal-body">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Cash</th>
                  <th>Transfer</th>
                  <th>File</th>
                </tr>
              </thead>

              <tbody>
                {payments
                  .filter(p => p.orderId === historyOrder.id)
                  .map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.date}</td>
                      <td>{p.cash}</td>
                      <td>{p.transfer}</td>
                      <td>{p.file}</td>
                    </tr>
                  ))}
              </tbody>

              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="2">Total Paid</td>
                  <td colSpan="3">{historyOrder.amount}</td>
                </tr>
                <tr>
                  <td colSpan="2">Remaining Balance</td>
                  <td colSpan="3">{historyOrder.balance}</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
