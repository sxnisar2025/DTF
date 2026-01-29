import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Cashflow() {
  const { user } = useAuth();

  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [cashflow, setCashflow] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null); // For edit mode

  // ================= FORMAT MONEY =================
  const money = (n) => Number(n).toLocaleString();

  // ================= LOAD DATA =================
  useEffect(() => {
    const storedCashflow = JSON.parse(localStorage.getItem("cashflow")) || [];
    setCashflow(storedCashflow);

    const storedRecords = JSON.parse(localStorage.getItem("records")) || [];
    setRecords(storedRecords);
  }, []);

  // ================= ADD / EDIT PAYMENT =================
  const handleSave = () => {
    if (user?.role !== "admin") return;
    if (!paid) return alert("Enter amount");

    const totalCash = records.reduce((sum, r) => sum + Number(r.cash || 0), 0);
    if (Number(paid) > totalCash) return alert("Payment exceeds available cash");

    if (editId) {
      // Edit existing
      const updated = cashflow.map((p) =>
        p.id === editId ? { ...p, paid: Number(paid), note: note || "Owais Clear Amount" } : p
      );
      setCashflow(updated);
      localStorage.setItem("cashflow", JSON.stringify(updated));
      setEditId(null);
    } else {
      // Add new
      const newRow = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        month: new Date().getMonth() + 1,
        paid: Number(paid),
        note: note || "Owais Clear Amount",
      };
      const updated = [...cashflow, newRow];
      setCashflow(updated);
      localStorage.setItem("cashflow", JSON.stringify(updated));
    }

    setPaid("");
    setNote("");
  };

  // ================= DELETE PAYMENT =================
  const deletePayment = (id) => {
    if (user?.role !== "admin") return;
    if (!window.confirm("Delete this payment?")) return;

    const updated = cashflow.filter((p) => p.id !== id);
    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));
  };

  // ================= EDIT PAYMENT =================
  const editPayment = (row) => {
    setPaid(row.paid);
    setNote(row.note);
    setEditId(row.id);
  };

  // ================= FILTER =================
  const filtered = useMemo(() => {
    if (!monthFilter) return cashflow;
    return cashflow.filter((row) => row.month === Number(monthFilter));
  }, [cashflow, monthFilter]);

  // ================= TOTALS =================
  const totalCashAmount = useMemo(() => records.reduce((sum, r) => sum + Number(r.cash || 0), 0), [records]);
  const totalPaidAmount = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.paid), 0), [filtered]);
  const totalBalanceAmount = totalCashAmount - totalPaidAmount;

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="flex-fill container-fluid py-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-4">Cashflow Management</h2>

            {/* ================= ADMIN INPUT ================= */}
            {user?.role === "admin" && (
              <div className="row g-2 mb-3">
                <div className="col-md">
                  <input
                    type="number"
                    placeholder="Paid Amount"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col-md">
                  <input
                    placeholder="Payment Note "
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col-md-auto">
                  <button onClick={handleSave} className="btn btn-dark w-100">
                    {editId ? "Update Payment" : "Submit Payment"}
                  </button>
                </div>
              </div>
            )}

            {/* ================= FILTER ================= */}
            <div className="mb-3">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="form-select w-auto"
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= SUMMARY CARDS ================= */}
            <div className="row g-3 mb-4 text-center">
              <div className="col-md">
                <div className="card bg-primary text-white p-3">
                  Total Cash Amount<br />
                  <strong>{money(totalCashAmount)}</strong>
                </div>
              </div>
              <div className="col-md">
                <div className="card bg-success text-white p-3">
                  Total Paid Amount<br />
                  <strong>{money(totalPaidAmount)}</strong>
                </div>
              </div>
              <div className="col-md">
                <div className="card bg-danger text-white p-3">
                  Total Balance Amount<br />
                  <strong>{money(totalBalanceAmount)}</strong>
                </div>
              </div>
            </div>

            {/* ================= TABLE ================= */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Note</th>
                    {user?.role === "admin" && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={user?.role === "admin" ? 4 : 3} className="text-center py-4">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td className="text-success">{money(row.paid)}</td>
                        <td>{row.note}</td>
                        {user?.role === "admin" && (
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => editPayment(row)}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePayment(row.id)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
