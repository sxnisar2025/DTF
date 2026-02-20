export default function InvoiceSearch({
  search,
  setSearch,
  handleSearch
}) {
  return (
    <div className="row g-2 mb-4">
      <div className="col-md-6">
        <input
          className="form-control"
          placeholder="Enter Order ID or Phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="col-md-auto">
        <button
          onClick={handleSearch}
          className="btn btn-dark"
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}