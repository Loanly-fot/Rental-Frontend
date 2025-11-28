import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeRentals: 0,
    totalRevenue: 0,
    pendingReturns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
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
        <Link to="/dashboard" className="nav-link active">
          Dashboard
        </Link>
        <Link to="/equipment" className="nav-link">
          Equipment
        </Link>
        <Link to="/rentals" className="nav-link">
          Rentals
        </Link>
        <Link to="/reports" className="nav-link">
          Reports
        </Link>
      </nav>

      <main className="dashboard-main">
        <h2>Dashboard Overview</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Equipment</h3>
            <p className="stat-value">{stats.totalEquipment}</p>
            <p className="stat-label">Items in inventory</p>
          </div>

          <div className="stat-card">
            <h3>Active Rentals</h3>
            <p className="stat-value">{stats.activeRentals}</p>
            <p className="stat-label">Currently rented out</p>
          </div>

          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
            <p className="stat-label">This month</p>
          </div>

          <div className="stat-card">
            <h3>Pending Returns</h3>
            <p className="stat-value">{stats.pendingReturns}</p>
            <p className="stat-label">Due soon</p>
          </div>
        </div>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/equipment" className="btn btn-primary">
              Manage Equipment
            </Link>
            <Link to="/rentals" className="btn btn-primary">
              Create Rental
            </Link>
            <Link to="/reports" className="btn btn-primary">
              View Reports
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
