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
import { utils, write } from "xlsx";

window.JSZip = JSZip;
DataTable.use(DT);

function ListWithholdings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithholding, setSelectedWithholding] = useState(null);
  const [filterType, setFilterType] = useState("");

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
    $("#ListWithholdingsDt").DataTable().ajax.reload();
  };

  const handleCloseModal = () => setModalOpen(false);

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
              <div className="flex items-center space-x-3">
                <button
                  className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                  onClick={redirectToCreate}
                >
                  Crear Retención
                </button>
                {/* <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                  Importar Excel/CSV
                  <input type="file" className="hidden" />
                </label> */}
              </div>
            </div>
            {/* Filtros */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <div className="flex space-x-2 mb-3">
                <h3 class="text-blueGray-700 font-bold me-3">Buscar por:</h3><br/>
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

                <button
                  className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                  onClick={actionSearch}
                >
                  Buscar
                </button>
              </div>

              {/* DataTable */}
              <DataTable
                id="ListWithholdingsDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "Nro. Comprobante", data: "numero_comprobante" },
                  { title: "Sujeto Retenido", data: "sujeto_retenido.nombre" },
                  { title: "RIF", data: "sujeto_retenido.rif" },
                  { title: "Periodo Fiscal", data: "periodo_fiscal" },
                  {
                    title: "Base Imponible",
                    data: "monto_base_total",
                    render: (data, type) =>
                      type === "display"
                        ? `Bs. ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(data)}`
                        : data,
                  },
                  {
                    title: "Monto Retenido",
                    data: "monto_retenido_total",
                    render: (data, type) =>
                      type === "display"
                        ? `Bs. ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(data)}`
                        : data,
                  },
                  { title: "Estatus", data: "estatus", className: "capitalize" },
                  {
                    title: "Acciones",
                    data: null,
                    render: (row) =>
                      `<button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-expand"></i></button>`,
                  },
                ]}
                options={{
                  serverSide: true,
                  processing: true,
                  ajax: async (params, callback) => {
                    try {
                      const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;
                      const query = { page, per_page };

                      if (filterType === "numero_comprobante" && $("#filtro_numero_comprobante").val())
                        query.numero_comprobante = $("#filtro_numero_comprobante").val();
                      if (filterType === "sujeto_retenido_rif" && $("#filtro_rif").val())
                        query.sujeto_retenido_rif = $("#filtro_rif").val();
                      if (filterType === "periodo_fiscal" && $("#filtro_periodo").val())
                        query.periodo_fiscal = $("#filtro_periodo").val();

                      const response = await getAllWithholdings(query);
                      callback({
                        draw: params.draw,
                        recordsTotal: response.total,
                        recordsFiltered: response.total,
                        data: response.data,
                      });
                    } catch {
                      callback({ draw: params.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                    }
                  },
                  
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                      "<'row'<'col-sm-12 text-center'B>>" +                // Fila 2: botones ocupando todo el ancho
                      "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                      "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                      "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>", 
                  buttons: [
                    { extend: "excelHtml5", text: "Excel", title: "Lista de Retenciones", filename: "Lista_Retenciones" },
                    { extend: "csvHtml5", text: "CSV", title: "Lista de Retenciones", filename: "Lista_Retenciones" },
                    { extend: "print", text: "Imprimir", title: "Lista de Retenciones" },
                    {
                      text: "Exportar todo (Excel)",
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
                          const ws = utils.json_to_sheet(
                            allData.map((r) => ({
                              "Nro. Comprobante": r.numero_comprobante,
                              "Sujeto Retenido": r.sujeto_retenido.nombre,
                              "RIF": r.sujeto_retenido.rif,
                              "Periodo Fiscal": r.periodo_fiscal,
                              "Base Imponible": r.monto_base_total,
                              "Monto Retenido": r.monto_retenido_total,
                              "Estatus": r.estatus,
                            }))
                          );
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
                    },
                  ],
                  language: {
                    decimal: ",",
                    thousands: ".",
                    lengthMenu: "Mostrar _MENU_ registros por página",
                    zeroRecords: "No se encontraron resultados",
                    info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "No hay registros disponibles",
                    infoFiltered: "(filtrado de _MAX_ registros totales)",
                    paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
                  },
                  pageLength: 20,
                  lengthMenu: [20, 50, 100],
                  paging: true,
                  searching: false,
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
