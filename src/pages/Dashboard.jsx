import { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";

export default function Dashboard() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");

  const data = useMemo(
    () => JSON.parse(localStorage.getItem("records")) || [],
    []
  );

  /* ================= FILTER DATA ================= */
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

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        const size = Number(item.size || 0);
        const cash = Number(item.cash || 0);
        const transfer = Number(item.transfer || 0);
        const balance = Number(item.balance || 0);
        const amount = Number(item.amount || 0);
        const cost = Number(item.total || 0);

        acc.orders += 1;
        acc.items += size;
        acc.cash += cash;
        acc.transfer += transfer;
        acc.balance += balance;
        acc.amount += amount;
        acc.payments += cash + transfer;
        acc.profit += amount - cost * 200;

        return acc;
      },
      {
        orders: 0,
        items: 0,
        cash: 0,
        transfer: 0,
        balance: 0,
        amount: 0,
        payments: 0,
        profit: 0
      }
    );
  }, [filteredData]);

  /* ================= WEEKLY GRAPH ================= */
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

  /* ================= MONTHLY AMOUNT ================= */
  const monthlyAmount = useMemo(() => {
    const map = {};
    filteredData.forEach((r) => {
      const m = new Date(r.date).toLocaleString("default", { month: "short" });
      if (!map[m]) map[m] = { month: m, amount: 0 };
      map[m].amount += Number(r.amount || 0);
    });
    return Object.values(map);
  }, [filteredData]);

  /* ================= MONTHLY SIZE ================= */
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

  const barColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40"
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      <Header />

      <main className="flex-fill container-fluid p-4">

        {/* ================= FILTER BAR ================= */}
        <div className="card p-4 shadow mb-4">
          <div className="row g-3 align-items-center">

            <div className="col-md-2 fw-bold fs-5">Dashboard</div>

            <div className="col-md">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="col-md">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="col-md">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="form-select"
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long"
                    })}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="row g-3 mb-4">

          {/* NEW CARDS */}
          <Card title="Total Orders" value={totals.orders} />
          <Card title="Total Payments" value={totals.payments} />
          <Card title="Total Balance" value={totals.balance} />
          <Card title="Total Item (Meter)" value={totals.items} />

          {/* EXISTING CARDS */}
          {/* <Card title="Size" value={totals.items} />
          <Card title="Cash" value={totals.cash} />
          <Card title="Transfer" value={totals.transfer} />
          <Card title="Balance" value={totals.balance} />
          <Card title="Amount" value={totals.amount} />
          <Card title="Profit" value={totals.profit} /> */}

        </div>

        {/* ================= CHARTS ================= */}
        <div className="row g-4 mb-4">

          <div className="col-md-6">
            <ChartBox title="Payment Summary">
              <BarChart
                data={[
                  { name: "Cash", value: totals.cash },
                  { name: "Transfer", value: totals.transfer },
                  { name: "Balance", value: totals.balance }
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="value">
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={barColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartBox>
          </div>

          <div className="col-md-6">
            <ChartBox title="Weekly Payment (Last 4 Weeks)">
              <BarChart data={weeklyGraph}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="amount">
                  {weeklyGraph.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={barColors[idx % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartBox>
          </div>

        </div>

        <div className="row g-4">

          <div className="col-md-6">
            <ChartBox title="Monthly Amount">
              <LineChart data={monthlyAmount}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  dataKey="amount"
                  stroke="#36A2EB"
                  strokeWidth={3}
                />
              </LineChart>
            </ChartBox>
          </div>

          <div className="col-md-6">
            <ChartBox title="Monthly Material Size">
              <BarChart data={monthlySize}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="size">
                  {monthlySize.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={barColors[idx % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartBox>
          </div>

        </div>

        <div className="d-flex justify-content-end mt-4">
          <button onClick={printDashboard} className="btn btn-dark">
            Print Dashboard
          </button>
        </div>

      </main>

      <Footer />

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, value }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="card text-center shadow p-3 h-100">
        <p className="text-muted small mb-1">{title}</p>
        <h5 className="fw-bold">{value}</h5>
      </div>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="card p-4 shadow h-100">
      <h6 className="fw-semibold mb-3">{title}</h6>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
