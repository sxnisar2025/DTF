import { useState, useEffect } from "react";

export default function AddDataForm({ onClose, onSave, editData, showOnlineFields = false }) {
  const systemDate = new Date().toLocaleDateString();

  const [form, setForm] = useState({
    date: systemDate,
    customer: "",
    phone: "",
    location: "",
    size: "",
    rate: "",
    cost: 0,
    cash: "",
    transfer: "",
    deposit: "",
    balance: 0,
    amount: 0,
    file: null,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        customer: editData.customer,
        phone: editData.phone || "",
        location: editData.location || "",
        size: editData.size,
        rate: editData.rate,
        cost: editData.total,
        cash: editData.cash,
        transfer: editData.transfer,
        deposit: editData.deposit,
        balance: editData.balance,
        amount: editData.amount,
        file: editData.file || null,
      });
    }
  }, [editData]);

  useEffect(() => {
    const size = Number(form.size || 0);
    const rate = Number(form.rate || 0);
    const cash = Number(form.cash || 0);
    const transfer = Number(form.transfer || 0);
    const deposit = Number(form.deposit || 0);
    const cost = size * rate;
    const totalPaid = cash + transfer + deposit;
    setForm((prev) => ({ ...prev, cost, balance: cost - totalPaid, amount: totalPaid }));
  }, [form.size, form.rate, form.cash, form.transfer, form.deposit]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: editData?.id || Date.now(),
      date: form.date,
      customer: form.customer,
      ...(showOnlineFields && { phone: form.phone, location: form.location }),
      size: Number(form.size),
      rate: Number(form.rate),
      total: form.cost,
      cash: Number(form.cash || 0),
      transfer: Number(form.transfer || 0),
      deposit: Number(form.deposit || 0),
      balance: form.balance,
      amount: form.amount,
      file: form.file,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-6">{editData ? "Edit Data" : "Add Data"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input value={form.date} readOnly className="border p-2 rounded bg-gray-100 w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Customer</label>
            <select name="customer" value={form.customer} onChange={handleChange} className="border p-2 rounded w-full" required>
              <option value="">Select Customer</option>
              <option value="Zain">Zain</option>
              <option value="Noman">Noman</option>
              <option value="Irfan">Irfan</option>
            </select>
          </div>

          {showOnlineFields && (
            <>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <input name="location" type="text" value={form.location} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">Material Size</label>
            <input name="size" type="number" value={form.size} onChange={handleChange} className="border p-2 rounded w-full" required />
          </div>

          <div>
            <label className="text-sm font-medium">Rate</label>
            <input name="rate" type="number" value={form.rate} onChange={handleChange} className="border p-2 rounded w-full" required />
          </div>

          <div>
            <label className="text-sm font-medium">Cost</label>
            <input value={form.cost} readOnly className="border p-2 rounded bg-gray-100 w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Cash Received</label>
            <input name="cash" type="number" value={form.cash} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Transfer</label>
            <input name="transfer" type="number" value={form.transfer} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Deposit</label>
            <input name="deposit" type="number" value={form.deposit} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Attached File</label>
            <input type="file" name="file" onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm font-medium">Balance</label>
            <input value={form.balance} readOnly className="border p-2 rounded bg-gray-100 w-full" />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <input value={form.amount} readOnly className="border p-2 rounded bg-gray-100 w-full" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
          <button className="bg-black text-white px-4 py-2 rounded">{editData ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
