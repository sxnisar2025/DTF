import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PaymentSummary from "../components/PaymentSummary";
import PaymentModal from "../components/PaymentModal";
import PaymentFilters from "../components/PaymentFilters"
import PaymentHistoryModal from "../components/PaymentHistoryModal";


export default function Payment() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cash, setCash] = useState("");
  const [transfer, setTransfer] = useState("");
  const [file, setFile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyOrder, setHistoryOrder] = useState(null);

  // ================= Load Orders & Payments =================
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setOrders(storedOrders);
    setPayments(storedPayments);
  }, []);

  // ================= Calculate merged data =================
  const mergedData = useMemo(() => {
    return orders.map(order => {
      const orderPayments = payments.filter(p => p.orderId === order.id);
      const cashVal = orderPayments.reduce((s, p) => s + Number(p.cash || 0), 0);
      const transferVal = orderPayments.reduce((s, p) => s + Number(p.transfer || 0), 0);
      const totalPaid = cashVal + transferVal;
      const balance = Number(order.totalCost) - totalPaid;

      let status = "Pending";
      if (totalPaid > 0 && totalPaid < order.totalCost) status = "InProgress";
      else if (totalPaid >= order.totalCost) status = "Completed";

      return {
        ...order,
        paymentDate: orderPayments[orderPayments.length - 1]?.date || "",
        file: orderPayments[orderPayments.length - 1]?.file || "",
        cash: cashVal,
        transfer: transferVal,
        amount: totalPaid,
        balance: balance < 0 ? 0 : balance,
        status
      };
    });
  }, [orders, payments]);

  // ================= Filter =================
  const filteredData = useMemo(() => {
    return mergedData.filter(o => {
      const searchMatch =
        o.userName.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.id.includes(search);

      const statusMatch =
        !statusFilter || (statusFilter === "Completed" ? o.balance === 0 : o.balance > 0);

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

  // ================= Summaries =================
  const totalCost = filteredData.reduce((s, o) => s + Number(o.totalCost), 0);
  const totalCash = filteredData.reduce((s, o) => s + Number(o.cash), 0);
  const totalTransfer = filteredData.reduce((s, o) => s + Number(o.transfer), 0);
  const totalAmount = filteredData.reduce((s, o) => s + Number(o.amount), 0);
  const totalBalance = filteredData.reduce((s, o) => s + Number(o.balance), 0);

  const paidNow = useMemo(() => Number(cash || 0) + Number(transfer || 0), [cash, transfer]);

  // ================= Save Payment =================
  const handleSavePayment = () => {
    if (!selectedOrder) return;
    const totalPaidNow = Number(cash || 0) + Number(transfer || 0);
    if (totalPaidNow <= 0) {
      alert("Enter payment amount");
      return;
    }

    const newPayment = {
      orderId: selectedOrder.id,
      cash: Number(cash),
      transfer: Number(transfer),
      file: file ? file.name : "",
      date: new Date().toLocaleString()
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));

    // Update order's balance and status
    const orderPayments = updatedPayments.filter(p => p.orderId === selectedOrder.id);
    const totalPaid = orderPayments.reduce((sum, p) => sum + Number(p.cash) + Number(p.transfer), 0);

    const updatedOrders = orders.map(o => {
      if (o.id !== selectedOrder.id) return o;
      const remaining = Number(o.totalCost) - totalPaid;
      return {
        ...o,
        paidAmount: totalPaid,
        balance: remaining < 0 ? 0 : remaining,
        status: remaining <= 0 ? "Completed" : "InProgress",
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
    setPaymentMethod("");
    setShowModal(false);
  };

  // ================= Export =================
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
      head: [["ID", "User", "Phone", "Cost", "Cash", "Transfer", "Balance"]],
      body: filteredData.map(o => [
        o.id, o.userName, o.phone, o.totalCost, o.cash, o.transfer, o.balance
      ])
    });
    doc.save("payment-record.pdf");
  };

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="container-fluid p-4 flex-fill">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Payment Management</h3>
          <div>
            <button onClick={exportExcel} className="btn btn-success btn-sm me-2">Excel</button>
            <button onClick={exportPDF} className="btn btn-danger btn-sm">PDF</button>
          </div>
        </div>

        {/* SUMMARY */}
      <PaymentSummary
  totalCost={totalCost}
  totalCash={totalCash}
  totalTransfer={totalTransfer}
  totalBalance={totalBalance}
  totalAmount={totalAmount}
/>

        {/* SEARCH & FILTER */}
     <PaymentFilters
  search={search}
  setSearch={setSearch}
  typeFilter={typeFilter}
  setTypeFilter={setTypeFilter}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
  monthFilter={monthFilter}
  setMonthFilter={setMonthFilter}
  dateFilter={dateFilter}
  setDateFilter={setDateFilter}
/>


        {/* TABLE */}
        <div className="card shadow p-3">
          <h5 className="fw-bold mb-3">Payment Record</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Sr</th><th>ID</th><th>Date</th><th>User</th><th>Phone</th><th>Description</th>
                  <th>Cost</th><th>Cash</th><th>Transfer</th><th>Balance</th><th>Status</th><th>Amount</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((o,i)=>(
                  <tr key={i} className={o.balance===0?"table-success":""}>
                    <td>{i+1}</td><td>{o.id}</td><td>{o.paymentDate || o.dateTime}</td>
                    <td>{o.userName}</td><td>{o.phone}</td><td>{o.Description}</td>
                    <td>{o.totalCost}</td><td>{o.cash}</td><td>{o.transfer}</td>
                    <td>{o.balance}</td>
                    <td><span className={`badge ${o.status==="Completed"?"bg-success":o.status==="Pending"?"bg-secondary text-white":"bg-warning text-dark"}`}>{o.status}</span></td>
                    <td>{o.amount}</td>
                    <td>
                      <button disabled={o.balance===0} className="btn btn-sm btn-success" onClick={()=>{
                        setSelectedOrder(o); setCash(""); setTransfer(""); setFile(null); setPaymentMethod(""); setShowModal(true);
                      }}>{o.balance===0?"Paid":"Add Payment"}</button>
                      <button className="btn btn-sm btn-dark ms-2" onClick={()=>{
                        setHistoryOrder(o); setShowHistoryModal(true);
                      }}>History</button>
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
      <PaymentModal
  showModal={showModal}
  selectedOrder={selectedOrder}
  paymentMethod={paymentMethod}
  setPaymentMethod={setPaymentMethod}
  cash={cash}
  setCash={setCash}
  transfer={transfer}
  setTransfer={setTransfer}
  setFile={setFile}
  resetModal={resetModal}
  handleSavePayment={handleSavePayment}
/>

      {/* ================= History Modal ================= */}
   

<PaymentHistoryModal
  showHistoryModal={showHistoryModal}
  historyOrder={historyOrder}
  payments={payments}
  setShowHistoryModal={setShowHistoryModal}
/>

    </div>
  );
}
