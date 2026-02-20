export default function CustomerModal({
  show,
  onClose,
  onSave,
  form,
  handleChange,
  handlePhoneChange,
  editIndex
}) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSave}>
            <div className="modal-header">
              <h5>{editIndex !== null ? "Edit User" : "Create User"}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">
              <div className="row g-3">

                <div className="col-md-6">
                  <label>User Name *</label>
                  <input
                    className="form-control"
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label>Phone *</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    disabled={editIndex !== null}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label>City</label>
                  <input
                    className="form-control"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label>Address</label>
                  <input
                    className="form-control"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label>Order Type</label>
                  <select
                    className="form-select"
                    name="orderType"
                    value={form.orderType}
                    onChange={handleChange}
                  >
                    <option>Local</option>
                    <option>Online</option>
                  </select>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-dark">
                {editIndex !== null ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}