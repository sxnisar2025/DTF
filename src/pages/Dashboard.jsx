import { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

export default function Dashboard() {

  const [type, setType] = useState("record");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");

  // ================= LOAD DATA =================

  const data = useMemo(() => {

    const stored =
      type === "record"
        ? JSON.parse(localStorage.getItem("records")) || []
        : JSON.parse(localStorage.getItem("onlineOrders")) || [];

    return stored;

  }, [type]);

  // ================= FILTER DATA =================

  const filteredData = useMemo(() => {

    return data.filter((item) => {

      const rowDate = new Date(item.date);

      let dateMatch = true;
      if (fromDate) dateMatch = rowDate >= new Date(fromDate);
      if (toDate) dateMatch = dateMatch && rowDate <= new Date(toDate);

      let monthMatch = true;
      if (month) {
        monthMatch = rowDate.getMonth() + 1 === Number(month);
      }

      return dateMatch && monthMatch;
    });

  }, [data, fromDate, toDate, month]);

  // ================= TOTAL CALCULATION =================

  const totals = useMemo(() => {

    return filteredData.reduce(
      (acc, item) => {

        const size = Number(item.size || 0);
        const cash = Number(item.cash || 0);
        const transfer = Number(item.transfer || 0);
        const balance = Number(item.balance || 0);
        const deposit = Number(item.deposit || 0);
        const amount = Number(item.amount || 0);
        const cost = Number(item.total || 0);

        acc.size += size;
        acc.cash += cash;
        acc.transfer += transfer;
        acc.balance += balance;
        acc.deposit += deposit;
        acc.amount += amount;
        acc.profit += amount - cost;

        return acc;
      },
      {
        size: 0,
        cash: 0,
        transfer: 0,
        balance: 0,
        deposit: 0,
        amount: 0,
        profit: 0
      }
    );

  }, [filteredData]);

  // ================= CHART DATA =================

  const barData = useMemo(() => [
    { name: "Cash", value: totals.cash },
    { name: "Transfer", value: totals.transfer },
    { name: "Balance", value: totals.balance },
    { name: "Deposit", value: totals.deposit }
  ], [totals]);

  const pieData = useMemo(() => [
    { name: "Cash", value: totals.cash },
    { name: "Transfer", value: totals.transfer },
    { name: "Deposit", value: totals.deposit }
  ], [totals]);

  const printDashboard = () => window.print();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        {/* ================= FILTER BAR ================= */}

        <div className="bg-white p-5 rounded-xl shadow mb-5 grid md:grid-cols-5 gap-3 items-center">

          <h1 className="text-xl font-bold">Dashboard</h1>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="record">Record</option>
            <option value="online">Online Order</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

        </div>

        {/* ================= SUMMARY CARDS ================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">

          <Card title="Size" value={totals.size} />
          <Card title="Cash" value={totals.cash} />
          <Card title="Transfer" value={totals.transfer} />
          <Card title="Balance" value={totals.balance} />
          <Card title="Deposit" value={totals.deposit} />
          <Card title="Amount" value={totals.amount} />
          <Card title="Profit" value={totals.profit} />

        </div>

        {/* ================= CHARTS ================= */}

        <div className="grid md:grid-cols-2 gap-6">

          {/* BAR CHART */}

          <div className="bg-white p-5 rounded-xl shadow">

            <h2 className="font-semibold mb-3">Payment Summary</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* PIE CHART */}

          <div className="bg-white p-5 rounded-xl shadow">

            <h2 className="font-semibold mb-3">Income Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* ================= PRINT ================= */}

        <div className="mt-6 flex justify-end">
          <button
            onClick={printDashboard}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Print Dashboard
          </button>
        </div>

      </main>

      <Footer />

    </div>
  );
}

// ================= CARD COMPONENT =================

function Card({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold mt-1">{value}</h2>
    </div>
  );
}
