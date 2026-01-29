import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Order() {

  // ================= STATES =================

  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: "",
    dateTime: "",
    userName: "",
    phone: "",
    city: "",
    address: "",
    orderType: "Local",
    itemSize: "",
    itemRate: "",
    totalCost: 0,
  });

  // ================= LOAD DATA =================

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(stored);
  }, []);

  // ================= AUTO COST =================

  useEffect(() => {
    const size = Number(form.itemSize || 0);
    const rate = Number(form.itemRate || 0);
    setForm((prev) => ({
      ...prev,
      totalCost: size * rate
    }));
  }, [form.itemSize, form.itemRate]);

  // ================= GENERATE ORDER ID =================

  const generateOrderId = () => {
    const next = orders.length + 1;
    return `DTF-${String(next).padStart(2, "0")}`;
  };

  // ================= FILTER =================

  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.id.includes(search)
    );
  }, [orders, search]);

  // ================= SUMMARY CARDS =================

  const totalOrders = filteredOrders.length;

  const totalItemSize = useMemo(() =>
    filteredOrders.reduce((sum, o) => sum + Number(o.itemSize || 0), 0)
    , [filteredOrders]);

  const totalItemCost = useMemo(() =>
    filteredOrders.reduce((sum, o) => sum + Number(o.totalCost || 0), 0)
    , [filteredOrders]);

  // ================= FORM HANDLER =================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================= SAVE ORDER =================

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.userName || !form.phone || !form.itemSize || !form.itemRate) {
      return alert("Please fill all required fields");
    }

    let updated;

    const payload = {
      ...form,
      id: editIndex !== null ? orders[editIndex].id : generateOrderId(),
      dateTime: editIndex !== null ? orders[editIndex].dateTime : new Date().toLocaleString()
    };

    if (editIndex !== null) {
      updated = [...orders];
      updated[editIndex] = payload;
      setEditIndex(null);
    } else {
      updated = [...orders, payload];
    }

    setOrders(updated);

    localStorage.setItem("orders", JSON.stringify(updated));

    // Also update Customers page data
    localStorage.setItem("customers", JSON.stringify(updated));

    setShowModal(false);
    resetForm();
  };

  // ================= RESET =================

  const resetForm = () => {
    setForm({
      id: "",
      dateTime: "",
      userName: "",
      phone: "",
      city: "",
      address: "",
      orderType: "Local",
      itemSize: "",
      itemRate: "",
      totalCost: 0,
    });
  };

  // ================= EDIT =================

  const handleEdit = (index) => {
    setForm(orders[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  // ================= DELETE =================

  const handleDelete = (index) => {
    if (!window.confirm("Delete this order?")) return;

    const updated = orders.filter((_, i) => i !== index);
    setOrders(updated);

    localStorage.setItem("orders", JSON.stringify(updated));
    localStorage.setItem("customers", JSON.stringify(updated));
  };

  // ================= EXPORT =================

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 10);

    doc.autoTable({
      startY: 20,
      head: [["#", "ID", "Date", "User", "Phone", "Type", "Size", "Rate", "Total"]],
      body: filteredOrders.map((o, i) => [
        i + 1,
        o.id,
        o.dateTime,
        o.userName,
        o.phone,
        o.orderType,
        o.itemSize,
        o.itemRate,
        o.totalCost
      ])
    });

    doc.save("orders.pdf");
  };

  // ================= UI =================

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="container-fluid flex-fill p-4">

        <div className="card shadow p-4">

          {/* ===== CARDS ===== */}

          <div className="row g-3 text-center mb-4">

            <div className="col-md">
              <div className="card bg-primary text-white p-3">
                Total Orders
                <h4>{totalOrders}</h4>
              </div>
            </div>

            <div className="col-md">
              <div className="card bg-success text-white p-3">
                Total Item Size
                <h4>{totalItemSize}</h4>
              </div>
            </div>

            <div className="col-md">
              <div className="card bg-warning text-dark p-3">
                Total Item Cost
                <h4>{totalItemCost}</h4>
              </div>
            </div>

          </div>

          {/* ===== HEADER ===== */}

          <div className="d-flex justify-content-between mb-3">

            <h4 className="fw-bold">Order Management</h4>

            <div className="d-flex gap-2">
              <button onClick={exportExcel} className="btn btn-outline-secondary btn-sm">Excel</button>
              <button onClick={exportPDF} className="btn btn-outline-secondary btn-sm">PDF</button>
              <button onClick={() => setShowModal(true)} className="btn btn-dark">
                + Create Order
              </button>
            </div>

          </div>

          {/* ===== SEARCH ===== */}

          <input
            className="form-control mb-3"
            placeholder="Search by Name / Phone / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* ===== TABLE ===== */}

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
                      No Orders Found
                    </td>
                  </tr>
                ) : (

                  filteredOrders.map((o, i) => (

                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{o.id}</td>
                      <td>{o.dateTime}</td>
                      <td>{o.userName}</td>
                      <td>{o.phone}</td>
                      <td>{o.city}</td>
                      <td>{o.address}</td>
                      <td>{o.orderType}</td>
                      <td>{o.itemSize}</td>
                      <td>{o.itemRate}</td>
                      <td>{o.totalCost}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => handleEdit(i)} className="btn btn-sm btn-outline-primary">Edit</button>
                          <button onClick={() => handleDelete(i)} className="btn btn-sm btn-outline-danger">Delete</button>
                        </div>
                      </td>
                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

      <Footer />

      {/* ===== MODAL ===== */}

      {showModal && (

        <div className="modal d-block bg-dark bg-opacity-50">

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <form onSubmit={handleSave}>

                <div className="modal-header">
                  <h5>{editIndex !== null ? "Edit Order" : "Create Order"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditIndex(null); }}></button>
                </div>

                <div className="modal-body">

                  <div className="row g-3">

                    <div className="col-md-6">
                      <label>User Name *</label>
                      <input className="form-control" name="userName" value={form.userName} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Phone *</label>
                      <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>City</label>
                      <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                      <label>Address</label>
                      <input className="form-control" name="address" value={form.address} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                      <label>Order Type</label>
                      <select className="form-select" name="orderType" value={form.orderType} onChange={handleChange}>
                        <option>Local</option>
                        <option>Online</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label>Item Size *</label>
                      <input type="number" className="form-control" name="itemSize" value={form.itemSize} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Item Rate *</label>
                      <input type="number" className="form-control" name="itemRate" value={form.itemRate} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Total Cost</label>
                      <input className="form-control" value={form.totalCost} readOnly />
                    </div>

                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditIndex(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editIndex !== null ? "Update" : "Create"}</button>
                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
