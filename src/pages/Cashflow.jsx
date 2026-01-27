import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Cashflow() {
  const { user } = useAuth();

  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [cashflow, setCashflow] = useState([]);
  const [actualAmount, setActualAmount] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");

  // ================= FORMAT MONEY =================
  const money = (n) => Number(n).toLocaleString();

  // ================= LOAD DATA =================
  useEffect(() => {
    const storedCashflow = JSON.parse(localStorage.getItem("cashflow")) || [];
    setCashflow(storedCashflow);

    const cash = JSON.parse(localStorage.getItem("totalCash")) || 0;
    setActualAmount(cash);
  }, []);

  // ================= LIVE CASH SYNC =================
  useEffect(() => {
    const syncCash = () => {
      const cash = JSON.parse(localStorage.getItem("totalCash")) || 0;
      setActualAmount(cash);
    };
    window.addEventListener("storage", syncCash);
    return () => window.removeEventListener("storage", syncCash);
  }, []);

  // ================= ADD PAYMENT =================
  const addPayment = () => {
    if (user?.role !== "admin") return;
    if (!paid) return alert("Enter amount");
    if (Number(paid) > actualAmount) return alert("Payment exceeds available cash");

    const newRow = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      month: new Date().getMonth() + 1,
      paid: Number(paid),
      note: note || "General Expense",
    };

    const updated = [...cashflow, newRow];
    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));

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

  // ================= FILTER =================
  const filtered = useMemo(() => {
    if (!monthFilter) return cashflow;
    return cashflow.filter((row) => row.month === Number(monthFilter));
  }, [cashflow, monthFilter]);

  // ================= TOTAL PAID =================
  const totalPaid = useMemo(() => {
    return filtered.reduce((sum, row) => sum + Number(row.paid), 0);
  }, [filtered]);

  // ================= BALANCE =================
  const balance = actualAmount - totalPaid;

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
                    placeholder="Payment Note (Rent / Salary / Ink etc)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col-md-auto">
                  <button onClick={addPayment} className="btn btn-dark w-100">
                    Submit Payment
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
                            <button
                              onClick={() => deletePayment(row.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= SUMMARY ================= */}
            <div className="mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Actual Cash (From Orders):</span>
                <span className="text-success">{money(actualAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Paid:</span>
                <span className="text-danger">{money(totalPaid)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Balance:</span>
                <span className={balance < 0 ? "text-danger" : "text-primary"}>
                  {money(balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
