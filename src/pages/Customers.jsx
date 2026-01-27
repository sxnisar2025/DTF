import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Customers() {
  // ================= STATE =================
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");

  // Form
  const emptyForm = {
    name: "",
    phone: "",
    city: "",
    address: "",
    orderType: "Local",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  // ================= LOAD STORAGE =================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customers")) || [];
    setCustomers(stored);
  }, []);

  // ================= AUTO ID =================
  const generateId = () => {
    if (customers.length === 0) return "DTF-001";
    const lastNumbers = customers.map((c) =>
      parseInt(c.id.replace("DTF-", ""))
    );
    const max = Math.max(...lastNumbers);
    return `DTF-${String(max + 1).padStart(3, "0")}`;
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editId) {
      updated = customers.map((c) =>
        c.id === editId ? { ...c, ...form } : c
      );
    } else {
      const newCustomer = {
        id: generateId(),
        date: new Date().toLocaleDateString(),
        ...form,
      };
      updated = [...customers, newCustomer];
    }
    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
    setForm(emptyForm);
    setEditId(null);
    setShowModal(false);
  };

  // ================= EDIT =================
  const editCustomer = (customer) => {
    setForm({
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      orderType: customer.orderType,
      status: customer.status,
    });
    setEditId(customer.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const deleteCustomer = (id) => {
    if (!window.confirm("Delete this customer?")) return;
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
  };

  // ================= FILTER LOGIC =================
  const filteredCustomers = customers.filter((c) => {
    const query = search.toLowerCase();
    const searchMatch =
      c.name.toLowerCase().includes(query) ||
      String(c.phone).includes(query) ||
      c.city.toLowerCase().includes(query);
    const nameMatch = filterName ? c.name === filterName : true;
    const cityMatch = filterCity ? c.city === filterCity : true;
    const typeMatch = filterType ? c.orderType === filterType : true;
    return searchMatch && nameMatch && cityMatch && typeMatch;
  });

  const nameList = [...new Set(customers.map((c) => c.name))];
  const cityList = [...new Set(customers.map((c) => c.city))];

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="flex-fill container-fluid py-4">
        <div className="card shadow-sm">
          <div className="card-body">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Customer Profiles</h2>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-dark"
              >
                + Add Customer
              </button>
            </div>

            {/* FILTER BAR */}
            <div className="row g-2 mb-3">
              <div className="col-md">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-md">
                <select
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="form-select"
                >
                  <option value="">Filter Name</option>
                  {nameList.map((n, i) => (
                    <option key={i} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md">
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="form-select"
                >
                  <option value="">Filter City</option>
                  {cityList.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select"
                >
                  <option value="">Filter Type</option>
                  <option value="Local">Local</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Order Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.date}</td>
                        <td>{c.name}</td>
                        <td>{c.phone}</td>
                        <td>{c.city}</td>
                        <td>{c.address}</td>
                        <td>{c.orderType}</td>
                        <td>{c.status}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => editCustomer(c)}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCustomer(c.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editId ? "Edit Customer" : "Add Customer"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setForm(emptyForm);
                    setEditId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <input
                    name="name"
                    placeholder="Customer Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="number"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <select
                    name="orderType"
                    value={form.orderType}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Local">Local</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="mb-2">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setForm(emptyForm);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-dark">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
