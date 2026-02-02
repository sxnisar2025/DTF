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

  const [typeFilter, setTypeFilter] = useState(""); // Cash / Transfer / Balance
  const [statusFilter, setStatusFilter] = useState(""); // InProgress / Closed
  const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  const [showHistoryModal, setShowHistoryModal] = useState(false);
const [historyOrder, setHistoryOrder] = useState(null);



  const paidNow = useMemo(() => {
    return Number(cash || 0) + Number(transfer || 0);
  }, [cash, transfer]);

  const remainingBalance = useMemo(() => {
    if (!selectedOrder) return 0;
    return Number(selectedOrder.balance) - paidNow;
  }, [selectedOrder, paidNow]);


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

     
const orderPayments = payments.filter(p => p.id === order.id);

const cashVal = orderPayments.reduce((s, p) => s + Number(p.cash || 0), 0);
const transferVal = orderPayments.reduce((s, p) => s + Number(p.transfer || 0), 0);
      const amount = cashVal + transferVal;
      const balance = order.balance ?? Number(order.totalCost) - amount;

      return {
        ...order,
        paymentDate: orderPayments.length ? orderPayments[orderPayments.length - 1].date : "",
file: orderPayments.length ? orderPayments[orderPayments.length - 1].file : "",
        cash: cashVal,
        transfer: transferVal,
        
        amount,
        balance
      };

    });

  }, [orders, payments]);

  // ================= FILTER =================

  // ================= FILTER DATA =================
  const filteredData = useMemo(() => {

    return mergedData.filter(o => {

      const searchMatch =
        o.userName.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.id.includes(search);

      const statusMatch =
        !statusFilter || (statusFilter === "Closed" ? o.balance === 0 : o.balance > 0);

      const typeMatch =
        !typeFilter ||
        (typeFilter === "Cash" && o.cash > 0) ||
        (typeFilter === "Transfer" && o.transfer > 0) ||
        (typeFilter === "Balance" && o.balance > 0);

      const monthMatch =
        !monthFilter || (o.paymentDate && o.paymentDate.startsWith(monthFilter));

      const dateMatch =
        !dateFilter || (o.paymentDate && o.paymentDate === dateFilter);

      return searchMatch && statusMatch && typeMatch && monthMatch && dateMatch;

    });

  }, [mergedData, search, statusFilter, typeFilter, monthFilter, dateFilter]);


  // ================= SUMMARY =================

  const totalCost = filteredData.reduce((s, o) => s + Number(o.totalCost), 0);
  const totalCash = filteredData.reduce((s, o) => s + Number(o.cash), 0);
  const totalTransfer = filteredData.reduce((s, o) => s + Number(o.transfer), 0);
  const totalAmount = filteredData.reduce((s, o) => s + Number(o.amount), 0);
  const totalBalance = filteredData.reduce((s, o) => s + Number(o.balance), 0);

  // ================= SAVE PAYMENT =================

 const handleSavePayment = () => {

  // validation
  const paidAmount = Number(cash) + Number(transfer);

  if (paidAmount <= 0) {
    alert("Enter payment amount");
    return;
  }

  // create new payment
  const newPayment = {
    id: selectedOrder.id,
    cash: Number(cash),
    transfer: Number(transfer),
    file: file ? file.name : "",
    date: new Date().toLocaleString()
  };

  // NEW FIXED LOGIC
  const existingPayments = payments.filter(
    p => p.id === selectedOrder.id
  );

  const updatedList = payments.filter(
    p => p.id !== selectedOrder.id
  );

  updatedList.push(...existingPayments, newPayment);

  setPayments(updatedList);
  localStorage.setItem("payments", JSON.stringify(updatedList));

  // ================= UPDATE ORDER BALANCE + STATUS =================

const orderPayments = updatedList.filter(
  p => p.id === selectedOrder.id
);

const totalPaid = orderPayments.reduce(
  (sum, p) => sum + Number(p.cash) + Number(p.transfer),
  0
);

const updatedOrders = orders.map(o => {

  if (o.id !== selectedOrder.id) return o;

  const remaining = Number(o.totalCost) - totalPaid;

  return {
  ...o,
  paidAmount: totalPaid,
  balance: remaining < 0 ? 0 : remaining,
  status: remaining <= 0 ? "Closed" : "InProgress",
  lastPaymentDate: new Date().toLocaleString()
};


});

setOrders(updatedOrders);
localStorage.setItem("orders", JSON.stringify(updatedOrders));


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

        <div className="row g-2 mb-3">

          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Search by Name / Phone / ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="Balance">Balance</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="InProgress">InProgress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="month"
              className="form-control"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>

        </div>

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
                  <tr
                    key={i}
                    className={o.balance === 0 ? "table-success" : ""} // Bootstrap class for light green
                  >
                    <td>{i + 1}</td>
                    <td>{o.id}</td>
                    <td>{o.paymentDate || o.dateTime}</td>
                    <td>{o.userName}</td>
                    <td>{o.phone}</td>
                    
                    <td>{o.totalCost}</td>
                    <td>{o.cash}</td>
                    <td>{o.transfer}</td>
                    <td>{o.file}</td>
                    <td>{o.balance}</td>
                    <td>{o.amount}</td>
                    <td>
                      <button
                        disabled={o.balance === 0} // disable button if fully paid
                        className="btn btn-sm btn-dark"
                        onClick={() => {
                          setSelectedOrder(o);
                          setCash("");
                          setTransfer("");
                          setFile(null);
                          setShowModal(true);
                        }}
                      >
                        {o.balance === 0 ? "Paid" : "Add Payment"}
                      </button>
                      <button
  className="btn btn-sm btn-primary ms-2"
  onClick={() => {
    setHistoryOrder(o);
    setShowHistoryModal(true);
  }}
>
  History
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

              {/* Modal Header */}
              <div className="modal-header">
                <h5>
                  Add Payment — {selectedOrder.id} {/* Added ID here */}
                </h5>
                <button className="btn-close" onClick={resetModal}></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">

                {/* ORDER INFO */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>User :</b> {selectedOrder.userName}<br />
                    <b>Phone :</b> {selectedOrder.phone}
                  </div>

                  <div className="col-md-6">
                    <b>Cost :</b> {selectedOrder.totalCost}<br />
                    <b>Remaining Balance :</b> {remainingBalance < 0 ? 0 : remainingBalance}
                  </div>
                </div>

                <hr />

                {/* PAYMENT INPUTS */}
                <div className="row g-3">

                  <div className="col-md-6">
                    <label>Cash</label>
                    <input
                      className="form-control"
                      placeholder="Enter cash"
                      value={cash}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setCash(val);
                      }}

                    />
                  </div>

                  <div className="col-md-6">
                    <label>Transfer</label>
                    <input
                      className="form-control"
                      placeholder="Enter transfer"
                      value={transfer}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setTransfer(val);
                      }}

                    />
                  </div>

                  <div className="col-md-6">
                    <label>Attach File (for Transfer)</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
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

{showHistoryModal && historyOrder && (

  <div className="modal d-block bg-dark bg-opacity-50">

    <div className="modal-dialog modal-lg modal-dialog-centered">

      <div className="modal-content">

        <div className="modal-header">
          <h5>Payment History — {historyOrder.id}</h5>
          <button
            className="btn-close"
            onClick={() => setShowHistoryModal(false)}
          />
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
                .filter(p => p.id === historyOrder.id)
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
                <td colSpan="3">
                  {historyOrder.amount}
                </td>
              </tr>

              <tr>
                <td colSpan="2">Remaining Balance</td>
                <td colSpan="3">
                  {historyOrder.balance}
                </td>
              </tr>

            </tfoot>

          </table>

        </div>

      </div>

    </div>

  </div>

)}

    </div>

  );
}
