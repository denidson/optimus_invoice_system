import React, { useRef, useEffect, useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function CardBarChart({ data = [], currency = "USD", isLoading }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Labels y valores
  const labels = useMemo(() => {
    return data.map((item) => {
      const [year, month] = item.periodo.split("-");
      return new Date(year, month - 1).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    });
  }, [data]);

  const values = useMemo(() => data.map((item) => Number(item.neto_total)), [data]);

  const { filteredLabels, filteredValues } = useMemo(() => {
    if (!filter) return { filteredLabels: labels, filteredValues: values };
    const fL = [];
    const fV = [];
    labels.forEach((l, i) => {
      if (l.toLowerCase().includes(filter.toLowerCase())) {
        fL.push(l);
        fV.push(values[i]);
      }
    });
    return { filteredLabels: fL, filteredValues: fV };
  }, [labels, values, filter]);

  // Crear y actualizar chart
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: filteredLabels,
          datasets: [
            {
              label: currency ? `Monto Neto (${currency})` : "Monto Neto",
              data: filteredValues,
              backgroundColor: "#2a6ed5",
              borderRadius: 6,
              maxBarThickness: 20,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: "top" },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const value = ctx.parsed.y;
                  return `${currency || ""} ${value.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`;
                },
              },
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
    } else {
      chartRef.current.data.labels = filteredLabels;
      chartRef.current.data.datasets[0].data = filteredValues;
      chartRef.current.data.datasets[0].label = currency
        ? `Monto Neto (${currency})`
        : "Monto Neto";
      chartRef.current.update();
    }
  }, [filteredLabels, filteredValues, currency]);

  // Descargar chart
  const downloadChart = (format = "png") => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let mimeType = "image/png";
    if (format === "jpg") mimeType = "image/jpeg";

    const url = canvas.toDataURL(mimeType, 1);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grafico.${format}`;
    link.click();
    setDropdownOpen(false);
  };

  return (
    <div className="relative flex flex-col bg-white w-full mb-6 shadow-lg rounded-lg">
      {/* Header */}
      <div className="rounded-t-lg px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">Análisis</h6>
          <h2 className="text-slate-700 text-xl font-semibold">Ventas por Periodo</h2>
        </div>

        {/* Dropdown de descarga */}
        <div className="relative group">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 bg-twilight-indigo-500 text-white px-3 py-2 rounded text-sm"
          >
            <i className="fas fa-download"></i>
          </button>

          {/* Tooltip estilizado */}
          <span className="absolute bottom-full w-60 mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            Descargar gráfico en formato PNG o JPG
          </span>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-20">
              <button
                onClick={() => downloadChart("png")}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
              >
                PNG
              </button>
              <button
                onClick={() => downloadChart("jpg")}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
              >
                JPG
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Filtro */}
      <div className="flex justify-between items-center px-4 py-3 gap-2">
        <input
          type="text"
          placeholder="Filtrar por mes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm focus:ring-1 focus:ring-twilight-indigo-500"
        />
      </div>

      {/* Chart */}
      <div className="p-4 relative h-56 md:h-64">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <i className="fas fa-spinner fa-spin text-twilight-indigo-600 text-3xl"></i>
          </div>
        )}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
