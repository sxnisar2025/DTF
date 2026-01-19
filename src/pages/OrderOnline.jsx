import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddDataForm from "../components/AddDataForm";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function OrderOnline() {
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= FILTER LOGIC ================= */
  const filteredRows = rows.filter((row) => {
    const searchMatch =
      row.customer?.toLowerCase().includes(search.toLowerCase()) ||
      row.phone?.includes(search) ||
      row.location?.toLowerCase().includes(search.toLowerCase()) ||
      row.date?.includes(search);

    const customerMatch = customerFilter === "" || row.customer === customerFilter;

    let paymentMatch = true;
    if (paymentFilter === "cash") paymentMatch = row.cash > 0;
    if (paymentFilter === "transfer") paymentMatch = row.transfer > 0;
    if (paymentFilter === "balance") paymentMatch = row.balance > 0;

    let monthMatch = true;
    if (monthFilter) {
      const rowMonth = new Date(row.date).getMonth() + 1;
      monthMatch = Number(monthFilter) === rowMonth;
    }

    let dateRangeMatch = true;
    const rowDate = new Date(row.date);
    if (fromDate) dateRangeMatch = rowDate >= new Date(fromDate);
    if (toDate) dateRangeMatch = dateRangeMatch && rowDate <= new Date(toDate);

    return searchMatch && customerMatch && paymentMatch && monthMatch && dateRangeMatch;
  });

  /* ================= TOTAL ================= */
  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  /* ================= EXPORT ================= */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Online Orders");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "online_orders.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "online_orders.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Online Orders Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [[
        "S No", "Date", "Customer", "Phone", "Location",
        "Size", "Rate", "Cost",
        "Cash", "Transfer", "Balance",
        "Deposit", "Amount"
      ]],
      body: filteredRows.map((r, i) => [
        i + 1,
        r.date,
        r.customer,
        r.phone,
        r.location,
        r.size,
        r.rate,
        r.total,
        r.cash,
        r.transfer,
        r.balance,
        r.deposit,
        r.amount
      ]),
    });
    doc.save("online_orders.pdf");
  };

  const printTable = () => window.print();

  /* ================= DELETE ================= */
  const deleteRow = (index) => {
    if (!window.confirm("Are you sure you want to delete this online order?")) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */
  const saveData = (data) => {
    if (editRow !== null) {
      const updated = [...rows];
      updated[editRow] = data;
      setRows(updated);
      setEditRow(null);
    } else {
      setRows([...rows, data]);
    }
    setShowForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded-xl shadow">

          {/* HEADER */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold">Online Order</h1>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportExcel} className="border px-3 py-2 rounded">Excel</button>
              <button onClick={exportCSV} className="border px-3 py-2 rounded">CSV</button>
              <button onClick={exportPDF} className="border px-3 py-2 rounded">PDF</button>
              <button onClick={printTable} className="border px-3 py-2 rounded">Print</button>
              <button onClick={() => setShowForm(true)} className="bg-black text-white px-4 py-2 rounded">+ Add Order</button>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 rounded" />
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All Customers</option>
              <option value="Zain">Zain</option>
              <option value="Noman">Noman</option>
              <option value="Irfan">Irfan</option>
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All Payments</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="balance">Balance Due</option>
            </select>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Size</th>
                  <th className="border p-2">Rate</th>
                  <th className="border p-2">Cost</th>
                  <th className="border p-2">Cash</th>
                  <th className="border p-2">Transfer</th>
                  <th className="border p-2">Balance</th>
                  <th className="border p-2">Deposit</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr><td colSpan="14" className="text-center p-6">No online orders found</td></tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr key={i}>
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">{r.date}</td>
                      <td className="border p-2">{r.customer}</td>
                      <td className="border p-2">{r.phone}</td>
                      <td className="border p-2">{r.location}</td>
                      <td className="border p-2">{r.size}</td>
                      <td className="border p-2">{r.rate}</td>
                      <td className="border p-2">{r.total}</td>
                      <td className="border p-2">{r.cash}</td>
                      <td className="border p-2">{r.transfer}</td>
                      <td className="border p-2">{r.balance}</td>
                      <td className="border p-2">{r.deposit}</td>
                      <td className="border p-2 font-semibold">{r.amount}</td>
                      <td className="border p-2 flex gap-2">
                        <button onClick={() => { setEditRow(i); setShowForm(true); }} className="text-blue-600">Edit</button>
                        <button onClick={() => deleteRow(i)} className="text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan="13" className="border p-3 text-right">Total Amount</td>
                  <td className="border p-3">{totalAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {showForm && (
        <AddDataForm
          showOnlineFields={true}
          editData={editRow !== null ? rows[editRow] : null}
          onClose={() => { setShowForm(false); setEditRow(null); }}
          onSave={saveData}
        />
      )}
    </div>
  );
}
