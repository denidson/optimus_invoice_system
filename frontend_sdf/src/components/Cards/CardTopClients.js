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
        setClients(response.slice(0, 5));
      } catch (err) {
        console.error("Error cargando top clients", err);
      }
    }
    load();
  }, [cliente_id]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded mb-6">

      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <h6 className="uppercase text-[#4551f7] mb-1 text-xs font-semibold">
          Ranking
        </h6>
        <h2 className="text-slate-700 text-xl font-semibold">
          Top Clientes
        </h2>
      </div>

      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">

          <thead class="thead-light">
            <tr>
              <th className="px-6 bg-slate-50 text-slate-500 align-middle border border-solid border-slate-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Cliente
              </th>
              <th className="px-6 bg-gray-50 text-slate-500 align-middle border border-solid border-slate-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Neto
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="border-t-0 px-6 py-4 align-middle text-sm whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                      {c.cliente_nombre}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {c.cliente_rif}
                    </span>
                  </div>
                </td>

                <td className="border-t-0 px-6 py-4 align-middle text-sm whitespace-nowrap">
                  <span className="font-semibold text-slate-700">
                    ${parseFloat(c.total_neto).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
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
