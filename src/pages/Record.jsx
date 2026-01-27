import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Record() {
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toLocaleDateString(),
    customer: "",
    size: "",
    rate: "",
    cost: 0,
    cash: "",
    transfer: "",
    balance: 0,
    amount: 0,
    file: null,
  });

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Load stored data
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("records")) || [];
    setRows(stored);
  }, []);

  // Calculate cost, balance, and amount
  useEffect(() => {
    const size = Number(form.size || 0);
    const rate = Number(form.rate || 0);
    const cash = Number(form.cash || 0);
    const transfer = Number(form.transfer || 0);
    const cost = size * rate;
    const totalPaid = cash + transfer;
    setForm((prev) => ({ ...prev, cost, balance: cost - totalPaid, amount: totalPaid }));
  }, [form.size, form.rate, form.cash, form.transfer]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchMatch =
        row.customer?.toLowerCase().includes(search.toLowerCase()) ||
        row.date?.includes(search);

      const customerMatch = !customerFilter || row.customer === customerFilter;

      let paymentMatch = true;
      if (paymentFilter === "cash") paymentMatch = Number(row.cash) > 0;
      if (paymentFilter === "transfer") paymentMatch = Number(row.transfer) > 0;
      if (paymentFilter === "balance") paymentMatch = Number(row.balance) > 0;

      let monthMatch = true;
      if (monthFilter) {
        const m = new Date(row.date).getMonth() + 1;
        monthMatch = Number(monthFilter) === m;
      }

      let dateMatch = true;
      const rowDate = new Date(row.date);
      if (fromDate) dateMatch = rowDate >= new Date(fromDate);
      if (toDate) dateMatch = dateMatch && rowDate <= new Date(toDate);

      return searchMatch && customerMatch && paymentMatch && monthMatch && dateMatch;
    });
  }, [rows, search, customerFilter, paymentFilter, monthFilter, fromDate, toDate]);

  const totalAmount = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [filteredRows]);
  const totalCash = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.cash || 0), 0), [filteredRows]);

  // Export functions
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Local Orders");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "local-orders.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv]), "local-orders.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Local Order Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["#", "Date", "Customer", "Size", "Rate", "Cost", "Cash", "Transfer", "Balance", "Amount"]],
      body: filteredRows.map((r, i) => [i + 1, r.date, r.customer, r.size, r.rate, r.total, r.cash, r.transfer, r.balance, r.amount]),
    });
    doc.save("local-orders.pdf");
  };

  const printTable = () => window.print();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updated;
    const newData = {
      id: editIndex !== null ? rows[editIndex].id : Date.now(),
      ...form,
    };
    if (editIndex !== null) {
      updated = [...rows];
      updated[editIndex] = newData;
      setEditIndex(null);
    } else {
      updated = [...rows, newData];
    }
    setRows(updated);
    localStorage.setItem("records", JSON.stringify(updated));
    setShowModal(false);
    setForm({
      date: new Date().toLocaleDateString(),
      customer: "",
      size: "",
      rate: "",
      cost: 0,
      cash: "",
      transfer: "",
      balance: 0,
      amount: 0,
      file: null,
    });
  };

  const handleEdit = (i) => {
    setEditIndex(i);
    setForm(rows[i]);
    setShowModal(true);
  };

  const handleDelete = (i) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const updated = rows.filter((_, index) => index !== i);
    setRows(updated);
    localStorage.setItem("records", JSON.stringify(updated));
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container-fluid flex-fill p-4">
        <div className="card p-4 shadow">
          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
            <h3 className="fw-bold">Local Order</h3>
            <div className="d-flex flex-wrap gap-2">
              <button onClick={exportExcel} className="btn btn-outline-secondary btn-sm">Excel</button>
              <button onClick={exportCSV} className="btn btn-outline-secondary btn-sm">CSV</button>
              <button onClick={exportPDF} className="btn btn-outline-secondary btn-sm">PDF</button>
              <button onClick={printTable} className="btn btn-outline-secondary btn-sm">Print</button>
              <button onClick={() => setShowModal(true)} className="btn btn-dark">+ Add Data</button>
            </div>
          </div>

          {/* Filters */}
          <div className="row g-2 mb-3">
            <div className="col-md">
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" />
            </div>
            <div className="col-md">
              <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="form-select">
                <option value="">All Customers</option>
                <option value="Zain">Zain</option>
                <option value="Noman">Noman</option>
                <option value="Irfan">Irfan</option>
              </select>
            </div>
            <div className="col-md">
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="form-select">
                <option value="">All Payments</option>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="balance">Balance Due</option>
              </select>
            </div>
            <div className="col-md">
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="form-select">
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <div className="col-md">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-control" />
            </div>
            <div className="col-md">
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-control" />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle">
              <thead className="table-light">
                <tr>
                  {["#", "Date", "Customer", "Size", "Rate", "Cost", "Cash", "Transfer", "Balance", "Amount", "Action"].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4">No data found</td>
                  </tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.date}</td>
                      <td>{r.customer}</td>
                      <td>{r.size}</td>
                      <td>{r.rate}</td>
                      <td>{r.total}</td>
                      <td>{r.cash}</td>
                      <td>{r.transfer}</td>
                      <td>{r.balance}</td>
                      <td className="fw-bold">{r.amount}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => handleEdit(i)} className="btn btn-link p-0 text-primary">Edit</button>
                          <button onClick={() => handleDelete(i)} className="btn btn-link p-0 text-danger">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="9" className="text-end">Total Cash Received</td>
                  <td>{totalCash}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="9" className="text-end">Total Amount</td>
                  <td>{totalAmount}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">{editIndex !== null ? "Edit Record" : "Add Record"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditIndex(null); setForm({ date: new Date().toLocaleDateString(), customer: "", size: "", rate: "", cost: 0, cash: "", transfer: "", balance: 0, amount: 0, file: null }); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Date</label>
                      <input type="text" className="form-control" value={form.date} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label>Customer</label>
                      <select className="form-select" name="customer" value={form.customer} onChange={handleChange} required>
                        <option value="">Select Customer</option>
                        <option value="Zain">Zain</option>
                        <option value="Noman">Noman</option>
                        <option value="Irfan">Irfan</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Material Size</label>
                      <input type="number" className="form-control" name="size" value={form.size} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Rate</label>
                      <input type="number" className="form-control" name="rate" value={form.rate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Cost</label>
                      <input type="number" className="form-control" value={form.cost} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label>Cash Received</label>
                      <input type="number" className="form-control" name="cash" value={form.cash} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label>Transfer</label>
                      <input type="number" className="form-control" name="transfer" value={form.transfer} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label>Attached File</label>
                      <input type="file" className="form-control" name="file" onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label>Balance</label>
                      <input type="number" className="form-control" value={form.balance} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label>Amount</label>
                      <input type="number" className="form-control" value={form.amount} readOnly />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditIndex(null); setForm({ date: new Date().toLocaleDateString(), customer: "", size: "", rate: "", cost: 0, cash: "", transfer: "", balance: 0, amount: 0, file: null }); }}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editIndex !== null ? "Update" : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
