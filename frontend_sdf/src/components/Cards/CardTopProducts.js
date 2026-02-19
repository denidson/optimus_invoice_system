import { formatDecimal } from "../../utils/formatters";

export default function CardTopProducts({
  products = [],
  limit = 5,
  onChangeLimit,
}) {
  return (
    <div className="flex flex-col bg-white w-full shadow-lg rounded-lg h-[380px]">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">
            Ranking
          </h6>
          <h2 className="text-twilight-indigo-700 text-lg font-semibold">
            Top Productos/Servicios
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
      <div className="bg-twilight-indigo-100 px-4 py-2 text-xs font-semibold text-twilight-indigo-600 flex justify-between">
        <span>PRODUCTO</span>
        <span>VENTAS (Bs.)</span>
      </div>

      {/* LIST */}
      <div className="overflow-y-auto flex-1 text-sm sidebar-scroll">
        {products.length > 0 ? (
          products.map((p, i) => (
            <div
              key={i}
              className="px-4 py-1.5 flex justify-between items-center border-b border-slate-100 hover:bg-twilight-indigo-50 transition-colors"
            >
              {/* PRODUCT INFO */}
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-twilight-indigo-700 truncate">
                  {p.producto_nombre}
                </span>
                <span className="text-[11px] text-twilight-indigo-400">
                  {p.producto_sku}
                </span>
              </div>

              {/* SALES INFO */}
              <div className="flex flex-col items-end whitespace-nowrap">
                <span className="font-semibold text-twilight-indigo-700">
                  {formatDecimal(p.total_ventas)}
                </span>
                <span className="text-[11px] text-twilight-indigo-400">
                  {p.total_unidades} unidades
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-twilight-indigo-400">
            No hay productos registrados
          </div>
        )}
      </div>
    </div>
  );
}
