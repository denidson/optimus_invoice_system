import React, { useRef, useEffect, useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function CardBarChart({ data = [], currency = "USD", isLoading }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [filter, setFilter] = useState("");

  const labels = useMemo(
    () =>
      data.map((item) => {
        const [year, month] = item.periodo.split("-");
        return new Date(year, month - 1).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });
      }),
    [data]
  );

  const values = useMemo(
    () => data.map((item) => Number(item.neto_total)),
    [data]
  );

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

  useEffect(() => {
    if (!canvasRef.current || chartRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: `Monto Neto (${currency})`,
            data: [],
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
              label: (ctx) =>
                `${currency} ${ctx.parsed.y.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });
  }, [currency]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.labels = filteredLabels;
    chartRef.current.data.datasets[0].data = filteredValues;
    chartRef.current.update();
  }, [filteredLabels, filteredValues]);

  return (
    <div className="relative flex flex-col bg-white w-full mb-6 shadow-lg rounded-lg">
      <div className="rounded-t-lg px-4 py-3 border-b">
        <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">
          Análisis
        </h6>
        <h2 className="text-slate-700 text-xl font-semibold">
          Ventas por Periodo
        </h2>
      </div>

      <div className="flex justify-between items-center px-4 py-3 gap-2">
        <input
          type="text"
          placeholder="Filtrar por mes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm focus:ring-1 focus:ring-twilight-indigo-500"
        />
      </div>

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
