import React, { useEffect, useState, useContext } from "react";
import { Chart, registerables } from "chart.js";
import { getSalesOverTime } from "../../services/apiReports";
import { AuthContext } from "../../context/AuthContext";

Chart.register(...registerables);

export default function CardBarChart() {
  const { user } = useContext(AuthContext);
  const cliente_id = user?.cliente_id;

  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [filter, setFilter] = useState(""); // filtro de búsqueda

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        const response = await getSalesOverTime(cliente_id);
        const labels = response.data.map((item) => {
          const date = new Date(item.periodo);
          return date.toLocaleString("es-ES", { month: "long" });
        });
        const values = response.data.map((item) => parseFloat(item.neto_total));
        setChartData({ labels, values });
      } catch (error) {
        console.error("Error cargando gráfico:", error);
      }
    }
    loadData();
  }, [cliente_id]);

  // Filtrar por búsqueda
  const filteredLabels = chartData.labels.filter((label) =>
    label.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredValues = chartData.labels
    .map((label, idx) => (filteredLabels.includes(label) ? chartData.values[idx] : null))
    .filter((val) => val !== null);

  // Renderizar gráfico
  useEffect(() => {
    if (!chartData.labels.length) return;

    const ctx = document.getElementById("bar-chart").getContext("2d");
    if (window.salesChart) window.salesChart.destroy();

    window.salesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: filteredLabels,
        datasets: [
          {
            label: "Monto Neto (USD)",
            data: filteredValues,
            backgroundColor: "rgba(66, 153, 225, 0.7)",
            borderRadius: 6,
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: "easeOutQuart" },

        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { color: "#1a202c", font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#1a202c",
            bodyColor: "#2d3748",
            borderColor: "rgba(0,0,0,0.1)",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
          },
        },

        scales: {
          x: {
            title: {
              display: true,
              text: "Mes",
              color: "#4a5568",
              font: { size: 12, weight: "500" },
            },
            ticks: { color: "#4a5568", font: { size: 12 } },
            grid: { display: false },
          },
          y: {
            title: {
              display: true,
              text: "Monto Neto (USD)",
              color: "#4a5568",
              font: { size: 12, weight: "500" },
            },
            ticks: { color: "#4551f7", font: { size: 12 }, beginAtZero: true },
            grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
          },
        },
      },
    });
  }, [chartData, filter]);

  // Función descarga
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "ventas_periodo.png";
    link.href = document.getElementById("bar-chart").toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
      {/* Header */}
      <div className="rounded-t-lg mb-0 px-4 py-3 border-b border-slate-100">
        <h6 className="uppercase text-[#4551f7] mb-1 text-xs font-semibold">Análisis</h6>
        <h2 className="text-slate-700 text-xl font-semibold">Ventas por Periodo</h2>
      </div>

      {/* Filtro + Botón descargar */}
      <div className="flex flex-wrap justify-between items-center px-4 py-3 gap-2">
        <input
          type="text"
          placeholder="Filtrar por mes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#4551f7]"
        />
        <button
          onClick={handleDownload}
          className="bg-[#4551f7] text-white text-sm px-3 py-1 rounded hover:bg-[#3741b7] transition"
        >
          Descargar PNG
        </button>
      </div>

      {/* Chart */}
      <div className="p-4 flex-auto">
        <div className="relative h-80 md:h-96">
          <canvas id="bar-chart"></canvas>
        </div>
      </div>
    </div>
  );
}
