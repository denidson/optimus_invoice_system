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
import { read, utils } from 'xlsx';
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

  const redirectToCreate = () => navigate(`/clients/create`);

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
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            
            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Clientes</h6>

              <div className="flex items-center space-x-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
                  { title: "RIF", data: "rif" },
                  { title: "Razón social", data: "nombre" },
                  { title: "Correo electrónico", data: "email" },
                  { title: "Teléfono", data: "telefono" },
                  //{ title: "Tipo de contribuyente", data: "tipo_contribuyente.nombre" },
                  { title: "Dirección", data: "direccion" },
                  {
                    title: "Condición",
                    data: "activo",
                    render: (data) =>
                      data
                        ? '<label class="bg-emerald-400 text-white py-1 px-3 rounded-full text-center">Activo</label>'
                        : '<label class="bg-red-400 text-white py-1 px-3 rounded-full text-center">Inactivo</label>',
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
                  serverSide: false,
                  ajax: async (params, callback) => {
                    const response = await getEndClients();
                    callback({
                      data: response,
                      recordsTotal: response.length,
                      recordsFiltered: response.length,
                    });
                  },
                  pageLength: 10,
                  language: {
                    lengthMenu: "Mostrar _MENU_ registros",
                    zeroRecords: "No se encontraron resultados",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    search: "Buscar:",
                    paginate: { next: "Siguiente", previous: "Anterior" },
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