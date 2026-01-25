import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { getEndClients, deleteEndClient, showEndClient, createEndClient } from '../../services/api_end_clients';
import { AuthContext } from "../../context/AuthContext";
import { getTypeTaxpayer } from "../../services/api_type_taxpayer";
import { encryptText } from '../../services/api';
import ModalConfirmation from "../Modals/ModalConfirmation";
import ModalEndClients from "./ModalEndClients";
import ModalImportPreviewClientsForm from "../Modals/ModalImportPreviewClients";
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
import * as XLSX from "xlsx";
const { read, utils } = XLSX;
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";
import Papa from 'papaparse';
window.JSZip = JSZip;
DataTable.use(DT);

function ListEndClients() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenClients, setModalOpenClients] = useState(false);
  const [clientIdToDeactivate, setClientIdToDeactivate] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const { user } = useContext(AuthContext);
  var responseCache = useState(false);
  const rol = user?.rol;

  // DataTable listeners
  useEffect(() => {
    const table = $("#ListClientDt").DataTable();

    $("#ListClientDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    $("#ListClientDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      const action = $(this).data("action");
      handleOpenModal(id, nombre, action);
    });

    $("#ListClientDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      console.log('btn-view: ', id);
      handleOpenModalClients(id);
    });

    return () => {
      $("#ListClientDt tbody").off("click", "button.btn-edit");
      $("#ListClientDt tbody").off("click", "button.btn-delete");
      $("#ListClientDt tbody").off("click", "button.btn-view");
    };
  }, []);

  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/endclients/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => navigate(`/endClients/create`);

  const handleAction = async (id, action) => {
    try {
      let data;
      if (action === 'delete') {
        data = await deleteEndClient(id);
      } /*else {
        data = await activateClient(id);
      }*/
      toast.success(data.mensaje, { onClose: () => setTimeout(() => refreshClients(), 3000) });
    } catch {
      toast.error("Error al actualizar el cliente");
    }
  };

  const refreshClients = async () => location.reload(true);

  const handleConfirm = () => {
    if (clientIdToDeactivate) {
      handleAction(clientIdToDeactivate.id, clientIdToDeactivate.action);
      setModalOpen(false);
    }
  };

  const handleOpenModal = (id, nombre, action) => {
    setClientIdToDeactivate({ id, nombre, action });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleOpenModalClients = async (id) => {
    try {
      console.log('handleOpenModalClients-id: ', id);
      const data = await showEndClient(id);
      console.log('handleOpenModalClients-data: ', data);
      setClientIdToDeactivate(data);
      setModalOpenClients(true);
    } catch {
      toast.error("Error al consultar los datos del cliente.");
    }
  };

  const handleCloseModalClients = () => setModalOpenClients(false);

  // lectura del archivo e invocación de la modal
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setImportData(results.data);
          setIsImportModalOpen(true);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws);
        setImportData(data);
        setIsImportModalOpen(true);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Formato no soportado. Usa CSV o Excel.");
    }
    e.target.value = "";
  };

  // confirmación desde la modal (importa todos los clientes)
  const handleConfirmImport = async (clientes) => {
    try {
      for (let client of clientes) {
        await createEndClient(client);
      }
      toast.success("Clientes importados correctamente");
      setIsImportModalOpen(false);
      refreshClients();
    } catch (err) {
      console.error("Error al importar clientes:", err);

      // Detectar mensajes devueltos por el backend
      let backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error desconocido al importar clientes";

      if (Array.isArray(err?.response?.data)) {
        backendMsg = err.response.data
          .map((e, i) => `Fila ${i + 1}: ${e.message || e.error || JSON.stringify(e)}`)
          .join("\n");
      }

      toast.error(backendMsg, {
        autoClose: 3000,
        style: { whiteSpace: "pre-line" },
      });
    }
  };

  // API de selects
  const apiSelects = {
    tipo_contribuyente_id: async () => {
      const data = await getTypeTaxpayer();
      return data || [];
    },
  };

  // Validaciones básicas
  const validationRules = {
    rif: (v) => ({ valid: !!v, message: "El RIF es obligatorio" }),
    nombre: (v) => ({ valid: !!v, message: "El nombre de empresa es obligatorio" }),
    telefono: (v) => ({ valid: !!v, message: "El telefono es obligatorio" }),
    email: (v) => ({ valid: !!v, message: "El correo electronico es obligatorio" }),
    direccion: (v) => ({ valid: !!v, message: "La direccion es obligatoria" }),
    //tipo_contribuyente_id: (v) => ({ valid: !!v, message: "Debe seleccionar el tipo de contribuyente" }),
    //region: (v) => ({ valid: v && v !== "#", message: "Seleccione una región" }),
    //estado: (v) => ({ valid: v && v !== "#", message: "Seleccione un estado" }),
  };

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Clientes</h6>

              <div className="flex items-center space-x-3">
                <button
                  className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                  onClick={redirectToCreate}
                >
                  Crear Cliente
                </button>

                {/* botón de importación */}
                {rol === "admin" && (
                  <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                    Importar Excel/CSV
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListClientDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "RIF", data: "rif", className: "dt-center",render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Razón social", data: "nombre", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Correo electrónico", data: "email", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Teléfono", data: "telefono", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  //{ title: "Tipo de contribuyente", data: "tipo_contribuyente.nombre" },
                  { title: "Dirección", data: "direccion", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  {
                    title: "Condición",
                    data: "activo",
                    render: (data, type, row) => {
                      if (!data){
                        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText('Inactivo');
                      }else{
                        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText('Activo');
                      }
                    }
                  },
                  {
                    title: "Acciones",
                    data: "activo",
                    render: (data, type, row) => `
                      <div class="flex justify-center items-center space-x-2">
                        <button class="btn-view text-gray-700 hover:text-gray-900" data-id="${row.id}" title="Ver">
                          <i class="fa-solid fa-lg fa-expand"></i>
                        </button>
                        <button class="btn-edit text-blue-600 hover:text-blue-800" data-id="${row.id}" title="Editar">
                          <i class="fa-solid fa-lg fa-pen-to-square"></i>
                        </button>
                        <button class="btn-delete ${data ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}"
                          data-id="${row.id}" data-nombre="${row.nombre}" data-action="${data ? "delete" : "active"}"
                          title="${data ? "Desactivar" : "Activar"}">
                          <i class="fa-regular fa-rectangle-xmark fa-lg"></i>
                        </button>
                      </div>
                    `,
                  },
                ]}
                options={{
                  serverSide: true, // <--- importante
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      // DataTables usa start y length, los convertimos a page y per_page
                      const page = Math.floor(dataTablesParams.start / dataTablesParams.length) + 1;
                      const per_page = dataTablesParams.length;

                      const searchValue = dataTablesParams.search?.value?.toLowerCase() || '';

                      if (searchValue == ''){
                        //console.log('if');
                        // Llamamos a tu servicio pasando los parámetros de paginación
                        const response = await getEndClients({ page, per_page });

                        // Respaldar response anterior
                        responseCache = response;

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

                            return String(value).toUpperCase().includes(searchValue.toUpperCase());
                          })
                        );
                        //console.log('filteredData: ', filteredData);
                        var data = filteredData;
                        var total = filteredData.length;
                        //var { data, total } = responseCache;
                      }
                      // Retornamos a DataTables con la estructura esperada
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data,
                      });
                    } catch (err) {
                      console.error("Error cargando auditorías:", err);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  },
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: true, // si es true la paginación se debe controlar a traves del servidor
                  searching: true,
                  processing: true,
                  scrollX: true,
                  autoWidth: false,
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
                          title: "Lista de clientes"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de clientes",  // título dentro del archivo
                          filename: "Lista_clientes",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de clientes",
                          filename: "Lista_clientes",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de clientes",
                          filename: "Lista_clientes",
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
                          title: "Lista de clientes",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          text: "Exportar todo (Excel)",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          },
                          action: async function (e, dt, node, config) {
                            const exportButton = node;
                            try {
                              const allData = [];
                              let page = 1;
                              const per_page = dt.length;
                              let totalPages = 1;

                              // Mostrar mensaje de progreso
                              $(exportButton).text("Cargando...").prop("disabled", true).attr("style", "pointer-events: none;");
                              const query = {
                                page,
                                per_page
                              };
                              // Cargar todas las páginas hasta completar total_pages
                              do {
                                query.page = page;
                                query.per_page = 100;
                                const response = await getEndClients(query);
                                const { data, total_pages } = response;

                                allData.push(...data);
                                totalPages = total_pages;
                                page++;
                              } while (page <= totalPages);

                              // Convertimos a Excel con xlsx
                              const wb = utils.book_new();
                              const ws = utils.json_to_sheet(allData.map(item => ({
                                "RIF": formatText(item.rif),
                                "Razon Social": formatText(item.nombre),
                                "Correo electrónico": formatText(item.email),
                                "Teléfono": formatText(item.telefono),
                                "Dirección": formatText(item.direccion),
                                "Región": formatText(item.region),
                                "Zona":formatText(item.zona),
                                "Condición": formatText(item.estado
                                    ? "Activo"
                                    : "Inactivo")
                              })));

                              utils.book_append_sheet(wb, ws, "Auditoría");

                              const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                              const blob = new Blob([wbout], { type: "application/octet-stream" });
                              const link = document.createElement("a");
                              link.href = URL.createObjectURL(blob);
                              link.download = "Clientes.xlsx";
                              link.click();

                              $(exportButton).text("Exportar todo (Excel)").prop("disabled", false).attr("style", "pointer-events: auto;");;
                              toast.success("Archivo exportado correctamente.");
                            } catch (error) {
                              $(exportButton).text("Exportar todo (Excel)").prop("disabled", false).attr("style", "pointer-events: auto;");;
                              console.error("Error al exportar:", error);
                              toast.error("Error al exportar los datos.");
                            }
                          }
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
                }}
              />

              {/* Modales */}
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={`¿Estás seguro de que deseas ${
                  clientIdToDeactivate?.action === "delete" ? "desactivar" : "activar"
                } al cliente ${clientIdToDeactivate?.nombre || ""}?`}
              />
              <ModalEndClients
                isOpen={modalOpenClients}
                onClose={handleCloseModalClients}
                message={clientIdToDeactivate}
              />

              {/* Modal de previsualización */}
              {isImportModalOpen && (
                <ModalImportPreviewClientsForm
                  isOpen={isImportModalOpen}
                  onClose={() => {
                    setIsImportModalOpen(false);
                    setImportData([]);
                  }}
                  onConfirm={handleConfirmImport}
                  data={importData}
                  rol={rol}
                  apiSelects={apiSelects}
                  validationRules={validationRules}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListEndClients;