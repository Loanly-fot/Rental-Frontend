import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import "../styles/Reports.css";

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("revenue");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
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
  }, [navigate, reportType, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/reports/${reportType}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReportData(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadCSV = () => {
    if (!reportData) return;

    let csv = "";
    let filename = `report-${reportType}-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    if (reportType === "revenue") {
      csv = "Date,Equipment,Quantity,Daily Rate,Total Revenue\n";
      reportData.forEach((item) => {
        csv += `${item.date},${item.equipmentName},${item.quantity},${item.dailyRate},${item.totalRevenue}\n`;
      });
    } else if (reportType === "equipment") {
      csv = "Equipment,Category,Total Quantity,Available,In Use,Daily Rate\n";
      reportData.forEach((item) => {
        csv += `${item.name},${item.category},${item.quantity},${item.available},${item.inUse},${item.dailyRate}\n`;
      });
    } else if (reportType === "rentals") {
      csv =
        "Rental ID,Customer,Equipment,Start Date,End Date,Status,Total Cost\n";
      reportData.forEach((item) => {
        csv += `${item.id},${item.customerName},${item.equipmentName},${item.startDate},${item.endDate},${item.status},${item.totalCost}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    alert("PDF download feature coming soon. Use CSV export for now.");
  };

  if (loading && !reportData) {
    return <div className="loading">Loading...</div>;
  }

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
          <div className="controls-row">
            <div className="control-group">
              <label>Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="revenue">Revenue Report</option>
                <option value="equipment">Equipment Status</option>
                <option value="rentals">Rental History</option>
              </select>
            </div>

            <div className="control-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="control-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="control-group">
              <label>&nbsp;</label>
              <button onClick={fetchReport} className="btn btn-primary">
                Generate Report
              </button>
            </div>
          </div>

          <div className="export-buttons">
            <button onClick={downloadCSV} className="btn btn-secondary">
              📥 Download CSV
            </button>
            <button onClick={downloadPDF} className="btn btn-secondary">
              📄 Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Generating report...</div>
        ) : reportData && reportData.length > 0 ? (
          <div className="report-content">
            {reportType === "revenue" && (
              <div className="report-table-container">
                <h3>Revenue Report</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Equipment</th>
                      <th>Quantity</th>
                      <th>Daily Rate</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td>
                        <td>{item.equipmentName}</td>
                        <td>{item.quantity}</td>
                        <td>${item.dailyRate.toFixed(2)}</td>
                        <td className="revenue">
                          ${item.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="report-summary">
                  <strong>Total Revenue:</strong> $
                  {reportData
                    .reduce((sum, item) => sum + item.totalRevenue, 0)
                    .toFixed(2)}
                </div>
              </div>
            )}

            {reportType === "equipment" && (
              <div className="report-table-container">
                <h3>Equipment Status Report</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Category</th>
                      <th>Total Qty</th>
                      <th>Available</th>
                      <th>In Use</th>
                      <th>Daily Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td className="available">{item.available}</td>
                        <td className="in-use">{item.inUse}</td>
                        <td>${item.dailyRate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "rentals" && (
              <div className="report-table-container">
                <h3>Rental History Report</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Rental ID</th>
                      <th>Customer</th>
                      <th>Equipment</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.customerName}</td>
                        <td>{item.equipmentName}</td>
                        <td>{new Date(item.startDate).toLocaleDateString()}</td>
                        <td>{new Date(item.endDate).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`status-${item.status.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="revenue">
                          ${item.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="report-summary">
                  <strong>Total Rentals:</strong> {reportData.length} |
                  <strong> Total Revenue:</strong> $
                  {reportData
                    .reduce((sum, item) => sum + item.totalCost, 0)
                    .toFixed(2)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">
            No data available for the selected period
          </div>
        )}
      </main>
    </div>
  );
}
