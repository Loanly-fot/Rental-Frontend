import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import "../styles/Rentals.css";

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: "",
    endDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchRentals();
    fetchEquipment();
  }, [navigate]);

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/rentals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(response.data.rentals || []);
    } catch (err) {
      setError("Failed to fetch rentals");
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(response.data.equipment || []);
    } catch (err) {
      setError("Failed to fetch equipment");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.equipmentId || !formData.endDate) {
      setError("Please complete all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        equipment_id: parseInt(formData.equipmentId),
        return_date: formData.endDate,
      };

      await axios.post("/rentals/checkout", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Rental created successfully!");
      resetForm();
      fetchRentals();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to checkout equipment");
    }
  };

  // Return
  const handleReturnEquipment = async (rentalId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/rentals/return",
        { rental_id: rentalId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Equipment returned!");
      fetchRentals();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to return equipment");
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      endDate: "",
    });
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-${status?.toLowerCase()}`;
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="rentals-container">
      <header className="navbar">
        <div className="navbar-content">
          <h1>Equipment Rental System</h1>
          <div className="navbar-right">
            <span className="user-info">Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="sidebar">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/equipment" className="nav-link">Equipment</Link>
        <Link to="/rentals" className="nav-link active">Rentals</Link>
        <Link to="/reports" className="nav-link">Reports</Link>
      </nav>

      <main className="rentals-main">
        <div className="page-header">
          <h2>Manage Rentals</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "New Rental"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <div className="form-container">
            <h3>Create New Rental</h3>

            <form onSubmit={handleSubmit}>
  <div className="form-row">
    <div className="form-group">
      <label>Equipment *</label>
      <select
        name="equipmentId"
        value={formData.equipmentId}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Equipment</option>
        {equipment.map((eq) => (
          <option key={eq.id} value={eq.id} data-available={eq.available}>
            {eq.name} — {eq.available} available
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Quantity *</label>
      <input
        type="number"
        name="quantity"
        min="1"
        max={equipment.find(eq => eq.id == formData.equipmentId)?.available || 1}
        value={formData.quantity || 1}
        onChange={handleInputChange}
        required
      />
    </div>

    <div className="form-group">
      <label>Expected Return Date *</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleInputChange}
        required
      />
    </div>
  </div>

  <button type="submit" className="btn btn-primary">Checkout</button>
</form>

          </div>
        )}

        {/* Rentals Table */}
        <div className="rentals-table-container">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Checkout</th>
                <th>Return</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No rentals found.
                  </td>
                </tr>
              ) : (
                rentals.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.equipment_name}</td>

                    <td>
                      <div className="customer-info">
                        {r.customer_name}
                        <br />
                        <small>{r.customer_email}</small>
                        <small>{r.customer_phone}</small>
                      </div>
                    </td>

                    <td>{new Date(r.checkout_date).toLocaleDateString()}</td>
                    <td>{new Date(r.return_date).toLocaleDateString()}</td>

                    <td>${Number(r.total_cost || 0).toFixed(2)}</td>

                    <td>{getStatusBadge(r.status)}</td>

                    <td>
                      {r.status === "active" && (
                        <button
                          onClick={() => handleReturnEquipment(r.id)}
                          className="btn btn-sm btn-success"
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
