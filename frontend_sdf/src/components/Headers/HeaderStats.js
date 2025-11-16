// import React from "react";

// components

// import CardStats from "../Cards/CardStats.js";

// export default function HeaderStats() {
//   return (
//     <>
//       {/* Header */}
//       <div className="relative bg-[#4551f7] md:pt-32 pb-32 pt-12">
//         <div className="px-4 md:px-10 mx-auto w-full">
//           <div>
//             {/* Card stats */}
//             <div className="flex flex-wrap">
//               <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
//                 <CardStats
//                   statSubtitle="TRAFFIC"
//                   statTitle="350,897"
//                   statArrow="up"
//                   statPercent="3.48"
//                   statPercentColor="text-emerald-500"
//                   statDescripiron="Since last month"
//                   statIconName="far fa-chart-bar"
//                   statIconColor="bg-red-500"
//                 />
//               </div>
//               <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
//                 <CardStats
//                   statSubtitle="NEW USERS"
//                   statTitle="2,356"
//                   statArrow="down"
//                   statPercent="3.48"
//                   statPercentColor="text-red-500"
//                   statDescripiron="Since last week"
//                   statIconName="fas fa-chart-pie"
//                   statIconColor="bg-orange-500"
//                 />
//               </div>
//               <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
//                 <CardStats
//                   statSubtitle="SALES"
//                   statTitle="924"
//                   statArrow="down"
//                   statPercent="1.10"
//                   statPercentColor="text-orange-500"
//                   statDescripiron="Since yesterday"
//                   statIconName="fas fa-users"
//                   statIconColor="bg-pink-500"
//                 />
//               </div>
//               <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
//                 <CardStats
//                   statSubtitle="PERFORMANCE"
//                   statTitle="49,65%"
//                   statArrow="up"
//                   statPercent="12"
//                   statPercentColor="text-emerald-500"
//                   statDescripiron="Since last month"
//                   statIconName="fas fa-percent"
//                   statIconColor="bg-sky-500"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useState, useEffect, useContext } from "react"; 
import { 
  getSalesSummary,
  getTopClients
} from "../../services/apiReports";

import CardStats from "../Cards/CardStats.js";
import { AuthContext } from "../../context/AuthContext";

export default function HeaderStats() {
  const { user } = useContext(AuthContext);
  const rol = user?.rol;  
  const cliente_id = user?.cliente_id;

  const [summary, setSummary] = useState(null);
  const [topClients, setTopClients] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const summaryData = await getSalesSummary(cliente_id);
        const clientsData = await getTopClients(cliente_id);
        setSummary(summaryData);
        setTopClients(clientsData.slice(0, 5));
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      }
    }

    fetchData();
  }, [rol, cliente_id]);

  if (!summary) return <p className="text-white p-4">Cargando datos...</p>;

  return (
    <>
      <div className="relative bg-[#4551f7] md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">

          <div className="flex flex-wrap">

            {/* Total Facturado */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="TOTAL FACTURADO (FC)"
                statTitle={`$${summary.total_facturado_fc}`}
                statIconName="fas fa-file-invoice-dollar"
                statIconColor="bg-emerald-500"
              />
            </div>

            {/* Total Neto General */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="TOTAL NETO GENERAL"
                statTitle={`$${summary.total_neto_general}`}
                statIconName="fas fa-dollar-sign"
                statIconColor="bg-blue-500"
              />
            </div>

            {/* Notas de Crédito */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="NOTAS DE CRÉDITO (NC)"
                statTitle={`$${summary.total_notas_credito_nc}`}
                statIconName="fas fa-arrow-down"
                statIconColor="bg-red-500"
              />
            </div>

            {/* Notas de Débito */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="NOTAS DE DÉBITO (ND)"
                statTitle={`$${summary.total_notas_debito_nd}`}
                statIconName="fas fa-arrow-up"
                statIconColor="bg-orange-500"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

