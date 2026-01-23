import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Cashflow() {

  const { user } = useAuth();

  // ================= STATE =================

  const [cashflow, setCashflow] = useState([]);
  const [paid, setPaid] = useState("");

  const [editId, setEditId] = useState(null);

  const [monthFilter, setMonthFilter] = useState("");

  // ================= LOAD STORAGE =================

  useEffect(() => {

    const stored = JSON.parse(localStorage.getItem("cashflow")) || [];
    setCashflow(stored);

  }, []);

  // ================= SAVE =================

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!paid) {
      alert("Enter paid amount");
      return;
    }

    let updated;

    if (editId) {

      updated = cashflow.map(c =>
        c.id === editId
          ? { ...c, paid }
          : c
      );

    } else {

      const newPayment = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        paid: Number(paid)
      };

      updated = [...cashflow, newPayment];
    }

    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));

    resetForm();
  };

  // ================= RESET =================

  const resetForm = () => {

    setPaid("");
    setEditId(null);
  };

  // ================= EDIT =================

  const editPayment = (row) => {

    setPaid(row.paid);
    setEditId(row.id);
  };

  // ================= DELETE =================

  const deletePayment = (id) => {

    if (!window.confirm("Delete payment?")) return;

    const updated = cashflow.filter(c => c.id !== id);

    setCashflow(updated);
    localStorage.setItem("cashflow", JSON.stringify(updated));
  };

  // ================= FILTER =================

  const filteredCashflow = cashflow.filter(c => {

    if (!monthFilter) return true;

    const recordMonth = new Date(c.date).getMonth();

    return recordMonth === parseInt(monthFilter);
  });

  // ================= MONTH LIST =================

  const months = [...new Set(
    cashflow.map(c => new Date(c.date).getMonth())
  )];

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  // ================= TOTAL PAID =================

  const totalPaid = filteredCashflow.reduce(
    (sum, c) => sum + Number(c.paid), 0
  );

  // ================= ACTUAL AMOUNT (FROM LOCAL ORDER) =================

  const localOrders = JSON.parse(localStorage.getItem("localOrders")) || [];

  const actualAmount = localOrders.reduce(
    (sum, o) => sum + Number(o.cash || 0), 0
  );

  // ================= BALANCE =================

  const balance = totalPaid - actualAmount;

  // ================= UI =================

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

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
            >

              <input
                value={new Date().toLocaleDateString()}
                disabled
                className="border p-2 rounded bg-gray-100"
              />

              <input
                type="number"
                placeholder="Paid Amount"
                value={paid}
                onChange={e => setPaid(e.target.value)}
                className="border p-2 rounded"
                required
              />

              <button className="bg-black text-white rounded">
                {editId ? "Update" : "Submit"}
              </button>

            </form>

          )}

          {/* FILTER */}

          <div className="mb-4">

            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="border p-2 rounded"
            >

              <option value="">All Months</option>

              {months.map(m => (

                <option key={m} value={m}>
                  {monthNames[m]}
                </option>

              ))}

            </select>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full border text-sm">

              <thead className="bg-gray-200">

                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Paid</th>

                  {user?.role === "admin" && (
                    <th className="border p-2">Action</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredCashflow.length === 0 ? (

                  <tr>
                    <td
                      colSpan={user?.role === "admin" ? 3 : 2}
                      className="text-center p-4"
                    >
                      No records found
                    </td>
                  </tr>

                ) : (

                  filteredCashflow.map(c => (

                    <tr key={c.id}>

                      <td className="border p-2">{c.date}</td>
                      <td className="border p-2">Rs {c.paid}</td>

                      {user?.role === "admin" && (

                        <td className="border p-2 flex gap-2">

                          <button
                            onClick={() => editPayment(c)}
                            className="text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deletePayment(c.id)}
                            className="text-red-600"
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

          {/* FOOTER TOTALS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-semibold">

            

            <div>
              Actual Amount: Rs {actualAmount}
            </div>

            <div>
              Total Paid: Rs {totalPaid}
            </div>

            <div className={balance >= 0 ? "text-green-600" : "text-red-600"}>
              Balance: Rs {balance}
            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
