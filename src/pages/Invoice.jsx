import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Invoice() {

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);

  // ================= LOAD DATA =================

  useEffect(() => {

    const orderData = JSON.parse(localStorage.getItem("orders")) || [];
    const paymentData = JSON.parse(localStorage.getItem("payments")) || [];

    setOrders(orderData);
    setPayments(paymentData);

  }, []);

  // ================= SEARCH ORDER =================

 const handleSearch = () => {

  if (!search) return alert("Enter Order ID or Phone");

  const order = orders.find(
    o => o.id === search || o.phone === search
  );

  if (!order) {
    setInvoiceData(null);
    return alert("Order not found");
  }

  // ✅ GET ALL PAYMENTS FOR THIS ORDER
  const orderPayments = payments.filter(
    p => p.id === order.id
  );

  // ✅ SUM CASH
  const totalCash = orderPayments.reduce(
    (sum, p) => sum + Number(p.cash || 0),
    0
  );

  // ✅ SUM TRANSFER
  const totalTransfer = orderPayments.reduce(
    (sum, p) => sum + Number(p.transfer || 0),
    0
  );

  // ✅ TOTAL PAID
  const totalPaid = totalCash + totalTransfer;

  // ✅ BALANCE
  const balance = Number(order.totalCost) - totalPaid;

  // ✅ SET INVOICE DATA
  setInvoiceData({
    ...order,
    cash: totalCash,
    transfer: totalTransfer,
    paid: totalPaid,
    balance: balance < 0 ? 0 : balance
  });

};


  // ================= PDF EXPORT =================

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("DTF SYSTEM INVOICE", 14, 15);

    doc.setFontSize(10);

    doc.text(`Invoice ID: ${invoiceData.id}`, 14, 25);
    doc.text(`Date: ${invoiceData.dateTime}`, 14, 32);

    doc.text(`Customer: ${invoiceData.userName}`, 140, 25);
    doc.text(`Phone: ${invoiceData.phone}`, 140, 32);

    doc.autoTable({

      startY: 45,

      head: [["Description", "Size", "Rate", "Total"]],

      body: [[
        invoiceData.orderType + " Order",
        invoiceData.itemSize,
        invoiceData.itemRate,
        invoiceData.totalCost
      ]]

    });

    doc.autoTable({

      startY: doc.lastAutoTable.finalY + 10,

      head: [["Payment Summary", "Amount"]],

      body: [
        ["Cash", invoiceData.cash],
        ["Transfer", invoiceData.transfer],
        ["Total Paid", invoiceData.paid],
        ["Balance", invoiceData.balance]
      ]

    });

    doc.save(`Invoice_${invoiceData.id}.pdf`);

  };

  // ================= PRINT =================

  const printInvoice = () => {
    window.print();
  };

  // ================= UI =================

  return (

    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="container p-4 flex-fill">

        <div className="card shadow p-4">

          {/* PAGE TITLE */}

          <h4 className="fw-bold mb-3">Invoice Generator</h4>

          {/* SEARCH */}

          <div className="row g-2 mb-4">

            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Enter Order ID or Phone"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-auto">
              <button onClick={handleSearch} className="btn btn-dark">
                Generate Invoice
              </button>
            </div>

          </div>

          {/* INVOICE PREVIEW */}

          {invoiceData && (

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
                  <b>Customer:</b> {invoiceData.userName} | <b>Phone:</b> {invoiceData.phone}
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
                      <tr>
                        <td>Cash</td>
                        <td>{invoiceData.cash}</td>
                      </tr>

                      <tr>
                        <td>Transfer</td>
                        <td>{invoiceData.transfer}</td>
                      </tr>

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

          )}

        </div>

      </main>

      <Footer />

    </div>

  );

}
