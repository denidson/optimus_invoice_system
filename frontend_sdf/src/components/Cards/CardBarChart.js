import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function CardBarChart({ data = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [filter, setFilter] = useState("");

  // Transformar datos recibidos
  const labels = data.map((item) => {
    const date = new Date(item.periodo);
    return date.toLocaleString("es-ES", { month: "long" });
  });

  const values = data.map((item) => Number(item.neto_total));

  // Filtrar por texto
  const filteredLabels = labels.filter((label) =>
    label.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredValues = labels
    .map((label, idx) =>
      filteredLabels.includes(label) ? values[idx] : null
    )
    .filter((v) => v !== null);

  // Crear / actualizar gráfico
  useEffect(() => {
    if (!canvasRef.current || !filteredLabels.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: filteredLabels,
        datasets: [
          {
            label: "Monto Neto (USD)",
            data: filteredValues,
            backgroundColor: "#2a6ed5", // twilight-indigo-500
            borderRadius: 6,
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#1a202c",
              font: { size: 12 },
            },
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
            ticks: {
              color: "#4a5568",
              font: { size: 12 },
            },
            grid: { display: false },
          },
          y: {
            title: {
              display: true,
              text: "Monto Neto (USD)",
              color: "#4a5568",
              font: { size: 12, weight: "500" },
            },
            ticks: {
              color: "#2a6ed5", // twilight-indigo-500
              font: { size: 12 },
              beginAtZero: true,
            },
            grid: {
              color: "rgba(0,0,0,0.05)",
              drawBorder: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [filteredLabels, filteredValues]);

  // Descargar imagen
  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = "ventas_periodo.png";
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
      {/* Header */}
      <div className="rounded-t-lg mb-0 px-4 py-3 border-b border-slate-100">
        <h6 className="uppercase text-twilight-indigo-500 mb-1 text-xs font-semibold">
          Análisis
        </h6>
        <h2 className="text-slate-700 text-xl font-semibold">
          Ventas por Periodo
        </h2>
      </div>

      {/* Filtro + Descargar */}
      <div className="flex flex-wrap justify-between items-center px-4 py-3 gap-2">
        <input
          type="text"
          placeholder="Filtrar por mes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-twilight-indigo-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-twilight-indigo-500"
        />
        <button
          onClick={handleDownload}
          className="bg-twilight-indigo-500 text-white text-sm px-3 py-1 rounded hover:bg-twilight-indigo-600 transition"
        >
          Descargar PNG
        </button>
      </div>

      {/* Chart */}
      <div className="p-4 flex-auto">
        <div className="relative h-56 md:h-64">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
