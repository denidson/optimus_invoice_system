import CardStats from "../Cards/CardStats";
import { formatMoney } from "../../utils/formatters";

export default function HeaderStats({ summary, isLoading, collapsed }) {
  const renderValue = (value) => {
    if (isLoading) {
      return (
        <i className="fas fa-spinner fa-spin text-twilight-indigo-600 text-xl"></i>
      );
    }
    return `${formatMoney(value)}`;
  };

  return (
    <div className="relative bg-twilight-indigo-400 pt-4 md:pt-8 pb-4">
      <div className="px-4 md:px-10 mx-auto w-full">

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <CardStats
            collapsed={collapsed}
            statSubtitle="TOTAL NETO GENERAL"
            statTitle={renderValue(summary?.total_neto_general)}
            statIconName="fas fa-chart-line"
            statIconColor="bg-emerald-500"
          />

          <CardStats
            collapsed={collapsed}
            statSubtitle="TOTAL FACTURADO"
            statTitle={renderValue(summary?.total_facturado_fc)}
            statIconName="fas fa-file-invoice-dollar"
            statIconColor="bg-twilight-indigo-500"
          />

          <CardStats
            collapsed={collapsed}
            statSubtitle="TOTAL NOTAS DE CRÉDITO"
            statTitle={renderValue(summary?.total_notas_credito_nc)}
            statIconName="fas fa-arrow-down"
            statIconColor="bg-red-500"
          />

          <CardStats
            collapsed={collapsed}
            statSubtitle="TOTAL NOTAS DE DÉBITO"
            statTitle={renderValue(summary?.total_notas_debito_nd)}
            statIconName="fas fa-arrow-up"
            statIconColor="bg-pacific-blue-500"
          />

        </div>
      </div>
    </div>
  );
}