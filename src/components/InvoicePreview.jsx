export default function InvoicePreview({
  invoiceData,
  printInvoice,
  exportPDF
}) {
  if (!invoiceData) return null;

  return (
    <div id="invoiceArea" className="border p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <div>
          <h5 className="fw-bold">DTF SYSTEM</h5>
          <small>Sxentra Printing Service</small>
        </div>

        <div className="text-end">
          <div><b>Invoice:</b> {invoiceData.id}</div>
          <div><b>Date:</b> {invoiceData.dateTime}</div>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="row mb-3">
        <div className="col">
          <b>Customer:</b> {invoiceData.userName} |{" "}
          <b>Phone:</b> {invoiceData.phone}
        </div>
      </div>

      {/* ORDER TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Description</th>
            <th>Size</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{invoiceData.Description}</td>
            <td>{invoiceData.itemSize}</td>
            <td>{invoiceData.itemRate}</td>
            <td>{invoiceData.totalCost}</td>
          </tr>
        </tbody>
      </table>

      {/* PAYMENT SUMMARY */}
      <div className="row justify-content-end">
        <div className="col-md-4">
          <table className="table table-bordered">
            <tbody>
              <tr><td>Cash</td><td>{invoiceData.cash}</td></tr>
              <tr><td>Transfer</td><td>{invoiceData.transfer}</td></tr>
              <tr className="table-success">
                <td><b>Total Paid</b></td>
                <td><b>{invoiceData.paid}</b></td>
              </tr>
              <tr className={invoiceData.balance === 0 ? "table-success" : "table-warning"}>
                <td><b>Balance</b></td>
                <td><b>{invoiceData.balance}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-3">
        Status:{" "}
        <span className={`badge ${invoiceData.balance === 0 ? "bg-success" : "bg-warning text-dark"}`}>
          {invoiceData.balance === 0 ? "PAID" : "PENDING"}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 d-flex gap-2">
        <button onClick={printInvoice} className="btn btn-primary">
          Print Invoice
        </button>

        <button onClick={exportPDF} className="btn btn-danger">
          Download PDF
        </button>
      </div>

    </div>
  );
}