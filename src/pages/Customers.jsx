import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Customers() {

  // ================= STATES =================
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [form, setForm] = useState({
    dateTime: "",
    userName: "",
    phone: "",
    city: "",
    address: "",
    orderType: "Local"
  });

  // ================= LOAD CUSTOMERS =================
  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem("customers")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    // extract customers safely from orders
    const orderCustomers = orders
      .filter(o => o.phone)
      .map(o => ({
        userName: o.userName || "Unknown",
        phone: o.phone,
        dateTime: o.dateTime || new Date().toLocaleString(),
        city: "",
        address: "",
        orderType: o.orderType || "Local"
      }));

    const merged = [...storedCustomers];

    orderCustomers.forEach(oc => {
      if (!merged.some(c => c.phone === oc.phone)) {
        merged.push(oc);
      }
    });

    setCustomers(merged);
    localStorage.setItem("customers", JSON.stringify(merged));
  }, []);

  // ================= PHONE VALIDATION =================
  const isPhoneValid = phone => /^03\d{9}$/.test(phone);

  // ================= SEARCH & FILTER (FIXED) =================
  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();

    return customers.filter(c => {
      const name = String(c.userName || "").toLowerCase();
      const phone = String(c.phone || "");

      const matchesSearch =
        name.includes(q) || phone.includes(search);

      const matchesType =
        typeFilter ? c.orderType === typeFilter : true;

      return matchesSearch && matchesType;
    });
  }, [customers, search, typeFilter]);

  // ================= SUMMARY =================
  const totalUsers = filteredCustomers.length;
  const localUsers = filteredCustomers.filter(c => c.orderType === "Local").length;
  const onlineUsers = filteredCustomers.filter(c => c.orderType === "Online").length;

  // ================= INPUT HANDLERS =================
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = e => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setForm(prev => ({ ...prev, phone: value }));
    }
  };

  // ================= SAVE CUSTOMER =================
  const handleSave = e => {
    e.preventDefault();

    if (!form.userName || !form.phone) {
      return alert("Name and Phone required");
    }

    if (!isPhoneValid(form.phone)) {
      return alert("Phone format must be 03XXXXXXXXX");
    }

    let updated = [...customers];

    if (editIndex !== null) {
      updated[editIndex] = {
        ...updated[editIndex],
        userName: form.userName,
        city: form.city,
        address: form.address,
        orderType: form.orderType
      };
      setEditIndex(null);
    } else {
      const phoneExists = customers.some(c => c.phone === form.phone);
      if (phoneExists) return alert("User already exists");

      updated.push({
        ...form,
        dateTime: new Date().toLocaleString()
      });
    }

    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
    resetForm();
    setShowModal(false);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      dateTime: "",
      userName: "",
      phone: "",
      city: "",
      address: "",
      orderType: "Local"
    });
  };

  // ================= EDIT =================
  const handleEdit = index => {
    setForm(customers[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = index => {
    if (!window.confirm("Delete this customer?")) return;
    const updated = customers.filter((_, i) => i !== index);
    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
  };

  // ================= EXPORT =================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCustomers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "customers.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Customers Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["#", "Date", "Name", "Phone", "City", "Address", "Type"]],
      body: filteredCustomers.map((c, i) => [
        i + 1,
        c.dateTime,
        c.userName,
        c.phone,
        c.city,
        c.address,
        c.orderType
      ])
    });
    doc.save("customers.pdf");
  };

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container-fluid flex-fill p-4">
        <div className="card shadow p-4">

          {/* SUMMARY */}
          <div className="row g-3 text-center mb-4">
            <div className="col-md">
              <div className="card bg-primary text-white p-3">
                Total Users
                <h4>{totalUsers}</h4>
              </div>
            </div>
            <div className="col-md">
              <div className="card bg-success text-white p-3">
                Local Users
                <h4>{localUsers}</h4>
              </div>
            </div>
            <div className="col-md">
              <div className="card bg-warning text-dark p-3">
                Online Users
                <h4>{onlineUsers}</h4>
              </div>
            </div>
          </div>

          {/* HEADER */}
          <div className="d-flex justify-content-between mb-3">
            <h4 className="fw-bold">Customer Management</h4>
            <div className="d-flex gap-2">
              <button onClick={exportExcel} className="btn btn-outline-secondary btn-sm">Excel</button>
              <button onClick={exportPDF} className="btn btn-outline-secondary btn-sm">PDF</button>
              <button onClick={() => setShowModal(true)} className="btn btn-dark">+ Create User</button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="row mb-3 g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search by Name or Phone"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Local">Local</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No Customers Found</td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{c.dateTime}</td>
                      <td>{c.userName}</td>
                      <td>{c.phone}</td>
                      <td>{c.city}</td>
                      <td>{c.address}</td>
                      <td>{c.orderType}</td>
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

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5>{editIndex !== null ? "Edit User" : "Create User"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditIndex(null); }} />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>User Name *</label>
                      <input className="form-control" name="userName" value={form.userName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Phone *</label>
                      <input className="form-control" value={form.phone} onChange={handlePhoneChange} disabled={editIndex !== null} required />
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
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
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
