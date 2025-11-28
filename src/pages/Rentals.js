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
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    quantity: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRentals(response.data);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEquipment(response.data.filter((e) => e.available > 0));
    } catch (err) {
      setError("Failed to fetch equipment");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  const calculateTotal = () => {
    if (!formData.equipmentId || !formData.startDate || !formData.endDate) {
      return 0;
    }

    const equip = equipment.find(
      (e) => e.id === parseInt(formData.equipmentId)
    );
    if (!equip) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return days > 0 ? days * equip.dailyRate * formData.quantity : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.equipmentId || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("/rentals", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Rental created successfully");
      resetForm();
      fetchRentals();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create rental");
    }
  };

  const handleReturnEquipment = async (rentalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/rentals/${rentalId}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Equipment returned successfully");
      fetchRentals();
      fetchEquipment();
    } catch (err) {
      setError("Failed to return equipment");
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      startDate: "",
      endDate: "",
      quantity: 1,
    });
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-${status.toLowerCase()}`;
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="rentals-container">
      <header className="navbar">
        <div className="navbar-content">
          <h1>Equipment Rental System</h1>
          <div className="navbar-right">
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="rentals-main">
        <div className="page-header">
          <h2>Rental Checkouts</h2>
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
                      <option key={eq.id} value={eq.id}>
                        {eq.name} - ${eq.dailyRate}/day ({eq.available}{" "}
                        available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {formData.equipmentId &&
                formData.startDate &&
                formData.endDate && (
                  <div className="rental-summary">
                    <p>
                      <strong>Estimated Total:</strong> $
                      {calculateTotal().toFixed(2)}
                    </p>
                  </div>
                )}

              <button type="submit" className="btn btn-primary">
                Create Rental
              </button>
            </form>
          </div>
        )}

        <div className="rentals-table-container">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No rentals found. Create one to get started.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>{rental.equipmentName}</td>
                    <td>
                      <div className="customer-info">
                        <div>{rental.customerName}</div>
                        <small>{rental.customerEmail}</small>
                      </div>
                    </td>
                    <td>{new Date(rental.startDate).toLocaleDateString()}</td>
                    <td>{new Date(rental.endDate).toLocaleDateString()}</td>
                    <td>${rental.totalCost.toFixed(2)}</td>
                    <td>{getStatusBadge(rental.status)}</td>
                    <td className="actions">
                      {rental.status === "active" && (
                        <button
                          onClick={() => handleReturnEquipment(rental.id)}
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
