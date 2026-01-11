import CardStats from "../Cards/CardStats";

export default function HeaderStats({ summary }) {
  if (!summary) return null;

  return (
    <div className="relative bg-[#4551f7] md:pt-8 pt-4 pb-4">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap -mx-4">
          {/* Cada contenedor tiene flex para que el card crezca */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 lg:mb-0">
            <CardStats
              statSubtitle="TOTAL FACTURADO (FC)"
              statTitle={`$${summary.total_facturado_fc}`}
              statIconName="fas fa-file-invoice-dollar"
              statIconColor="bg-emerald-500"
              className="flex-1"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 lg:mb-0">
            <CardStats
              statSubtitle="TOTAL NETO GENERAL"
              statTitle={`$${summary.total_neto_general}`}
              statIconName="fas fa-dollar-sign"
              statIconColor="bg-blue-500"
              className="flex-1"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex mb-4 xl:mb-0">
            <CardStats
              statSubtitle="TOTAL NOTAS DE CRÉDITO"
              statTitle={`$${summary.total_notas_credito_nc}`}
              statIconName="fas fa-arrow-down"
              statIconColor="bg-red-500"
              className="flex-1"
            />
          </div>

          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 flex">
            <CardStats
              statSubtitle="TOTAL NOTAS DE DÉBITO"
              statTitle={`$${summary.total_notas_debito_nd}`}
              statIconName="fas fa-arrow-up"
              statIconColor="bg-orange-500"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}