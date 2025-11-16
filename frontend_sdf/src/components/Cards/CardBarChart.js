import React, { useEffect, useState, useContext } from "react";
import { Chart, registerables } from "chart.js";
import { getSalesOverTime } from "../../services/apiReports";
import { AuthContext } from "../../context/AuthContext";

Chart.register(...registerables);

export default function CardBarChart() {
  const { user } = useContext(AuthContext);
  const cliente_id = user?.cliente_id;

  const [chartData, setChartData] = useState([]);

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

  useEffect(() => {
    if (!chartData.labels) return;

    const ctx = document.getElementById("bar-chart").getContext("2d");

    if (window.salesChart) {
      window.salesChart.destroy();
    }

    window.salesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Monto Neto",
            data: chartData.values,
            backgroundColor: "rgba(66, 153, 225, 0.7)", // azul estilo Notus
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
            display: false,
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
            ticks: {
              color: "#4a5568",
              font: { size: 12 },
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: "#4551f7",
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
  }, [chartData]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="w-full">
            <h6 className="uppercase text-[#4551f7] mb-1 text-xs font-semibold">
              Análisis
            </h6>
            <h2 className="text-slate-700 text-xl font-semibold">
              Ventas por Periodo
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 flex-auto">
        <div className="relative h-96">
          <canvas id="bar-chart"></canvas>
        </div>
      </div>
    </div>
  );

}
