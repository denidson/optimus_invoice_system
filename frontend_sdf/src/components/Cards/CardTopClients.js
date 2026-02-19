import { formatDecimal } from "../../utils/formatters";

export default function CardTopClients({ clients = [] }) {
  return (
    <div className="relative flex flex-col bg-white w-full mb-6 shadow-lg rounded-lg h-[380px]">
      <div className="rounded-t-lg px-4 py-3 border-b border-slate-100">
        <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">
          Ranking
        </h6>
        <h2 className="text-twilight-indigo-700 text-lg font-semibold">
          Top Clientes
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 px-2 py-1">
        <table className="min-w-full bg-transparent border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-twilight-indigo-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold text-twilight-indigo-600 uppercase border-b">
                Cliente
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-twilight-indigo-600 border-b">
                NETO (Bs.)
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.length > 0 ? (
              clients.map((c, i) => (
                <tr key={i} className="hover:bg-twilight-indigo-50">
                  <td className="px-2 py-1 align-middle">
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-twilight-indigo-700 truncate max-w-[180px]">
                        {c.cliente_nombre}
                      </span>
                      <span className="text-twilight-indigo-400 text-xs">
                        {c.cliente_rif}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-1 align-middle whitespace-nowrap">
                    <span className="font-semibold text-twilight-indigo-700">
                      {formatDecimal(c.total_neto)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-4 text-center text-twilight-indigo-400">
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
