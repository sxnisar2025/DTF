import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [form, setForm] = useState({
    id: "",
    dateTime: "",
    userName: "",
    phone: "03",
    Description: "",
    itemSize: "",
    itemRate: "",
    totalCost: 0,
    status: "InProgress",
  });

  // ================= Load Orders & Payments =================
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setOrders(storedOrders);
    setPayments(storedPayments);
  }, []);

  // ================= Auto calculate total cost =================
  useEffect(() => {
    const size = Number(form.itemSize || 0);
    const rate = Number(form.itemRate || 0);
    setForm(prev => ({ ...prev, totalCost: size * rate }));
  }, [form.itemSize, form.itemRate]);

  // ================= Merge orders with payments =================
  const mergedOrders = useMemo(() => {
    return orders.map(order => {
      const orderPayments = payments.filter(p => p.orderId === order.id);
      const paidAmount = orderPayments.reduce((sum, p) => sum + Number(p.cash || 0) + Number(p.transfer || 0), 0);
      const balance = Number(order.totalCost) - paidAmount;

      let status = "Pending";
      if (paidAmount > 0 && paidAmount < order.totalCost) status = "InProgress";
      else if (paidAmount >= order.totalCost) status = "Completed";

      return {
        ...order,
        paidAmount,
        balance: balance < 0 ? 0 : balance,
        lastPaymentDate: orderPayments[orderPayments.length - 1]?.date || "",
        status
      };
    });
  }, [orders, payments]);

  // ================= ID Generator (never reuse) =================
  const generateOrderId = () => {
    const lastNum = Number(localStorage.getItem("lastOrderNum") || 0);
    const nextNum = lastNum + 1;
    localStorage.setItem("lastOrderNum", nextNum);
    return `DTF-${String(nextNum).padStart(3, "0")}`;
  };

  // ================= Filter Orders =================
  const filteredOrders = useMemo(() => {
    return mergedOrders.filter(o => {
      const matchSearch =
        o.userName.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.id.includes(search);

      const matchStatus = statusFilter ? o.status === statusFilter : true;
      const orderMonth = new Date(o.dateTime).getMonth() + 1;
      const orderDate = o.dateTime?.split(",")[0];
      const matchMonth = monthFilter ? Number(monthFilter) === orderMonth : true;
      const matchDate = dateFilter ? dateFilter === orderDate : true;

      return matchSearch && matchStatus && matchMonth && matchDate;
    });
  }, [mergedOrders, search, statusFilter, monthFilter, dateFilter]);

  // ================= SUMMARY =================
  const createdOrders = mergedOrders.length;
  const inProgressOrders = mergedOrders.filter(o => o.status === "InProgress").length;
  const completedOrders = mergedOrders.filter(o => o.status === "Completed").length;
  const totalItemSize = mergedOrders.reduce((s, o) => s + Number(o.itemSize || 0), 0);
  const totalItemCost = mergedOrders.reduce((s, o) => s + Number(o.totalCost || 0), 0);

  // ================= Form Handlers =================
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "phone") {
      let digitsOnly = value.replace(/\D/g, "");
      if (!digitsOnly.startsWith("03")) digitsOnly = "03";
      if (digitsOnly.length > 11) digitsOnly = digitsOnly.slice(0, 11);
      setForm(prev => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: "",
      dateTime: "",
      userName: "",
      phone: "03",
      Description: "",
      itemSize: "",
      itemRate: "",
      totalCost: 0,
      status: "InProgress",
    });
  };

  // ================= Save Order =================
  const handleSave = e => {
    e.preventDefault();
    if (!form.userName || !form.phone || !form.itemSize || !form.itemRate) {
      alert("Fill all required fields");
      return;
    }
    if (!/^03\d{9}$/.test(form.phone)) {
      alert("Phone must be in the format 03XXXXXXXXX (11 digits)");
      return;
    }

    const payload = {
      ...form,
      id: editIndex !== null ? orders[editIndex].id : generateOrderId(),
      dateTime: editIndex !== null ? orders[editIndex].dateTime : new Date().toLocaleString(),
      status: "InProgress"
    };

    let updated;
    if (editIndex !== null) {
      updated = [...orders];
      updated[editIndex] = payload;
    } else {
      updated = [...orders, payload];
    }

    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));

    resetForm();
    setShowModal(false);
    setEditIndex(null);
  };

  // ================= Edit =================
  const handleEdit = index => {
    setForm(orders[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  // ================= Delete =================
  const handleDelete = index => {
    if (!window.confirm("Delete this order?")) return;

    const deletedOrder = orders[index];
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    const updatedPayments = payments.filter(p => p.orderId !== deletedOrder.id);
    setPayments(updatedPayments);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
  };

  // ================= Export =================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]), "orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["#", "ID", "Date", "User", "Phone", "Description", "Size", "Rate", "Total", "Status"]],
      body: filteredOrders.map((o, i) => [
        i + 1,
        o.id,
        o.dateTime,
        o.userName,
        o.phone,
        o.Description,
        o.itemSize,
        o.itemRate,
        o.totalCost,
        o.status,
      ])
    });
    doc.save("orders.pdf");
  };

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="container-fluid p-4 flex-fill">
        {/* SUMMARY */}
        <div className="row g-3 mb-4 text-center">
          <div className="col">
            <div className="card bg-primary text-white p-3">
              Created Orders
              <h5>{createdOrders}</h5>
            </div>
          </div>
          <div className="col">
            <div className="card bg-warning text-dark p-3">
              InProgress Orders
              <h5>{inProgressOrders}</h5>
            </div>
          </div>
          <div className="col">
            <div className="card bg-success text-white p-3">
              Completed Orders
              <h5>{completedOrders}</h5>
            </div>
          </div>
          <div className="col">
            <div className="card bg-info text-white p-3">
              Total Size (M)
              <h5>{totalItemSize}</h5>
            </div>
          </div>
          <div className="col">
            <div className="card bg-dark text-white p-3">
              Total Cost
              <h5>{totalItemCost}</h5>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4 className="fw-bold">Order Management</h4>
          <div className="d-flex gap-2">
            <button onClick={exportExcel} className="btn btn-outline-secondary btn-sm">Excel</button>
            <button onClick={exportPDF} className="btn btn-outline-secondary btn-sm">PDF</button>
            <button onClick={() => setShowModal(true)} className="btn btn-dark">+ Create Order</button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="row g-2 mb-3">
          <div className="col-md">
            <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md">
            <select className="form-select" onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">InProgress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="col-md">
            <input type="month" className="form-control" onChange={e => setMonthFilter(e.target.value.split("-")[1])} />
          </div>
          <div className="col-md">
            <input type="date" className="form-control" onChange={e => setDateFilter(e.target.value)} />
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow p-3">
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Description</th>
                  <th>Size "M"</th>
                  <th>Rate</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => (
                  <tr key={i} className={o.balance === 0 ? "table-success" : ""}>
                    <td>{i + 1}</td>
                    <td>{o.id}</td>
                    <td>{o.dateTime}</td>
                    <td>{o.userName}</td>
                    <td>{o.phone}</td>
                    <td>{o.Description}</td>
                    <td>{o.itemSize}</td>
                    <td>{o.itemRate}</td>
                    <td>{o.totalCost}</td>
                    <td>
                       <td><span className={`badge ${o.status==="Completed"?"bg-success":o.status==="Pending"?"bg-secondary text-white":"bg-warning text-dark"}`}>{o.status}</span></td>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button disabled={o.status === "Completed"} onClick={() => handleEdit(i)} className="btn btn-sm btn-outline-primary">Edit</button>
                        <button disabled={o.status === "Completed"} onClick={() => handleDelete(i)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <Footer />

      {/* MODAL */}
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
                      <label>Item Size *</label>
                      <input type="number" className="form-control" name="itemSize" value={form.itemSize} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Item Rate *</label>
                      <input type="number" className="form-control" name="itemRate" value={form.itemRate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Description</label>
                      <input className="form-control" name="Description" value={form.Description} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label>Total Cost</label>
                      <input className="form-control" value={form.totalCost} readOnly style={{ backgroundColor: "#f5f5f5" }} />
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
