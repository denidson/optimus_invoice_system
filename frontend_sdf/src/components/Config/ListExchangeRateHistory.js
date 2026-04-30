import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { encryptText } from '../../services/api';
import { getExchangeRateHistory } from '../../services/api_exchange_rate_history';

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Import DataTables styles
import "datatables.net-dt/css/dataTables.dataTables.css";
// Export extensions
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import Papa from 'papaparse';
import { formatDecimalSpecial, formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";
import JSZip from "jszip";
//import { read, utils } from "xlsx";
import * as XLSX from "xlsx";
const { utils } = XLSX;
import { tooltipBtn } from "../../utils/datatableTooltip";

window.JSZip = JSZip;
DataTable.use(DT);

function ListExchangeRateHistory() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("USD");
  useEffect(() => {
    const table = $("#ListExchangeRateHistoryDt").DataTable();

  }, []);

  const actionSearch = async () => {
    const table = $("#ListExchangeRateHistoryDt").DataTable();
    try {
      const response = await getExchangeRateHistory(filterType);
      const data = response.registros.map(item => ({
        ...item,
        moneda: response.moneda
      }));
      table.clear();
      table.rows.add(data);
      table.draw();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Histórico de Tasas de Cambio BCV</h6>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2 mb-3">
                  <h3 class="text-blueGray-700 font-bold me-3 my-3">Móneda:</h3><br/>
                  {/* SELECT PRINCIPAL */}
                  <select id="filter_type" className="border p-2 rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <button
                    className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                    onClick={actionSearch}>
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListExchangeRateHistoryDt"
                className="table-auto w-full text-left items-center w-full bg-transparent border-collapse"
                columns={[
                  { title: "Fecha", data: "fecha_valor", className: "dt-center", render: (data, type, row) => {
                      return formatDate(data);
                    }
                  },
                  { title: "Móneda", data: "moneda", className: "dt-center", render: (data, type, row) => {
                      return formatText(row.moneda);
                    }
                  },
                  { title: "Tasa (Bs.)", data: "tasa", render: (data, type, row) => {
                      return formatDecimalSpecial(data, 4);
                    }
                  },
                ]}
                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: false,
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      const response = await getExchangeRateHistory(filterType);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: response.registros.length,
                        recordsFiltered: response.registros.length,
                        data: response.registros.map(item => ({
                          ...item,
                          moneda: response.moneda
                        })),
                      });
                    } catch (err) {
                      console.error("Error cargando tasas de cambio:", err);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  },
                  paging: true,
                  searching: true,
                  ordering: false,
                  info: true,
                  responsive: true,
                  pageLength: 50,         // cantidad inicial por página
                  lengthMenu: [20, 50, 100], // opciones en el desplegable, false para oculta el selector
                  buttons: [
                    {
                      extend: "collection",
                      text: "Exportar",
                      className: "bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded",
                      buttons: [
                        {
                          extend: "copyHtml5",
                          text: "Copiar",
                          title: "Histórico de tasas de cambio BCV"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Histórico de tasas de cambio BCV",  // título dentro del archivo
                          filename: "Histórico_de_tasas_de_cambio_BCV",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Histórico de tasas de cambio BCV",
                          filename: "Histórico_de_tasas_de_cambio_BCV",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Histórico de tasas de cambio BCV",
                          filename: "Histórico_de_tasas_de_cambio_BCV",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          },
                          orientation: "landscape",
                          //orientation: "landscape",   // opcional
                          //pageSize: "A4"              // opcional
                        },
                        {
                          extend: "print",
                          text: "Imprimir",
                          title: "Histórico de tasas de cambio BCV",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                      ]
                    }
                  ],
                  language: {
                    decimal: ",",
                    thousands: ".",
                    lengthMenu: "Mostrar _MENU_ registros por página",
                    zeroRecords: "No se encontraron resultados",
                    info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "No hay registros disponibles",
                    infoFiltered: "(filtrado de _MAX_ registros totales)",
                    search: "Buscar:",
                    paginate: {
                      first: "Primero",
                      last: "Último",
                      next: "Siguiente",
                      previous: "Anterior"
                    }
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListExchangeRateHistory;
