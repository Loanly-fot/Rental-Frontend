import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import "../styles/Reports.css";

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("daily");
  const [error, setError] = useState("");
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
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`/reports/data/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch report data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // const downloadCSV = () => {
  //   if (!reportData.length) return;

  //   let csv = "";
  //   let filename = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;

  //   const keys = Object.keys(reportData[0]);
  //   csv += keys.join(",") + "\n";

  //   reportData.forEach((row) => {
  //     csv += keys.map((k) => row[k]).join(",") + "\n";
  //   });

  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const downloadPDF = () => {
  //   alert("PDF download coming soon. Use CSV for now.");
  // };

  const downloadCSV = () => {
  const token = localStorage.getItem("token");
  window.open(`${process.env.REACT_APP_API_URL}/reports/${reportType}/csv`, "_blank");
};

const downloadPDF = () => {
  const token = localStorage.getItem("token");
  window.open(`${process.env.REACT_APP_API_URL}/reports/${reportType}/pdf`, "_blank");
};



  return (
    <div className="reports-container">
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
        <Link to="/rentals" className="nav-link">Rentals</Link>
        <Link to="/reports" className="nav-link active">Reports</Link>
      </nav>

      <main className="reports-main">
        <div className="page-header">
          <h2>Reports & Analytics</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="report-controls">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="daily">Daily Rentals</option>
            <option value="monthly">Monthly Rentals</option>
            <option value="inventory">Inventory</option>
            <option value="activity">Activity Logs</option>
            <option value="overdue">Overdue Rentals</option>
          </select>

          <div className="export-buttons">
            <button onClick={downloadCSV} className="btn btn-secondary">📥 Download CSV</button>
            <button onClick={downloadPDF} className="btn btn-secondary">📄 Download PDF</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Generating report...</div>
        ) : reportData.length > 0 ? (
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).map((k) => (
                      <td key={k}>
                        {typeof row[k] === "number" ? row[k].toFixed(2) : row[k]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">No data available for this report</div>
        )}
      </main>
    </div>
  );
}
