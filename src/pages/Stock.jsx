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

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editItemIndex, setEditItemIndex] = useState(null);

  const [stockList, setStockList] = useState([]);

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("IN");

  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  // ================= LOAD DATA =================

  useEffect(() => {

    const stock = JSON.parse(localStorage.getItem("stock")) || [];
    const storedItems =
      JSON.parse(localStorage.getItem("stockItems")) || defaultItems;

    setStockList(stock);
    setItems(storedItems);

  }, []);

  // ================= SAVE ITEMS =================

  const saveItems = (data) => {
    setItems(data);
    localStorage.setItem("stockItems", JSON.stringify(data));
  };

  // ================= ADD / EDIT ITEM =================

  const handleItemSave = () => {

    if (!newItem.trim()) return;

    if (editItemIndex !== null) {

      const updated = [...items];
      updated[editItemIndex] = newItem;

      saveItems(updated);

      setEditItemIndex(null);

    } else {

      if (items.includes(newItem)) {
        alert("Item already exists");
        return;
      }

      saveItems([...items, newItem]);
    }

    setNewItem("");
  };

  // ================= DELETE ITEM =================

  const deleteItem = (name) => {

    const used = stockList.some(s => s.item === name);

    if (used) {
      alert("Item already used in stock");
      return;
    }

    if (!window.confirm("Delete this item?")) return;

    saveItems(items.filter(i => i !== name));
  };

  // ================= AUTO SR =================

  const generateSr = () => {

    if (stockList.length === 0) return 1;

    return Math.max(...stockList.map(s => s.sr)) + 1;
  };

  // ================= SAVE STOCK =================

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!item || !quantity) {
      alert("Fill all fields");
      return;
    }

    const qty = Number(quantity);

    let updated;

    if (editId) {

      updated = stockList.map(s =>
        s.sr === editId
          ? { ...s, item, quantity: qty, type }
          : s
      );

    } else {

      updated = [...stockList, {
        sr: generateSr(),
        date: new Date().toISOString().slice(0, 10),
        item,
        quantity: qty,
        type
      }];
    }

    setStockList(updated);
    localStorage.setItem("stock", JSON.stringify(updated));

    resetForm();
  };

  // ================= RESET =================

  const resetForm = () => {

    setItem("");
    setQuantity("");
    setType("IN");
    setEditId(null);
  };

  // ================= EDIT STOCK =================

  const editStock = (data) => {

    setItem(data.item);
    setQuantity(data.quantity);
    setType(data.type);
    setEditId(data.sr);
  };

  // ================= DELETE STOCK =================

  const deleteStock = (id) => {

    if (!window.confirm("Delete this entry?")) return;

    const updated = stockList.filter(s => s.sr !== id);

    setStockList(updated);
    localStorage.setItem("stock", JSON.stringify(updated));
  };

  // ================= FILTER =================

  const filteredStock = stockList.filter(s =>
    s.item.toLowerCase().includes(search.toLowerCase())
  );

  // ================= REMAINING STOCK =================

  const remainingStock = useMemo(() => {

    const result = {};

    items.forEach(i => result[i] = 0);

    stockList.forEach(s => {

      if (!result[s.item] && result[s.item] !== 0) return;

      if (s.type === "IN") {
        result[s.item] += s.quantity;
      } else {
        result[s.item] -= s.quantity;
      }

    });

    return result;

  }, [stockList, items]);

  // ================= EXPORT CSV =================

  const exportExcel = () => {

    let csv = "SR,Date,Item,Quantity,Type\n";

    stockList.forEach(s => {
      csv += `${s.sr},${s.date},${s.item},${s.quantity},${s.type}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-report.csv";
    a.click();
  };

  // ================= PRINT =================

  const printReport = () => {
    window.print();
  };

  // ================= UI =================

  return (

    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Stock Management System
          </h2>

          {/* ===== ITEM MANAGER ===== */}

          {user?.role === "admin" && (

            <div className="mb-5">

              <div className="flex gap-2 mb-2">

                <input
                  placeholder="Item name"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  className="border p-2 rounded flex-1"
                />

                <button
                  onClick={handleItemSave}
                  className="bg-green-600 text-white px-4 rounded"
                >
                  {editItemIndex !== null ? "Update" : "Add"}
                </button>

              </div>

              {items.map((i, idx) => (

                <div key={idx} className="flex justify-between mb-1">

                  <span>{i}</span>

                  <div className="flex gap-2">

                    <button
                      onClick={() => {
                        setNewItem(i);
                        setEditItemIndex(idx);
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteItem(i)}
                      className="text-red-600"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* ===== STOCK FORM ===== */}

          {user?.role === "admin" && (

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-4 gap-2 mb-4"
            >

              <select
                value={item}
                onChange={e => setItem(e.target.value)}
                className="border p-2 rounded"
                required
              >

                <option value="">Select Item</option>

                {items.map((i, idx) => (
                  <option key={idx}>{i}</option>
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

              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="IN">Stock IN</option>
                <option value="OUT">Stock OUT</option>
              </select>

              <button className="bg-black text-white rounded">
                {editId ? "Update" : "Save"}
              </button>

            </form>

          )}

          {/* ===== EXPORT / PRINT ===== */}

          <div className="flex gap-3 mb-3">

            <button
              onClick={exportExcel}
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              Export Excel
            </button>

            <button
              onClick={printReport}
              className="bg-gray-700 text-white px-4 py-1 rounded"
            >
              Print
            </button>

          </div>

          {/* ===== SEARCH ===== */}

          <input
            placeholder="Search Item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded mb-3 w-full"
          />

          {/* ===== TABLE ===== */}

          <table className="w-full border text-sm">

            <thead className="bg-gray-200">

              <tr>
                <th className="border p-2">SR</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Item</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Type</th>

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
                  <td className="border p-2">{s.type}</td>

                  {user?.role === "admin" && (

                    <td className="border p-2">

                      <button
                        onClick={() => editStock(s)}
                        className="text-blue-600 mr-2"
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

          {/* ===== REMAINING STOCK ===== */}

          <div className="grid md:grid-cols-4 gap-3 mt-5">

            {items.map((i, idx) => (

              <div key={idx} className="bg-gray-100 p-3 rounded text-center">

                <strong>{i}</strong>
                <div>Remaining: {remainingStock[i]}</div>

              </div>

            ))}

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
