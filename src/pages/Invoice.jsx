import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import "jspdf-autotable";
import InvoiceSearch from "../components/InvoiceSearch";
import InvoicePreview from "../components/InvoicePreview";

export default function Invoice() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadData = () => {
      const orderData = JSON.parse(localStorage.getItem("orders")) || [];
      const paymentData = JSON.parse(localStorage.getItem("payments")) || [];
      setOrders(orderData);
      setPayments(paymentData);
    };

    loadData();

    const handleStorageChange = (event) => {
      if (event.key === "payments" || event.key === "orders") {
        loadData();
        if (invoiceData) setTimeout(handleSearch, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [invoiceData]);

  // ================= SEARCH ORDER =================
  const handleSearch = () => {
    if (!search) return alert("Enter Order ID or Phone");

    const order = orders.find(o => o.id === search || o.phone === search);
    if (!order) {
      setInvoiceData(null);
      return alert("Order not found");
    }

    // ✅ GET PAYMENTS USING orderId
    const orderPayments = payments.filter(p => p.orderId === order.id);

    const totalCash = orderPayments.reduce((sum, p) => sum + Number(p.cash || 0), 0);
    const totalTransfer = orderPayments.reduce((sum, p) => sum + Number(p.transfer || 0), 0);
    const totalPaid = totalCash + totalTransfer;
    const balance = Number(order.totalCost) - totalPaid;

    setInvoiceData({
      ...order,
      cash: totalCash,
      transfer: totalTransfer,
      paid: totalPaid,
      balance: balance < 0 ? 0 : balance
    });
  };

  // ================= PDF EXPORT =================
  const exportPDF = () => {
    if (!invoiceData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DTF SYSTEM INVOICE", 14, 15);
    doc.setFontSize(10);

    doc.text(`Invoice ID: ${invoiceData.id}`, 14, 25);
    doc.text(`Date: ${invoiceData.dateTime}`, 14, 32);

    doc.text(`Customer: ${invoiceData.userName}`, 140, 25);
    doc.text(`Phone: ${invoiceData.phone}`, 140, 32);

    doc.autoTable({
      startY: 45,
      head: [["Description", "Size", "Rate", "Total"]],
      body: [[
        invoiceData.Description,
        invoiceData.itemSize,
        invoiceData.itemRate,
        invoiceData.totalCost
      ]]
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Payment Summary", "Amount"]],
      body: [
        ["Cash", invoiceData.cash],
        ["Transfer", invoiceData.transfer],
        ["Total Paid", invoiceData.paid],
        ["Balance", invoiceData.balance]
      ]
    });

    doc.save(`Invoice_${invoiceData.id}.pdf`);
  };

  // ================= PRINT =================
  const printInvoice = () => window.print();

  // ================= UI =================
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="container p-4 flex-fill">
        <div className="card shadow p-4">
          <h4 className="fw-bold mb-3">Invoice Generator</h4>

          {/* SEARCH */}
         <InvoiceSearch
  search={search}
  setSearch={setSearch}
  handleSearch={handleSearch}
/>

          {/* INVOICE PREVIEW */}
       <InvoicePreview
  invoiceData={invoiceData}
  printInvoice={printInvoice}
  exportPDF={exportPDF}
/>

        </div>
      </main>
      <Footer />
    </div>
  );
}
