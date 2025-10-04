import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchForecast() {
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:5000/predict?days=${days}`);
      const json = await resp.json();
      setData(json);
    } catch (err) {
      alert("Failed to fetch: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: data.map((d) => d.ds),
    datasets: [
      {
        label: "Predicted Price",
        data: data.map((d) => Number(d.yhat)),
        tension: 0.2,
        borderColor: "#6baa75",
        backgroundColor: "rgba(182,206,180,0.10)",
        pointBackgroundColor: "#6baa75",
        pointBorderColor: "#B6CEB4",
        borderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#40624a",
          font: { size: 18, family: "'Aptos Display', sans-serif" }
        }
      },
      tooltip: {
        bodyFont: { family: "'Aptos Display', sans-serif" },
        titleFont: { family: "'Aptos Display', sans-serif" }
      }
    },
    scales: {
      x: {
        ticks: { color: "#40624a", font: { size: 14, family: "'Aptos Display', sans-serif" } },
        grid: { color: "#B6CEB4" }
      },
      y: {
        ticks: { color: "#40624a", font: { size: 14, family: "'Aptos Display', sans-serif" } },
        grid: { color: "#B6CEB4" }
      }
    }
  };

  return (
    <div className="main-gradient">
      <div className="main-container">
        <h2 className="main-title">Potato Price Forecast</h2>
        <div className="main-controls">
          <label>
            Days to predict:&nbsp;
            <input
              type="number"
              className="main-input"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </label>
          <button className="main-btn" onClick={fetchForecast}>
            {loading ? "Loading..." : "Get Forecast"}
          </button>
        </div>
        {data.length > 0 && (
          <>
            <div className="main-card">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="main-table-outer">
              <div className="main-table-scroll">
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Predicted</th>
                      <th>Lower</th>
                      <th>Upper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i}>
                        <td>{r.ds}</td>
                        <td>{Number(r.yhat).toFixed(2)}</td>
                        <td>{Number(r.yhat_lower).toFixed(2)}</td>
                        <td>{Number(r.yhat_upper).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
