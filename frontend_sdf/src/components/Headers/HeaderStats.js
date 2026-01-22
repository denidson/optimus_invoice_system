import CardStats from "../Cards/CardStats";
import { formatMoney } from "../../utils/formatters";

export default function HeaderStats({ summary, isLoading }) {
  const currency = summary?.currency || "$";

  // Mostrar spinner o valor
  const renderValue = (value) => {
    if (isLoading) {
      return (
        <i className="fas fa-spinner fa-spin text-twilight-indigo-600 text-xl"></i>
      );
    }
    return `${currency} ${formatMoney(value)}`;
  };

  return (
    <div className="relative bg-twilight-indigo-400 md:pt-8 pt-4 pb-4">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 lg:mb-0">
            <CardStats
              statSubtitle="TOTAL FACTURADO (FC)"
              statTitle={renderValue(summary?.total_facturado_fc)}
              statIconName="fas fa-file-invoice-dollar"
              statIconColor="bg-twilight-indigo-500"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 lg:mb-0">
            <CardStats
              statSubtitle="TOTAL NETO GENERAL"
              statTitle={renderValue(summary?.total_neto_general)}
              statIconName="fas fa-chart-line"
              statIconColor="bg-emerald-500"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 xl:mb-0">
            <CardStats
              statSubtitle="TOTAL NOTAS DE CRÉDITO"
              statTitle={renderValue(summary?.total_notas_credito_nc)}
              statIconName="fas fa-arrow-down"
              statIconColor="bg-red-500"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex">
            <CardStats
              statSubtitle="TOTAL NOTAS DE DÉBITO"
              statTitle={renderValue(summary?.total_notas_debito_nd)}
              statIconName="fas fa-arrow-up"
              statIconColor="bg-pacific-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
