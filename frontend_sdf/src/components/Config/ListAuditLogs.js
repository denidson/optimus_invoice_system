import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { encryptText } from '../../services/api';
import { getAuditLogs, showAuditLogs } from "../../services/apiConfig"; //Importar los impuestos
import ModalAuditLogs from "./ModalAuditLogs";
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

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';

window.JSZip = JSZip;
DataTable.use(DT);

function ListAuditLogs() {
  const navigate = useNavigate();
  const [modalOpenAuditLogs, setModalOpenAuditLogs] = useState(false); // Estado para manejar la visibilidad de la modal
  const [auditLogs, setAuditLogs] = useState(false);

  useEffect(() => {
    const table = $("#ListAuditLogsDt").DataTable();
    // Click visualizar
    $("#ListAuditLogsDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModalAuditLogs(id, nombre);
    });

    return () => {
      // limpiar eventos para evitar duplicados
      $("#ListAuditLogsDt tbody").off("click", "button.btn-view");
    };
  }, []);

  const handleOpenModalAuditLogs = async (id) => {
    try{
        const data = await showAuditLogs(id);
        setAuditLogs(data);
        setModalOpenAuditLogs(true); // Abre la modal de confirmación
    } catch (err) {
      // Mostrar una notificación de error
      toast.error("Error al consultar los datos del cliente.");
    } finally {
      // Indicamos que la carga ha finalizado
    }
  };

  const handleCloseModalAuditLogs = () => {
    setModalOpenAuditLogs(false); // Cierra la modal
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative mt-20 flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Registro de auditoria</h6>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListAuditLogsDt"
                className="table-auto w-full text-left items-center w-full bg-transparent border-collapse"
                columns={[
                  {
                    title: "Fecha",
                    data: "timestamp",
                    render: (data, type, row) => {
                      return data ? data.toString().replace('T', ' ').substr(0,19) : '';
                    }
                  },
                  { title: "Servicio", data: "endpoint" },
                  {
                    title: "Accion", data: "method",
                    render: (data, type, row) => {
                      if (data == 'GET'){
                        return 'CONSULTA';
                      }else if(data == 'POST'){
                        if (row.endpoint == "/api/login"){
                          return 'INICIO DE SESIÓN';
                        }else{
                          return 'CREACIÓN';
                        }
                      }else if(data == 'PUT'){
                        return 'ACTUALIZACIÓN';
                      }else{
                        return 'DESACTIVACIÓN/ACTIVACiÓN';
                      }
                    }
                  },
                  { title: "Origen", data: "request_ip" },
                  { title: "Respuesta", data: "response_status_code" },
                  { title: "Duracion (Ms)", data: "duration_ms" },
                  { title: "Usuario", data: "usuario.email" },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                      return `
                        <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                      `;
                    }
                  },
                ]}
                options={{
                  dom:
                    "<'row'<'col-sm-12 text-center'B>>" +
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",
                  serverSide: false,
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      const response = await getAuditLogs();
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: response.data.length,
                        recordsFiltered: response.data.length,
                        data: response.data
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
                  pageLength: 10,
                  lengthMenu: [5, 10, 25, 50, 100],
                  buttons: [
                    { extend: "copyHtml5", text: "Copiar", title: "Registro de auditoria" },
                    { extend: "excelHtml5", text: "Excel", title: "Registro de auditoria", filename: "Registro_de_auditoria" },
                    { extend: "csvHtml5", text: "CSV", title: "Registro de auditoria", filename: "Registro_de_auditoria" },
                    { extend: "pdfHtml5", text: "PDF", title: "Registro de auditoria", filename: "Registro_de_auditoria" },
                    { extend: "print", text: "Imprimir", title: "Registro de auditoria" }
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
                  }
                }}
              />
              {/* Modal de confirmación */}
              <ModalAuditLogs
                isOpen={modalOpenAuditLogs}
                onClose={handleCloseModalAuditLogs}
                message={auditLogs}//{'Detalle del Pre-Factura'} // Pasamos el mensaje personalizado
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListAuditLogs;
