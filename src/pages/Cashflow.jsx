import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import CashflowSummary from "../components/CashflowSummary";
import CashflowForm from "../components/CashflowForm";

export default function Cashflow() {

  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [cashflow, setCashflow] = useState([]);

  const [submitAmount, setSubmitAmount] = useState("");
  const [note, setNote] = useState("");

  const [editId, setEditId] = useState(null);
  const [monthFilter, setMonthFilter] = useState("");

  // ================= LOAD DATA =================

  useEffect(() => {

    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    const storedCashflow = JSON.parse(localStorage.getItem("cashflow")) || [];

    setPayments(storedPayments);
    setCashflow(storedCashflow);

  }, []);

  // ================= FILTER BY MONTH =================

  const filteredCashflow = useMemo(() => {

  if (!monthFilter) return cashflow;

  return cashflow.filter(row => {

    const recordMonth =
      row.month ||
      new Date(row.date).getMonth() + 1;

    return Number(recordMonth) === Number(monthFilter);

  });

}, [cashflow, monthFilter]);


  // ================= CALCULATIONS =================

  const totalCashReceived = useMemo(() => {

    return payments.reduce((sum, p) => sum + Number(p.cash || 0), 0);

  }, [payments]);

  const totalSubmitted = useMemo(() => {

    return filteredCashflow.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  }, [filteredCashflow]);

  const balanceInHand = totalCashReceived - totalSubmitted;

  // ================= SAVE (ADD / EDIT) =================

  const handleSubmit = () => {

    if (user?.role !== "admin") return;

    if (!submitAmount) return alert("Enter submit amount");

    if (Number(submitAmount) > balanceInHand && !editId) {
      return alert("Submit amount exceeds available cash");
    }

    const now = new Date();

    if (editId) {

      const updated = cashflow.map(row =>
        row.id === editId
          ? { ...row, amount: Number(submitAmount), note }
          : row
      );

      setCashflow(updated);
      localStorage.setItem("cashflow", JSON.stringify(updated));

      setEditId(null);

    } else {

      const payload = {
  id: Date.now(),
  date: now.toISOString().slice(0, 10),
  month: now.getMonth() + 1,
  amount: Number(submitAmount),
  note: note || "Cash Submitted"
};


      const updated = [...cashflow, payload];

      setCashflow(updated);
      localStorage.setItem("cashflow", JSON.stringify(updated));

    }

    setSubmitAmount("");
    setNote("");
  };

  // ================= EDIT =================

  const handleEdit = (row) => {

    if (user?.role !== "admin") return;

    setSubmitAmount(row.amount);
    setNote(row.note);
    setEditId(row.id);

  };

  // ================= DELETE =================

  const handleDelete = (id) => {

    if (user?.role !== "admin") return;

    if (!window.confirm("Delete this entry?")) return;

    const updated = cashflow.filter(row => row.id !== id);

    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));

  };

  // ================= UI =================

  return (

    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="container p-4 flex-fill">

        <div className="card shadow p-4">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="fw-bold">Cashflow (Worker → Admin)</h4>

            {/* MONTH DROPDOWN */}

            <select
              className="form-select w-auto"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
            >
              <option value="">All Months</option>

              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}

            </select>

          </div>

          {/* SUMMARY */}

      <CashflowSummary
  totalCashReceived={totalCashReceived}
  totalSubmitted={totalSubmitted}
  balanceInHand={balanceInHand}
/>

          {/* ADMIN FORM */}

         <CashflowForm
  user={user}
  submitAmount={submitAmount}
  setSubmitAmount={setSubmitAmount}
  note={note}
  setNote={setNote}
  handleSubmit={handleSubmit}
  editId={editId}
/>

          {/* TABLE */}

          <div className="table-responsive">

            <table className="table table-bordered">

              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Note</th>
                  {user?.role === "admin" && <th>Action</th>}
                </tr>
              </thead>

              <tbody>

                {filteredCashflow.length === 0 ? (

                  <tr>
                    <td
                      colSpan={user?.role === "admin" ? 4 : 3}
                      className="text-center py-3"
                    >
                      No Records Found
                    </td>
                  </tr>

                ) : (

                  filteredCashflow.map(row => (

                    <tr key={row.id}>

                      <td>{row.date}</td>
                      <td>{row.amount}</td>
                      <td>{row.note}</td>

                      {user?.role === "admin" && (

                        <td>

                          <button
                            onClick={() => handleEdit(row)}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(row.id)}
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

        </div>

      </main>

      <Footer />

    </div>

  );

}
