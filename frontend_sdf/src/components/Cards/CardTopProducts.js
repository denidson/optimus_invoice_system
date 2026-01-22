import { formatMoney } from "../../utils/formatters";

export default function CardTopProducts({ products = [] }) {
  return (
    <div className="relative flex flex-col bg-white w-full shadow-lg rounded-lg h-[380px]">
      <div className="rounded-t-lg px-4 py-3 border-b border-slate-100">
        <h6 className="uppercase text-twilight-indigo-500 text-xs font-semibold">
          Ranking
        </h6>
        <h2 className="text-twilight-indigo-700 text-lg font-semibold">
          Top Productos
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 px-2 py-1">
        <table className="min-w-full bg-transparent border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-twilight-indigo-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold text-twilight-indigo-600 uppercase border-b">
                Producto
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-twilight-indigo-600 uppercase border-b">
                Ventas
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((p, i) => (
                <tr key={i} className="hover:bg-twilight-indigo-50">
                  <td className="px-2 py-1 align-middle">
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-twilight-indigo-700 truncate max-w-[180px]">
                        {p.producto_nombre}
                      </span>
                      <span className="text-twilight-indigo-400 text-xs">
                        {p.producto_sku}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-1 align-middle whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-twilight-indigo-700">
                        {p.currency} {formatMoney(p.total_ventas)}
                      </span>
                      <span className="text-xs text-twilight-indigo-400">
                        {p.total_unidades} unidades
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-4 text-center text-twilight-indigo-400">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
