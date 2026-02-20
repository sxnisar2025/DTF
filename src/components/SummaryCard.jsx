export default function SummaryCard({ title, value }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="card text-center shadow p-3 h-100">
        <p className="text-muted small mb-1">{title}</p>
        <h5 className="fw-bold">{value}</h5>
      </div>
    </div>
  );
}