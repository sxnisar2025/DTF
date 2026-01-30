import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Payment() {

  // ================= STATES =================

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cash, setCash] = useState("");
  const [transfer, setTransfer] = useState("");
  const [file, setFile] = useState(null);

  // ================= LOAD DATA =================

  useEffect(() => {

    const orderData = JSON.parse(localStorage.getItem("orders")) || [];
    const paymentData = JSON.parse(localStorage.getItem("payments")) || [];

    setOrders(orderData);
    setPayments(paymentData);

  }, []);

  // ================= MERGE DATA =================

  const mergedData = useMemo(() => {

    return orders.map(order => {

      const pay = payments.find(p => p.id === order.id) || {};

      const cashVal = Number(pay.cash || 0);
      const transferVal = Number(pay.transfer || 0);
      const amount = cashVal + transferVal;
      const balance = Number(order.totalCost) - amount;

      return {
        ...order,
        paymentDate: pay.date || "",
        cash: cashVal,
        transfer: transferVal,
        file: pay.file || "",
        amount,
        balance
      };

    });

  }, [orders, payments]);

  // ================= FILTER =================

  const filteredData = useMemo(() => {

    return mergedData.filter(o =>
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.id.includes(search)
    );

  }, [mergedData, search]);

  // ================= SUMMARY =================

  const totalCost = filteredData.reduce((s, o) => s + Number(o.totalCost), 0);
  const totalCash = filteredData.reduce((s, o) => s + Number(o.cash), 0);
  const totalTransfer = filteredData.reduce((s, o) => s + Number(o.transfer), 0);
  const totalAmount = filteredData.reduce((s, o) => s + Number(o.amount), 0);
  const totalBalance = filteredData.reduce((s, o) => s + Number(o.balance), 0);

  // ================= SAVE PAYMENT =================

  const handleSavePayment = () => {

    const paidAmount = Number(cash) + Number(transfer);

    if (paidAmount <= 0) {
      alert("Enter payment amount");
      return;
    }

    if (paidAmount > selectedOrder.totalCost) {
      alert("Payment exceeds total cost");
      return;
    }

    const newPayment = {
      id: selectedOrder.id,
      cash: Number(cash),
      transfer: Number(transfer),
      file: file ? file.name : "",
      date: new Date().toLocaleString()
    };

    const updated = payments.filter(p => p.id !== selectedOrder.id);
    updated.push(newPayment);

    setPayments(updated);
    localStorage.setItem("payments", JSON.stringify(updated));

    resetModal();
  };

  const resetModal = () => {

    setCash("");
    setTransfer("");
    setFile(null);
    setShowModal(false);

  };

  // ================= EXPORT =================

  const exportExcel = () => {

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payment-record.xlsx");

  };

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.text("Payment Record", 14, 10);

    doc.autoTable({

      startY: 20,

      head: [[
        "ID", "User", "Phone", "Cost",
        "Cash", "Transfer", "Balance"
      ]],

      body: filteredData.map(o => ([
        o.id,
        o.userName,
        o.phone,
        o.totalCost,
        o.cash,
        o.transfer,
        o.balance
      ]))

    });

    doc.save("payment-record.pdf");

  };

  // ================= UI =================

  return (

    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="container-fluid p-4 flex-fill">

        {/* PAGE TITLE */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h3 className="fw-bold">Payment Management</h3>

          <div>
            <button onClick={exportExcel} className="btn btn-success btn-sm me-2">
              Excel
            </button>

            <button onClick={exportPDF} className="btn btn-danger btn-sm">
              PDF
            </button>
          </div>

        </div>

        {/* SUMMARY */}

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

        {/* SEARCH */}

        <input
          className="form-control mb-3"
          placeholder="Search by Name / Phone / ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* TABLE */}

        <div className="card shadow p-3">

          <h5 className="fw-bold mb-3">Payment Record</h5>

          <div className="table-responsive">

            <table className="table table-bordered align-middle">

              <thead className="table-light">
                <tr>
                  <th>Sr</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Size</th>
                  <th>Rate</th>
                  <th>Cost</th>
                  <th>Cash</th>
                  <th>Transfer</th>
                  <th>File</th>
                  <th>Balance</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredData.map((o, i) => (

                  <tr key={i}>

                    <td>{i + 1}</td>
                    <td>{o.id}</td>
                    <td>{o.paymentDate || o.dateTime}</td>
                    <td>{o.userName}</td>
                    <td>{o.phone}</td>
                    <td>{o.itemSize}</td>
                    <td>{o.itemRate}</td>
                    <td>{o.totalCost}</td>
                    <td>{o.cash}</td>
                    <td>{o.transfer}</td>
                    <td>{o.file}</td>
                    <td>{o.balance}</td>
                    <td>{o.amount}</td>

                    <td>
                      <button
                        disabled={o.balance === 0}
                        className="btn btn-sm btn-dark"
                        onClick={() => {
                          setSelectedOrder(o);
                          setCash("");
                          setTransfer("");
                          setShowModal(true);
                        }}
                      >
                        {o.balance === 0 ? "Paid" : "Add Payment"}
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

      <Footer />

      {/* ================= MODAL ================= */}

      {showModal && selectedOrder && (

        <div className="modal d-block bg-dark bg-opacity-50">

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">
                <h5>Add Payment</h5>
                <button className="btn-close" onClick={resetModal}></button>
              </div>

              <div className="modal-body">

                {/* ORDER INFO */}

                <div className="row mb-3 ">
 <div className="col-md-4">
<b>Date : </b>{selectedOrder.dateTime}<br></br>
<b>User : </b>{selectedOrder.userName}<br></br>


                  </div>
                   <div className="col-md-4">
                     <b>Phone : </b>{selectedOrder.phone}<br></br>
                   <b>Size : </b>{selectedOrder.itemSize}<br></br>
                  
                 
                  </div>
                   <div className="col-md-4">
                  <b>Rate : </b>{selectedOrder.itemRate}<br></br>
                  <b>Cost : </b>{selectedOrder.totalCost}<br></br>
                  </div>

                </div>
                 <div className="row g-3">
                  <div className="col-12">
<hr></hr>
                    </div>
                 </div>

                {/* INPUTS */}

                <div className="row g-3">

                  <div className="col-md-3">
                    <label>Cash</label>
                    <input
                      className="form-control"
                      placeholder="Enter cash"
                      value={cash}
                      onChange={e => setCash(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label>Transfer</label>
                    <input
                      className="form-control"
                      placeholder="Enter transfer"
                      value={transfer}
                      onChange={e => setTransfer(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Attached File</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Balance</label>
                    <input
                      className="form-control"
                      placeholder="Remaining balance"
                      value={selectedOrder.totalCost - (Number(cash) + Number(transfer))}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Amount</label>
                    <input
                      className="form-control"
                      placeholder="Paid amount"
                      value={Number(cash) + Number(transfer)}
                      readOnly
                    />
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button className="btn btn-secondary" onClick={resetModal}>
                  Cancel
                </button>

                <button className="btn btn-dark" onClick={handleSavePayment}>
                  Submit
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
