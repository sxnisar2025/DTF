export default function CashflowForm({
  user,
  submitAmount,
  setSubmitAmount,
  note,
  setNote,
  handleSubmit,
  editId
}) {
  if (user?.role !== "admin") return null;

  return (
    <div className="row g-2 mb-4">

      <div className="col-md">
        <input
          type="number"
          className="form-control"
          placeholder="Submit Amount"
          value={submitAmount}
          onChange={e => setSubmitAmount(e.target.value)}
        />
      </div>

      <div className="col-md">
        <input
          className="form-control"
          placeholder="Note"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <div className="col-md-auto">
        <button
          onClick={handleSubmit}
          className="btn btn-dark w-100"
        >
          {editId ? "Update" : "Submit Cash"}
        </button>
      </div>

    </div>
  );
}
