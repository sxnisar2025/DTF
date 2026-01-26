import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Stock() {

  const { user } = useAuth();

  // ================= DEFAULT ITEMS =================

  const defaultItems = [
    "INK White",
    "INK COLOR",
    "POWDER",
    "DTF ROLL"
  ];

  // ================= STATE =================

  const [itemOptions, setItemOptions] = useState([]);
  const [newItem, setNewItem] = useState("");

  const [stockList, setStockList] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // ================= LOAD STORAGE =================

  useEffect(() => {

    const storedStock = JSON.parse(localStorage.getItem("stock")) || [];
    const storedItems =
      JSON.parse(localStorage.getItem("stockItems")) || defaultItems;

    setStockList(storedStock);
    setItemOptions(storedItems);

  }, []);

  // ================= SAVE ITEMS =================

  const saveItems = (items) => {
    setItemOptions(items);
    localStorage.setItem("stockItems", JSON.stringify(items));
  };

  // ================= ADD ITEM =================

  const addNewItem = () => {

    if (!newItem.trim()) return;

    if (itemOptions.includes(newItem)) {
      alert("Item already exists");
      return;
    }

    const updated = [...itemOptions, newItem];

    saveItems(updated);
    setNewItem("");
  };

  // ================= DELETE ITEM =================

  const deleteItem = (itemName) => {

    // Check if item already used in stock
    const used = stockList.some(s => s.item === itemName);

    if (used) {
      alert("Cannot delete item already used in stock records");
      return;
    }

    if (!window.confirm(`Delete "${itemName}" item?`)) return;

    const updated = itemOptions.filter(i => i !== itemName);

    saveItems(updated);

    // Reset dropdown if deleted selected item
    if (item === itemName) {
      setItem("");
    }
  };

  // ================= AUTO SR =================

  const generateSr = () => {

    if (stockList.length === 0) return 1;

    const max = Math.max(...stockList.map(s => s.sr));
    return max + 1;
  };

  // ================= SAVE STOCK =================

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
          ? { ...s, item, quantity: Number(quantity) }
          : s
      );

    } else {

      const newStock = {
        sr: generateSr(),
        date: new Date().toISOString().slice(0, 10),
        item,
        quantity: Number(quantity)
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

  // ================= DELETE STOCK =================

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

  // ================= TOTAL CALC =================

  const totals = useMemo(() => {

    const result = {};

    itemOptions.forEach(i => {
      result[i] = 0;
    });

    filteredStock.forEach(s => {
      if (result[s.item] !== undefined) {
        result[s.item] += Number(s.quantity);
      }
    });

    return result;

  }, [filteredStock, itemOptions]);

  // ================= UI =================

  return (

    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Stock Management
          </h2>

          {/* ===== ITEM MANAGEMENT ===== */}

          {user?.role === "admin" && (

            <div className="mb-5">

              {/* ADD ITEM */}

              <div className="flex gap-2 mb-3">

                <input
                  placeholder="Add New Item"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  className="border p-2 rounded flex-1"
                />

                <button
                  onClick={addNewItem}
                  className="bg-green-600 text-white px-4 rounded"
                >
                  Add Item
                </button>

              </div>

              {/* ITEM LIST */}

              <div className="border rounded p-3 bg-gray-50">

                <h3 className="font-semibold mb-2">Item List</h3>

                {itemOptions.map((i, idx) => (

                  <div
                    key={idx}
                    className="flex justify-between items-center mb-1"
                  >

                    <span>{i}</span>

                    <button
                      onClick={() => deleteItem(i)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* ===== STOCK FORM ===== */}

          {user?.role === "admin" && (

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
            >

              <select
                value={item}
                onChange={e => setItem(e.target.value)}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Item</option>

                {itemOptions.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}

              </select>

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="border p-2 rounded"
                required
              />

              <button className="bg-black text-white rounded px-4">
                {editId ? "Update" : "Add"}
              </button>

            </form>

          )}

          {/* ===== FILTER ===== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">

            <input
              placeholder="Search..."
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

          {/* ===== TABLE ===== */}

          <div className="overflow-x-auto">

            <table className="w-full border text-sm">

              <thead className="bg-gray-200">

                <tr>
                  <th className="border p-2">Sr</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Qty</th>

                  {user?.role === "admin" && (
                    <th className="border p-2">Action</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredStock.map(s => (

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

                ))}

              </tbody>

            </table>

          </div>

          {/* ===== TOTAL SUMMARY ===== */}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 text-center font-semibold">

            {itemOptions.map((i, idx) => (

              <div key={idx} className="bg-gray-100 p-3 rounded">
                {i}: {totals[i]}
              </div>

            ))}

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
