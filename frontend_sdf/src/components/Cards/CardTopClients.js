import { formatDecimal } from "../../utils/formatters";

export default function CardTopClients({
  clients = [],
  limit = 5,
  onChangeLimit,
}) {
  return (
    <div className="flex flex-col bg-white w-full mb-6 shadow-lg rounded-lg h-[380px]">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">
            Ranking
          </h6>
          <h2 className="text-twilight-indigo-700 text-lg font-semibold">
            Top Clientes
          </h2>
        </div>

        <select
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value))}
          className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-twilight-indigo-400"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* COLUMN HEADER */}
      <div className="sticky top-0 bg-twilight-indigo-100 px-4 py-2 text-sm font-semibold text-twilight-indigo-600 flex justify-between">
        <span>CLIENTE</span>
        <span>NETO (Bs.)</span>
      </div>

      {/* LIST */}
      <div className="overflow-y-auto flex-1 text-sm sidebar-scroll">
        {clients.length > 0 ? (
          clients.map((c, i) => (
            <div
              key={i}
              className="px-4 py-2 flex justify-between items-center border-b border-slate-100 hover:bg-twilight-indigo-50 transition-colors"
            >
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-twilight-indigo-700 truncate">
                  {c.cliente_nombre}
                </span>
                <span className="text-twilight-indigo-400 text-[11px]">
                  {c.cliente_rif}
                </span>
              </div>

              <span className="font-semibold text-twilight-indigo-700 whitespace-nowrap">
                {formatDecimal(c.total_neto)}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-twilight-indigo-400">
            No hay clientes registrados
          </div>
        )}
      </div>

    </div>
  );
}
