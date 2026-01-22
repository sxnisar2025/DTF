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
    status: "Active"
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

    const lastNumbers = customers.map(c =>
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

      updated = customers.map(c =>
        c.id === editId ? { ...c, ...form } : c
      );

    } else {

      const newCustomer = {
        id: generateId(),
        date: new Date().toLocaleDateString(),
        ...form
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
    status: customer.status
  });

  setEditId(customer.id);
  setShowModal(true);
};


  // ================= DELETE =================

  const deleteCustomer = (id) => {

    if (!window.confirm("Delete this customer?")) return;

    const updated = customers.filter(c => c.id !== id);

    setCustomers(updated);
    localStorage.setItem("customers", JSON.stringify(updated));
  };

  // ================= FILTER LOGIC =================

const filteredCustomers = customers.filter(c => {

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


  // Dropdown lists
  const nameList = [...new Set(customers.map(c => c.name))];
  const cityList = [...new Set(customers.map(c => c.city))];

  // ================= UI =================

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        <div className="bg-white p-6 rounded shadow">

          {/* HEADER */}

          <div className="flex justify-between mb-4">

            <h2 className="text-xl font-bold">Customer Profiles</h2>

            <button
              onClick={() => setShowModal(true)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Customer
            </button>

          </div>

          {/* FILTER BAR */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">

            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Filter Name</option>
              { nameList.map((n, i) => (
  <option key={i} value={n}>{n}</option>
))}

            </select>

            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Filter City</option>
              { cityList.map((c, i) => (
  <option key={i} value={c}>{c}</option>
))}

            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Filter Type</option>
              <option value="Local">Local</option>
              <option value="Online">Online</option>
            </select>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full border text-sm">

              <thead className="bg-gray-200">

                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">City</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">Order Type</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredCustomers.length === 0 ? (

                  <tr>
                    <td colSpan="9" className="text-center p-4">
                      No customers found
                    </td>
                  </tr>

                ) : (

                  filteredCustomers.map(c => (

                    <tr key={c.id}>

                      <td className="border p-2">{c.id}</td>
                      <td className="border p-2">{c.date}</td>
                      <td className="border p-2">{c.name}</td>
                      <td className="border p-2">{c.phone}</td>
                      <td className="border p-2">{c.city}</td>
                      <td className="border p-2">{c.address}</td>
                      <td className="border p-2">{c.orderType}</td>
                      <td className="border p-2">{c.status}</td>

                      <td className="border p-2 flex gap-2">

                        <button
                          onClick={() => editCustomer(c)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCustomer(c.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>

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

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded w-96"
          >

            <h3 className="font-bold mb-3">
              {editId ? "Edit Customer" : "Add Customer"}
            </h3>

            <input name="name" placeholder="Customer Name" value={form.name} onChange={handleChange} required className="border p-2 w-full mb-2" />

            <input type="number" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="border p-2 w-full mb-2" />

            <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="border p-2 w-full mb-2" />

            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="border p-2 w-full mb-2" />

            <select name="orderType" value={form.orderType} onChange={handleChange} className="border p-2 w-full mb-2">
              <option value="Local">Local</option>
              <option value="Online">Online</option>
            </select>

            <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full mb-4">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                  setEditId(null);
                }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}
