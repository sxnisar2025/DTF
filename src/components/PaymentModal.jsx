export default function PaymentModal({
  showModal,
  selectedOrder,
  paymentMethod,
  setPaymentMethod,
  cash,
  setCash,
  transfer,
  setTransfer,
  setFile,
  resetModal,
  handleSavePayment
}) {
  if (!showModal || !selectedOrder) return null

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Add Payment — {selectedOrder.id}</h5>
            <button className="btn-close" onClick={resetModal}></button>
          </div>

          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6"><b>User :</b> {selectedOrder.userName}</div>
              <div className="col-md-6"><b>Phone :</b> {selectedOrder.phone}</div>
            </div>

            <hr />

            <div className="row g-3">
              <div className="col-md-6">
                <label>Select Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={e => {
                    setPaymentMethod(e.target.value)
                    setCash("")
                    setTransfer("")
                  }}
                >
                  <option value="">Select</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              {paymentMethod === "Cash" && (
                <div className="col-md-6">
                  <label>Cash Amount</label>
                  <input
                    className="form-control"
                    value={cash}
                    onChange={e => setCash(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              )}

              {paymentMethod === "Transfer" && (
                <>
                  <div className="col-md-6">
                    <label>Transfer Amount</label>
                    <input
                      className="form-control"
                      value={transfer}
                      onChange={e => setTransfer(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Attach Receipt</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={resetModal}>Cancel</button>
            <button className="btn btn-dark" onClick={handleSavePayment}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
