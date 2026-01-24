import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Cashflow() {

  const { user } = useAuth();

  const [paid, setPaid] = useState("");
  const [cashflow, setCashflow] = useState([]);
  const [actualAmount, setActualAmount] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");

  // ================= LOAD =================

  useEffect(() => {

    const storedCashflow =
      JSON.parse(localStorage.getItem("cashflow")) || [];

    setCashflow(storedCashflow);

    const cash =
      JSON.parse(localStorage.getItem("totalCash")) || 0;

    setActualAmount(cash);

  }, []);

  // ================= SAVE =================

  const addPayment = () => {

    if (!paid) return alert("Enter amount");

    const newRow = {
      date: new Date().toISOString().slice(0, 10),
      paid: Number(paid)
    };

    const updated = [...cashflow, newRow];

    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));

    setPaid("");
  };

  // ================= FILTER =================

  const filtered = useMemo(() => {

    if (!monthFilter) return cashflow;

    return cashflow.filter(row => {
      const m = new Date(row.date).getMonth() + 1;
      return Number(monthFilter) === m;
    });

  }, [cashflow, monthFilter]);

  // ================= TOTAL PAID =================

  const totalPaid = useMemo(() => {

    return filtered.reduce(
      (sum, row) => sum + Number(row.paid),
      0
    );

  }, [filtered]);

  // ================= BALANCE =================

  const balance = actualAmount - totalPaid;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Cashflow
          </h2>

          {/* ADMIN INPUT */}

          {user?.role === "admin" && (

            <div className="flex gap-2 mb-4">

              <input
                type="number"
                placeholder="Paid Amount"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                className="border p-2"
              />

              <button
                onClick={addPayment}
                className="bg-black text-white px-4"
              >
                Submit
              </button>

            </div>

          )}

          {/* FILTER */}

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border p-2 mb-3"
          >
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          {/* TABLE */}

          <table className="w-full border">

            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Paid</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((row, i) => (

                <tr key={i}>
                  <td className="border p-2">{row.date}</td>
                  <td className="border p-2">{row.paid}</td>
                </tr>

              ))}

            </tbody>

          </table>

          {/* FOOTER */}

          <div className="mt-4 font-semibold space-y-1">

            <div>
              Actual Amount (Cash from Orders): {actualAmount}
            </div>

            <div>
              Total Paid: {totalPaid}
            </div>

            <div>
              Balance: {balance}
            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
