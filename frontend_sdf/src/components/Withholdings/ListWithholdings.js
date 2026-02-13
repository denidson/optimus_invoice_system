import React, { useState, useEffect } from "react";
import { getAllWithholdings, showWithholding } from "../../services/apiWithholdings";
import ModalWithholding from "./ModalWithholding";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import JSZip from "jszip";
//import { utils, write } from "xlsx";
import * as XLSX from "xlsx";
const { utils, write } = XLSX;
import { formatMoney, formatDate, formatDateTime, formatText, formatFiscalPeriod } from "../../utils/formatters";
import { tooltipBtn } from "../../utils/datatableTooltip";

window.JSZip = JSZip;
DataTable.use(DT);

function ListWithholdings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithholding, setSelectedWithholding] = useState(null);
  const [filterType, setFilterType] = useState("");
  var responseCache = useState(false);
  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";

  const redirectToCreate = () => {
    window.location.href = "/withholdings/create";
  };

  // ----------------------
  // Event listeners DataTable
  // ----------------------
  useEffect(() => {
    const table = $("#ListWithholdingsDt").DataTable();

    $("#ListWithholdingsDt tbody").on("click", "button.btn-view", async function () {
      const id = $(this).data("id");
      try {
        const data = await showWithholding(id);
        setSelectedWithholding(data);
        setModalOpen(true);
      } catch {
        toast.error("Error al consultar la Retención");
      }
    });

    return () => {
      $("#ListWithholdingsDt tbody").off("click", "button.btn-view");
    };
  }, []);

  const actionSearch = () => {
    const table = $("#ListWithholdingsDt").DataTable();
    table.clear();
    table.search("");
    table.columns().search("");
    table.ajax.reload();
  };

  const handleCloseModal = () => setModalOpen(false);

  var columns= [];
  var targets;

  columns.push({
    title: "Fecha Emision",
    data: "fecha_emision",
    className: "dt-center",
    render: (data, type, row) => {
      return formatDate(data);
    }
  });
  if (rol == 'admin'){
    targets = [3, 7];
    columns.push({ title: "RIF (Afiliada)", data: "cliente.rif", className: "dt-center", render: (data, type, row) => {
        return formatText(data);
      }
    });
    columns.push({ title: "Nombre (Afiliada)", data: "cliente.nombre_empresa", render: (data, type, row) => {
        return formatText(data);
      }
    });
  }else{
    targets = [1];
  }
  columns.push({ title: "Periodo Fiscal", data: "periodo_fiscal", className: "dt-center", render: (data, type, row) => {
      return formatFiscalPeriod(data);
    }
  });
  columns.push({ title: "Nro. Comprobante", data: "numero_comprobante", className: "dt-center", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({ title: "RIF", data: "sujeto_retenido.rif", className: "dt-center", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({ title: "Sujeto Retenido", data: "sujeto_retenido.nombre", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({
    title: "Base Imponible (Bs.)",
    data: "monto_base_total",
    /*render: (data, type, row) => {
      return formatMoney(data);
    }*/
    render: (data, type) =>
      type === "display"
        ? `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(data)}`
        : data,
  });
  columns.push({
    title: "Monto Retenido (Bs.)",
    data: "monto_retenido_total",
    /*render: (data, type, row) => {
      return formatMoney(data);
    }*/
    render: (data, type) =>
      type === "display"
        ? `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(data)}`
        : data,
  });
  columns.push({ title: "Estatus", data: "estatus", className: "dt-center", render: (data, type, row) => {
      if (data == 'emitido'){
        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText(data);
      }else if (data == 'normal'){
        return '<i class="fas fa-circle text-orange-500 mr-2"></i> ' + formatText(data);
      } else {
        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText(data);
      }
    }
  });
  columns.push({ title: "Estatus SENIAT", data: "estatus_seniat", className: "dt-center", render: (data, type, row) => {
      if (data == 'emitido'){
        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText(data);
      }else if (data == 'pendiente'){
        return '<i class="fas fa-circle text-orange-500 mr-2"></i> ' + formatText(data);
      } else {
        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText(data);
      }
    }
  });
  columns.push({
    title: "Acciones",
    orderable: false,
    searchable: false,
    className: 'no-export',
    render: (data, type, row) => {
      let tooltipText = 'Ver retenciones';
      const viewBtn = tooltipBtn({
        html: `
          <button class="btn-view px-2 py-1 text-gray-700"
            data-id="${row.id}">
            <i class="fa-solid fa-lg fa-expand"></i>
          </button>
        `,
        text: tooltipText
      });
      // const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
      return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
    }
  });

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Retenciones</h6>
              <div className="flex space-x-3">
                {/* Filtros */}
                <div className="flex space-x-2 mb-3">
                  <h3 class="text-blueGray-700 font-bold me-3 my-3">Buscar por:</h3><br/>
                  <select
                    className="border p-2 rounded"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="numero_comprobante">Nro. Comprobante</option>
                    <option value="sujeto_retenido_rif">RIF del sujeto retenido</option>
                    <option value="periodo_fiscal">Periodo Fiscal</option>
                  </select>

                  {filterType === "numero_comprobante" && (
                    <input
                      id="filtro_numero_comprobante"
                      className="border p-2 rounded"
                      placeholder="Ej: 20251100001"
                    />
                  )}
                  {filterType === "sujeto_retenido_rif" && (
                    <input
                      id="filtro_rif"
                      className="border p-2 rounded"
                      placeholder="J-12345678-9"
                    />
                  )}
                  {filterType === "periodo_fiscal" && (
                    <input
                      id="filtro_periodo"
                      type="month"
                      className="border p-2 rounded"
                    />
                  )}
                  {/* Botón Buscar */}
                  <button
                    className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                    onClick={actionSearch}
                  >
                    Buscar
                  </button>
                  {/* Botón Crear Retención */}
                  <button
                    className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                    onClick={redirectToCreate}
                  >
                    Crear Retención
                  </button>
                </div>
                {/* <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                  Importar Excel/CSV
                  <input type="file" className="hidden" />
                </label> */}
              </div>
            </div>
            {/* Body */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              {/* DataTable */}
              <DataTable
                id="ListWithholdingsDt"
                className="table-auto w-full text-left"
                columns={columns}
                options={{
                  columnDefs:[{
                    targets: targets, // índices de columnas a ocultar (ej: RIF, Zona)
                    visible: false,
                    searchable: true // siguen siendo buscables
                  }],
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: true, // si es true la paginación se debe controlar a traves del servidor
                  searching: true,
                  processing: true,
                  ajax: async (params, callback) => {
                    try {
                      const searchValue = params.search?.value?.toLowerCase() || '';
                      const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;
                      const query = { page, per_page };

                      if (searchValue == ''){
                        //console.log('if');
                        if (filterType === "numero_comprobante" && $("#filtro_numero_comprobante").val())
                          query.numero_comprobante = $("#filtro_numero_comprobante").val();
                        if (filterType === "sujeto_retenido_rif" && $("#filtro_rif").val())
                          query.sujeto_retenido_rif = $("#filtro_rif").val();
                        if (filterType === "periodo_fiscal" && $("#filtro_periodo").val())
                          query.periodo_fiscal = $("#filtro_periodo").val();

                        const response = await getAllWithholdings(query);

                        // Respaldar response anterior
                        responseCache = response;
                        //console.log('responseCache: ', responseCache);

                        // Aseguramos que la estructura esperada esté presente
                        var { data, total } = response;
                      }else{
                        //console.log('else');
                        const CAMPOS_EXCLUIDOS = [
                          "created_at",
                          "updated_at"
                        ];
                        //console.log('responseCache: ', responseCache);
                        var filteredData = responseCache.data.filter(item =>
                          Object.entries(item).some(([key, value]) => {
                            // Excluir campos internos
                            if (CAMPOS_EXCLUIDOS.includes(key)) return false;

                            if (!value) return false;

                            // Si es campo de fecha
                            if (key.includes("fecha_emision")) {
                              /*console.log('fecha_factura: ', value);
                              console.log('searchValue: ', searchValue);
                              console.log('formatDate: ', formatDate(value));*/
                              return formatDate(value).includes(searchValue.toUpperCase());
                            }

                            return String(value).toUpperCase().includes(searchValue.toUpperCase());
                          })
                        );
                        //console.log('filteredData: ', filteredData);
                        var data = filteredData;
                        var total = filteredData.length;
                        //var { data, total } = responseCache;
                      }

                      callback({
                        draw: params.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data,
                      });
                    } catch {
                      callback({ draw: params.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                    }
                  },
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
                          title: "Lista de Retenciones",   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de Retenciones",
                          filename: "Lista_Retenciones",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de Retenciones",
                          filename: "Lista_Retenciones",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de Retenciones",
                          filename: "Lista_Retenciones",
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
                          title: "Lista de Retenciones",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          text: "Exportar todo (Excel)",
                          title: "Lista de Retenciones",
                          filename: "Lista_Retenciones",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          },
                          action: async function (e, dt, node) {
                            try {
                              const allData = [];
                              let page = 1;
                              let totalPages = 1;
                              do {
                                const resp = await getAllWithholdings({ page, per_page: 100 });
                                allData.push(...resp.data);
                                totalPages = Math.ceil(resp.total / 100);
                                page++;
                              } while (page <= totalPages);

                              const wb = utils.book_new();
                              var ws;
                              if (rol == 'admin'){
                                ws = utils.json_to_sheet(
                                  allData.map((r) => ({
                                    "Fecha": formatDate(r.fecha_emision),
                                    "RIF (Empresa)": formatText(r.cliente.rif),
                                    "Nombre (Empresa)": formatText(r.cliente.nombre_empresa),
                                    "Periodo Fiscal": formatFiscalPeriod(r.periodo_fiscal),
                                    "Nro. Comprobante": formatText(r.numero_comprobante),
                                    "RIF": formatText(r.sujeto_retenido.rif),
                                    "Sujeto Retenido": formatText(r.sujeto_retenido.nombre),
                                    "Base Imponible": formatMoney(r.monto_base_total),
                                    "Monto Retenido": formatMoney(r.monto_retenido_total),
                                    "Estatus": formatText(r.estatus),
                                    "Estatus SENIAT": formatText(r.estatus_seniat),
                                  }))
                                );
                              }else{
                                ws = utils.json_to_sheet(
                                  allData.map((r) => ({
                                    "Fecha": formatDate(r.fecha_emision),
                                    "Periodo Fiscal": formatFiscalPeriod(r.periodo_fiscal),
                                    "Nro. Comprobante": formatText(r.numero_comprobante),
                                    "RIF": formatText(r.sujeto_retenido.rif),
                                    "Sujeto Retenido": formatText(r.sujeto_retenido.nombre),
                                    "Base Imponible": formatMoney(r.monto_base_total),
                                    "Monto Retenido": formatMoney(r.monto_retenido_total),
                                    "Estatus": formatText(r.estatus),
                                    "Estatus SENIAT": formatText(r.estatus_seniat),
                                  }))
                                );
                              }
                              utils.book_append_sheet(wb, ws, "Retenciones");
                              const blob = new Blob([write(wb, { bookType: "xlsx", type: "array" })]);
                              const link = document.createElement("a");
                              link.href = URL.createObjectURL(blob);
                              link.download = "Retenciones.xlsx";
                              link.click();
                              toast.success("Archivo exportado correctamente");
                            } catch {
                              toast.error("Error al exportar");
                            }
                          },
                        }
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
                  pageLength: 20,
                  lengthMenu: [20, 50, 100],
                  paging: true,
                  ordering: true,
                  info: true,
                  scrollx: true,
                  responsive: true,
                }}
              />

              {modalOpen && 
                <ModalWithholding 
                  data={selectedWithholding} 
                  onClose={handleCloseModal} 
                />
              }
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListWithholdings;
