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
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export default function Dashboard() {

  // ================= STATES =================

  const [type, setType] = useState("record"); // record | all
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");

  // ================= LOAD DATA =================

  const data = useMemo(() => {
    const records = JSON.parse(localStorage.getItem("records")) || [];

    // Since online orders removed — ALL = RECORDS
    return records;
  }, []);

  // ================= FILTER =================

  const filteredData = useMemo(() => {

    return data.filter((item) => {

      const rowDate = new Date(item.date);

      let dateMatch = true;
      if (fromDate) dateMatch = rowDate >= new Date(fromDate);
      if (toDate) dateMatch = dateMatch && rowDate <= new Date(toDate);

      let monthMatch = true;
      if (month) monthMatch = rowDate.getMonth() + 1 === Number(month);

      return dateMatch && monthMatch;
    });

  }, [data, fromDate, toDate, month]);

  // ================= TOTALS =================

  const totals = useMemo(() => {

    return filteredData.reduce(
      (acc, item) => {

        const size = Number(item.size || 0);
        const cash = Number(item.cash || 0);
        const transfer = Number(item.transfer || 0);
        const balance = Number(item.balance || 0);
        const amount = Number(item.amount || 0);
        const cost = Number(item.total || 0);

        acc.size += size;
        acc.cash += cash;
        acc.transfer += transfer;
        acc.balance += balance;
        acc.amount += amount;

        // Profit formula
        acc.profit += amount - cost * 200;

        return acc;

      },
      {
        size: 0,
        cash: 0,
        transfer: 0,
        balance: 0,
        amount: 0,
        profit: 0
      }
    );

  }, [filteredData]);

  // ================= WEEKLY GRAPH =================

  const weeklyGraph = useMemo(() => {

    const map = {};

    filteredData.forEach((r) => {

      const d = new Date(r.date);
      const week = Math.ceil(d.getDate() / 7);
      const label = `${d.toLocaleString("default", { month: "short" })}-W${week}`;

      if (!map[label]) map[label] = { week: label, amount: 0 };

      map[label].amount += Number(r.amount || 0);

    });

    return Object.values(map).slice(-4);

  }, [filteredData]);

  // ================= MONTHLY AMOUNT =================

  const monthlyAmount = useMemo(() => {

    const map = {};

    filteredData.forEach((r) => {

      const m = new Date(r.date).toLocaleString("default", { month: "short" });

      if (!map[m]) map[m] = { month: m, amount: 0 };

      map[m].amount += Number(r.amount || 0);

    });

    return Object.values(map);

  }, [filteredData]);

  // ================= MONTHLY SIZE =================

  const monthlySize = useMemo(() => {

    const map = {};

    filteredData.forEach((r) => {

      const m = new Date(r.date).toLocaleString("default", { month: "short" });

      if (!map[m]) map[m] = { month: m, size: 0 };

      map[m].size += Number(r.size || 0);

    });

    return Object.values(map);

  }, [filteredData]);

  const printDashboard = () => window.print();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header />

      <main className="flex-1 p-6">

        {/* ================= FILTER BAR ================= */}

        <div className="bg-white p-5 rounded-xl shadow mb-6 grid md:grid-cols-5 gap-3">

          <h1 className="text-xl font-bold">Dashboard</h1>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="record">Local Order</option>
            <option value="all">All Payment</option>
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">

          <Card title="Size" value={totals.size} />
          <Card title="Cash" value={totals.cash} />
          <Card title="Transfer" value={totals.transfer} />
          <Card title="Balance" value={totals.balance} />
          <Card title="Amount" value={totals.amount} />
          <Card title="Profit" value={totals.profit} />

        </div>

        {/* ================= CHARTS ================= */}

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <ChartBox title="Payment Summary">

            <BarChart data={[
              { name: "Cash", value: totals.cash },
              { name: "Transfer", value: totals.transfer },
              { name: "Balance", value: totals.balance }
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>

          </ChartBox>

          <ChartBox title="Weekly Payment (Last 4 Weeks)">

            <BarChart data={weeklyGraph}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="amount" fill="#22c55e" />
            </BarChart>

          </ChartBox>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <ChartBox title="Monthly Amount">

            <LineChart data={monthlyAmount}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line dataKey="amount" stroke="#6366f1" strokeWidth={3} />
            </LineChart>

          </ChartBox>

          <ChartBox title="Monthly Material Size">

            <BarChart data={monthlySize}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="size" fill="#f97316" />
            </BarChart>

          </ChartBox>

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

// ================= COMPONENTS =================

function Card({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold mt-1">{value}</h2>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
