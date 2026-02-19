export default function OrderModal({
  showModal,
  setShowModal,
  form,
  handleChange,
  handleSave,
  editIndex,
  setEditIndex
}) {
  if (!showModal) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5>{editIndex !== null ? "Edit Order" : "Create Order"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditIndex(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>User Name *</label>
                      <input className="form-control" name="userName" value={form.userName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Phone *</label>
                      <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Item Size *</label>
                      <input type="number" className="form-control" name="itemSize" value={form.itemSize} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Item Rate *</label>
                      <input type="number" className="form-control" name="itemRate" value={form.itemRate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Description</label>
                      <input className="form-control" name="Description" value={form.Description} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label>Total Cost</label>
                      <input className="form-control" value={form.totalCost} readOnly style={{ backgroundColor: "#f5f5f5" }} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditIndex(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editIndex !== null ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
  );
}
