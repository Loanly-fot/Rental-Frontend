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

  const downloadCSV = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`/reports/${reportType}/csv`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });

    // Prepend UTF-8 BOM so Excel recognizes UTF-8 reliably
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const csvArray = new Uint8Array(res.data);
    const combined = new Uint8Array(bom.length + csvArray.length);
    combined.set(bom, 0);
    combined.set(csvArray, bom.length);

    const blob = new Blob([combined], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download CSV failed", err.response || err);
    alert("Failed to download CSV");
  }
};

const downloadPDF = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`/reports/${reportType}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer", // critical for binary
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download PDF failed", err.response || err);
    alert("Failed to download PDF");
  }
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
