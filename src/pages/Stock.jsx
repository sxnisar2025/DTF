import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Stock() {

  const { user } = useAuth();

  const defaultItems = [
    "INK White",
    "INK COLOR",
    "POWDER",
    "DTF ROLL"
  ];

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editItemIndex, setEditItemIndex] = useState(null);

  const [stockList, setStockList] = useState([]);

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("IN");

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {

    const stock = JSON.parse(localStorage.getItem("stock")) || [];
    const storedItems =
      JSON.parse(localStorage.getItem("stockItems")) || defaultItems;

    setStockList(stock);
    setItems(storedItems);

  }, []);

  const saveItems = (data) => {
    setItems(data);
    localStorage.setItem("stockItems", JSON.stringify(data));
  };

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

  const deleteItem = (name) => {

    const used = stockList.some(s => s.item === name);

    if (used) {
      alert("Item already used in stock");
      return;
    }

    if (!window.confirm("Delete this item?")) return;

    saveItems(items.filter(i => i !== name));
  };

  const generateSr = () => {

    if (stockList.length === 0) return 1;

    return Math.max(...stockList.map(s => s.sr)) + 1;
  };

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

  const resetForm = () => {

    setItem("");
    setQuantity("");
    setType("IN");
    setEditId(null);
  };

  const editStock = (data) => {

    setItem(data.item);
    setQuantity(data.quantity);
    setType(data.type);
    setEditId(data.sr);
  };

  const deleteStock = (id) => {

    if (!window.confirm("Delete this entry?")) return;

    const updated = stockList.filter(s => s.sr !== id);

    setStockList(updated);
    localStorage.setItem("stock", JSON.stringify(updated));
  };

  const filteredStock = stockList.filter(s =>
    s.item.toLowerCase().includes(search.toLowerCase())
  );

  const remainingStock = useMemo(() => {

    const result = {};
    items.forEach(i => result[i] = 0);

    stockList.forEach(s => {

      if (!result[s.item] && result[s.item] !== 0) return;

      if (s.type === "IN") result[s.item] += s.quantity;
      else result[s.item] -= s.quantity;

    });

    return result;

  }, [stockList, items]);

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

  const printReport = () => window.print();

  return (

    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="container-fluid flex-fill p-4">

        <div className="card p-4 shadow">

          <h4 className="fw-bold mb-3">
            Stock Management System
          </h4>

          {/* ITEM MANAGER */}

          {user?.role === "admin" && (

            <div className="mb-4">

              <div className="d-flex gap-2 mb-2">

                <input
                  placeholder="Item name"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  className="form-control"
                />

                <button
                  onClick={handleItemSave}
                  className="btn btn-success"
                >
                  {editItemIndex !== null ? "Update" : "Add"}
                </button>

              </div>

              {items.map((i, idx) => (

                <div key={idx} className="d-flex justify-content-between mb-1">

                  <span>{i}</span>

                  <div className="d-flex gap-2">

                    <button
                      onClick={() => {
                        setNewItem(i);
                        setEditItemIndex(idx);
                      }}
                      className="btn btn-link p-0 text-primary"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteItem(i)}
                      className="btn btn-link p-0 text-danger"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* STOCK FORM */}

          {user?.role === "admin" && (

            <form
              onSubmit={handleSubmit}
              className="row g-2 mb-4"
            >

              <div className="col-md-3">
                <select
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select Item</option>
                  {items.map((i, idx) => (
                    <option key={idx}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-3">
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="form-select"
                >
                  <option value="IN">Stock IN</option>
                  <option value="OUT">Stock OUT</option>
                </select>
              </div>

              <div className="col-md-3">
                <button className="btn btn-dark w-100">
                  {editId ? "Update" : "Save"}
                </button>
              </div>

            </form>

          )}

          {/* EXPORT / PRINT */}

          <div className="d-flex gap-2 mb-3">

            <button
              onClick={exportExcel}
              className="btn btn-primary btn-sm"
            >
              Export Excel
            </button>

            <button
              onClick={printReport}
              className="btn btn-secondary btn-sm"
            >
              Print
            </button>

          </div>

          {/* SEARCH */}

          <input
            placeholder="Search Item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control mb-3"
          />

          {/* TABLE */}

          <div className="table-responsive">

            <table className="table table-bordered table-sm align-middle">

              <thead className="table-light">

                <tr>
                  <th>SR</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Type</th>

                  {user?.role === "admin" && (
                    <th>Action</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredStock.map(s => (

                  <tr key={s.sr}>

                    <td>{s.sr}</td>
                    <td>{s.date}</td>
                    <td>{s.item}</td>
                    <td>{s.quantity}</td>
                    <td>{s.type}</td>

                    {user?.role === "admin" && (

                      <td>

                        <button
                          onClick={() => editStock(s)}
                          className="btn btn-link p-0 text-primary me-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteStock(s.sr)}
                          className="btn btn-link p-0 text-danger"
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

          {/* REMAINING STOCK */}

          <div className="row g-3 mt-3">

            {items.map((i, idx) => (

              <div key={idx} className="col-md-3">

                <div className="card text-center p-3 bg-light">

                  <strong>{i}</strong>
                  <div>Remaining: {remainingStock[i]}</div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
