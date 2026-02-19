import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import OrderModal from "../components/OrderModal";
import OrderSummary from "../components/OrderSummary";
import OrderFilters from "../components/OrderFilters";

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
        <OrderSummary
          createdOrders={createdOrders}
          inProgressOrders={inProgressOrders}
          completedOrders={completedOrders}
          totalItemSize={totalItemSize}
          totalItemCost={totalItemCost}
        />
        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4 className="fw-bold">Order Management</h4>
          <div className="d-flex gap-2">
            <button onClick={exportExcel} className="btn btn-outline-secondary btn-sm">Excel</button>
            <button onClick={exportPDF} className="btn btn-outline-secondary btn-sm">PDF</button>
            <button onClick={() => setShowModal(true)} className="btn btn-success">+ Create Order</button>
          </div>
        </div>
        <addRecord></addRecord>

        {/* FILTERS */}
      <OrderFilters
  search={search}
  setSearch={setSearch}
  setStatusFilter={setStatusFilter}
  setMonthFilter={setMonthFilter}
  setDateFilter={setDateFilter}
/>

        {/* TABLE */}
        <div className="card shadow p-3">
          <h5 className="fw-bold mb-3">Order Record</h5>
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
                      <td><span className={`badge ${o.status === "Completed" ? "bg-success" : o.status === "Pending" ? "bg-secondary text-white" : "bg-warning text-dark"}`}>{o.status}</span></td>
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
      <OrderModal
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        handleChange={handleChange}
        handleSave={handleSave}
        editIndex={editIndex}
        setEditIndex={setEditIndex}
      />

    </div>
  );
}
