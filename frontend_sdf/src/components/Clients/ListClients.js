import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getClients, deleteClient, createClient } from '../../services/api_clients';
import { encryptText } from '../../services/api';
import ModalConfirmation from "../Modals/ModalConfirmation";
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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { read, utils } from 'xlsx'; // ✅ Import correcto para XLSX
import Papa from 'papaparse';

window.JSZip = JSZip;
DataTable.use(DT);

function ListClients() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [clientIdToDeactivate, setClientIdToDeactivate] = useState(null);

  // Manejo de eventos para botones
  useEffect(() => {
    const table = $("#ListClientDt").DataTable();

    $("#ListClientDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    $("#ListClientDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModal(id, nombre);
    });

    return () => {
      $("#ListClientDt tbody").off("click", "button.btn-edit");
      $("#ListClientDt tbody").off("click", "button.btn-delete");
    };
  }, []);

  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/clients/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => {
    navigate(`/clients/create`);
  };

  const handleAction = async (id) => {
    try {
      const data = await deleteClient(id);
      toast.success(data.mensaje, {
        onClose: () => {
          setTimeout(() => refreshClients(), 2000);
        },
      });
    } catch (err) {
      toast.error("Error al actualizar el cliente");
    }
  };

  const refreshClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  };

  const handleConfirm = () => {
    if (clientIdToDeactivate) {
      handleAction(clientIdToDeactivate.id);
      setModalOpen(false);
    }
  };

  const handleOpenModal = (id, nombre_empresa) => {
    setClientIdToDeactivate({ id, nombre_empresa });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  // Función que procesa el archivo seleccionado
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await uploadClients(results.data);
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const workbook = read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(sheet);
        await uploadClients(data);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Archivo no soportado. Solo CSV o Excel.');
    }
  };

  // Función que envía los clientes a la API
  const uploadClients = async (clientsArray) => {
    try {
      for (let client of clientsArray) {
        await createClient(client); // Llama a tu API para cada cliente
      }
      toast.success('Clientes importados correctamente');
      refreshClients();
    } catch (err) {
      console.error(err);
      toast.error('Error al importar clientes');
    }
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

              {/* Grupo de botones alineado a la derecha */}
              <div className="flex items-center space-x-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={redirectToCreate}
                >
                  Crear Cliente
                </button>

                <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                  Importar Excel/CSV
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>


            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListClientDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "RIF", data: "rif" },
                  { title: "Razón Social", data: "nombre_empresa" },
                  { title: "Teléfono", data: "telefono" },
                  { title: "Dirección", data: "direccion" },
                  { title: "Tipo de contribuyente", data: "tipo_contribuyente_id" },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => `
                      <button class="btn-edit text-blue-600 mx-1" data-id="${row.id}">
                        <i class="fas fa-pen-to-square"></i>
                      </button>
                      <button class="btn-delete text-red-600 mx-1" data-id="${row.id}" data-nombre="${row.nombre_empresa}">
                        <i class="fas fa-trash"></i>
                      </button>
                    `
                  },
                ]}
                options={{
                  dom: "<'row'<'col-sm-12 text-center'B>>" +
                       "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +
                       "<'row'<'col-sm-12'tr>>" +
                       "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",
                  serverSide: false,
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      const response = await getClients();
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
                  responsive: true,
                  scrollX: true,
                  pageLength: 10,
                  lengthMenu: [5, 10, 25, 50, 100],
                  buttons: [
                    { extend: "copyHtml5", text: "Copiar" },
                    { extend: "excelHtml5", text: "Excel", filename: "Lista_clientes" },
                    { extend: "csvHtml5", text: "CSV", filename: "Lista_clientes" },
                    { extend: "pdfHtml5", text: "PDF", filename: "Lista_clientes" },
                    { extend: "print", text: "Imprimir" }
                  ],
                  language: {
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
                  }
                }}
              />
            </div>

            {/* Modal */}
            <ModalConfirmation
              isOpen={modalOpen}
              onClose={handleCloseModal}
              onConfirm={handleConfirm}
              message={`¿Estás seguro de que deseas desactivar al cliente ${clientIdToDeactivate ? clientIdToDeactivate.nombre_empresa : ''}?`}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export default ListClients;