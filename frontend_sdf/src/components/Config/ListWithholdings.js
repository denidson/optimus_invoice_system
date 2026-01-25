import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { encryptText } from '../../services/api';
import { getWithholdings } from "../../services/apiConfig"; 

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Import DataTables styles
import "datatables.net-dt/css/dataTables.dataTables.css";
// Export extensions
// import "datatables.net-buttons/js/dataTables.buttons";
// import "datatables.net-buttons-dt/css/buttons.dataTables.css";
// import "datatables.net-buttons/js/buttons.html5";
// import "datatables.net-buttons/js/buttons.print";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";

window.JSZip = JSZip;
DataTable.use(DT);

function ListWithholdings() {
  const navigate = useNavigate();

  useEffect(() => {
    const table = $("#ListWithholdingsDt").DataTable();

  }, []);

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Retenciones</h6>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListWithholdingsDt"
                className="table-auto w-full text-left items-center w-full bg-transparent border-collapse"
                columns={[
                  { title: "Descripción", data: "descripcion", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Código Seniat", data: "codigo_seniat", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Porcentaje (%)", data: "porcentaje", render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  }
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
                      const response = await getWithholdings();
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: response.length,
                        recordsFiltered: response.length,
                        data: response
                      });
                    } catch (err) {
                      console.error(err);
                    }
                  },
                  paging: true,
                  searching: true,
                  ordering: true,
                  info: true,
                  responsive: true,
                  pageLength: 20,         // cantidad inicial por página
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
                          title: "Lista de retenciones"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de retenciones",  // título dentro del archivo
                          filename: "Lista_retenciones",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de retenciones",
                          filename: "Lista_retenciones",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de retenciones",
                          filename: "Lista_retenciones",
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
                          title: "Lista de retenciones",
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

export default ListWithholdings;
