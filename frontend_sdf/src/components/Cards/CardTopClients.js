import React, { useEffect, useState, useContext } from "react";
import { getTopClients } from "../../services/apiReports";
import { AuthContext } from "../../context/AuthContext";

export default function CardTopClients() {
  const { user } = useContext(AuthContext);
  const cliente_id = user?.cliente_id;

  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await getTopClients(cliente_id);
        setClients(response.slice(0, 10)); // aumentar número para scroll si hay muchos
      } catch (err) {
        console.error("Error cargando top clients", err);
      }
    }
    load();
  }, [cliente_id]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
      
      {/* Header */}
      <div className="rounded-t-lg mb-0 px-4 py-3 border-b border-slate-100">
        <h6 className="uppercase text-[#4551f7] mb-1 text-xs font-semibold">Ranking</h6>
        <h2 className="text-slate-700 text-xl font-semibold">Top Clientes</h2>
      </div>

      {/* Tabla con scroll */}
      <div className="overflow-y-auto max-h-96">
        <table className="min-w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                Neto
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.length > 0 ? (
              clients.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{c.cliente_nombre}</span>
                      <span className="text-slate-400 text-xs">{c.cliente_rif}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <span className="font-semibold text-slate-700">
                      ${parseFloat(c.total_neto).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-4 text-center text-slate-400">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
