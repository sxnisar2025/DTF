import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Stock() {

  const { user } = useAuth();

  // ================= STATE =================

  const [stockList, setStockList] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // ================= LOAD STORAGE =================

  useEffect(() => {

    const stored = JSON.parse(localStorage.getItem("stock")) || [];
    setStockList(stored);

  }, []);

  // ================= AUTO SR =================

  const generateSr = () => {

    if (stockList.length === 0) return 1;

    const max = Math.max(...stockList.map(s => s.sr));

    return max + 1;
  };

  // ================= SAVE =================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!item || !quantity) {
      alert("Fill all fields");
      return;
    }

    let updated;

    if (editId) {

      updated = stockList.map(s =>
        s.sr === editId
          ? { ...s, item, quantity }
          : s
      );

    } else {

      const newStock = {
        sr: generateSr(),
        date: new Date().toLocaleDateString(),
        item,
        quantity
      };

      updated = [...stockList, newStock];
    }

    setStockList(updated);
    localStorage.setItem("stock", JSON.stringify(updated));

    resetForm();
  };

  // ================= RESET =================

  const resetForm = () => {

    setItem("");
    setQuantity("");
    setEditId(null);
  };

  // ================= EDIT =================

  const editStock = (data) => {

    setItem(data.item);
    setQuantity(data.quantity);
    setEditId(data.sr);
  };

  // ================= DELETE =================

  const deleteStock = (id) => {

    if (!window.confirm("Delete this stock item?")) return;

    const updated = stockList.filter(s => s.sr !== id);

    setStockList(updated);
    localStorage.setItem("stock", JSON.stringify(updated));
  };

  // ================= FILTER =================

  const filteredStock = stockList.filter(s => {

    const query = search.toLowerCase();

    const searchMatch =
      s.item.toLowerCase().includes(query) ||
      s.quantity.toString().includes(query);

    const monthMatch = monthFilter
      ? new Date(s.date).getMonth() === parseInt(monthFilter)
      : true;

    return searchMatch && monthMatch;
  });

  // ================= MONTH LIST =================

  const months = [...new Set(
    stockList.map(s => new Date(s.date).getMonth())
  )];

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  // ================= UI =================

  return (

    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        <div className="bg-white p-6 rounded shadow">

          {/* HEADER */}

          <h2 className="text-xl font-bold mb-4">
            Stock Management
          </h2>

          {/* FORM */}

          {user?.role === "admin" && (

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
            >

              <input
                placeholder="Item Name"
                value={item}
                onChange={e => setItem(e.target.value)}
                className="border p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="border p-2 rounded"
                required
              />

              <button
                className="bg-black text-white rounded px-4"
              >
                {editId ? "Update" : "Add"}
              </button>

            </form>

          )}

          {/* FILTER BAR */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">

            <input
              placeholder="Search item or quantity..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border p-2 rounded"
            />

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
                  <th className="border p-2">Sr No</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Quantity</th>

                  {user?.role === "admin" && (
                    <th className="border p-2">Action</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredStock.length === 0 ? (

                  <tr>
                    <td
                      colSpan={user?.role === "admin" ? 5 : 4}
                      className="text-center p-4"
                    >
                      No stock found
                    </td>
                  </tr>

                ) : (

                  filteredStock.map(s => (

                    <tr key={s.sr}>

                      <td className="border p-2">{s.sr}</td>
                      <td className="border p-2">{s.date}</td>
                      <td className="border p-2">{s.item}</td>
                      <td className="border p-2">{s.quantity}</td>

                      {user?.role === "admin" && (

                        <td className="border p-2 flex gap-2">

                          <button
                            onClick={() => editStock(s)}
                            className="text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteStock(s.sr)}
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

        </div>

      </main>

      <Footer />

    </div>
  );
}
