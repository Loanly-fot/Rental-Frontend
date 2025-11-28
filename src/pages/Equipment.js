import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import "../styles/Equipment.css";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    dailyRate: "",
    quantity: "",
    available: "",
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
    fetchEquipment();
  }, [navigate]);

  const fetchEquipment = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/equipment", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Equipment API Response:", response.data);
    
    // Backend returns: { success: true, count: X, equipment: [...] }
    const equipmentList = response.data.equipment || [];
    setEquipment(Array.isArray(equipmentList) ? equipmentList : []);
  } catch (err) {
    console.error("Fetch error:", err);
    setError("Failed to fetch equipment");
    setEquipment([]);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (editingId) {
        await axios.put(`/equipment/${editingId}`, formData, { headers });
        setSuccess("Equipment updated successfully");
      } else {
        await axios.post("/equipment", formData, { headers });
        setSuccess("Equipment added successfully");
      }

      resetForm();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save equipment");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      dailyRate: item.dailyRate,
      quantity: item.quantity,
      available: item.available,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/equipment/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Equipment deleted successfully");
      fetchEquipment();
    } catch (err) {
      setError("Failed to delete equipment");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      dailyRate: "",
      quantity: "",
      available: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="equipment-container">
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
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/equipment" className="nav-link active">
          Equipment
        </Link>
        <Link to="/rentals" className="nav-link">
          Rentals
        </Link>
        <Link to="/reports" className="nav-link">
          Reports
        </Link>
      </nav>

      

      <main className="equipment-main">
        
        <div className="page-header">
          <h2>Equipment Management</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Equipment"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? "Edit Equipment" : "Add New Equipment"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Equipment Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Bulldozer"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Tools">Tools</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Equipment description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Daily Rate ($) *</label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Total Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Currently Available *</label>
                  <input
                    type="number"
                    name="available"
                    value={formData.available}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Equipment" : "Add Equipment"}
              </button>
            </form>
          </div>
        )}

        <div className="equipment-table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Total Qty</th>
                <th>Available</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {equipment.length === 0 ? (
    <tr>
      <td colSpan="7" className="no-data">
        No equipment found. Add one to get started.
      </td>
    </tr>
  ) : (
    equipment.map((item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.category}</td>
        <td>${(Number(item.daily_rate) || 0).toFixed(2)}</td>
        <td>{item.qty_total}</td>
        <td className={item.qty_available === 0 ? "unavailable" : ""}>
          {item.qty_available}
        </td>
        <td className="description">{item.description}</td>
        <td className="actions">
          <button
            onClick={() => handleEdit(item)}
            className="btn btn-sm btn-edit"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="btn btn-sm btn-delete"
          >
            Delete
          </button>
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
