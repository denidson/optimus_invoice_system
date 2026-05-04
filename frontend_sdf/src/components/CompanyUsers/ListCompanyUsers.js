import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getCompanyUsers, editCompanyUsers, createCompanyUsers, showCompanyUsers } from "../../services/apiCompanyUsers";
import { formatDecimal, formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { encryptText } from '../../services/api';
import ModalCompanyUsers from "./ModalCompanyUsers";

import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Import estilos y botones
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";

import JSZip from "jszip";
window.JSZip = JSZip;

DataTable.use(DT);

export default function ListCompanyUsers() {
  const navigate = useNavigate();
  var responseCache = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpenCompanyUsers, setModalOpenCompanyUsers] = useState(false);
  const [companyUsersIdToAction, setCompanyUserIdToAction] = useState(null);
  const { user } = useContext(AuthContext);
  const rol = user?.rol;

  useEffect(() => {
    const table = $("#ListCompanyUsersDt").DataTable();

    // Evento para botón Editar
    $("#ListCompanyUsersDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      handleEdit(id);
    });

    $("#ListCompanyUsersDt tbody").on("click", "button.btn-view", function () {
        const id = $(this).data("id");
        handleOpenModalCompanyUsers(id);
      });
    return () => {
      $("#ListCompanyUsersDt tbody").off("click", "button.btn-edit");
      $("#ListCompanyUsersDt tbody").off("click", "button.btn-view");
    };
  }, []);

  const handleEdit = async (id) => {
    try {
      const hash = encryptText(id.toString());
      navigate(`/company-users/edit/?id=${encodeURIComponent(hash)}`);
    } catch (error) {
      toast.error("Error al cargar usuario de la empresa");
      console.error(error);
    }
  };

  const handleOpenModalCompanyUsers = async (id) => {
    try {
      const data = await showCompanyUsers(id);
      setCompanyUserIdToAction(data);
      setModalOpenCompanyUsers(true);
    } catch {
      toast.error("Error al obtener detalles del usuario.");
    }
  };

  const handleCloseModalCompanyUsers = () => setModalOpenCompanyUsers(false);


  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b flex justify-between items-center">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Usuarios</h6>
              {(rol != "visor" && rol != "auditor") && (
                <button
                  className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white px-4 py-2 rounded"
                  onClick={() => navigate("/company-users/create")}>
                  Crear Usuario
                </button>
              )}
            </div>

            {/* Tabla */}
            <div className="block w-full overflow-x-auto px-4 py-4">

              <DataTable
                id="ListCompanyUsersDt"
                className="table-auto w-full"
                columns={[
                  { title: "Nombre", data: "nombre", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Correo", data: "email", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { 
                    title: "Rol", 
                    data: "rol",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  {
                    title: "Debe cambiar clave",
                    data: "must_change_password",
                    className: "dt-center",
                    render: (data, type, row) => {
                      if (!data){
                        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText('No');
                      }else{
                        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText('Si');
                      }
                    }
                  },
                  {
                    title: "Creado",
                    data: "created_at",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return formatDateTime(data);
                    }
                  },
                  {
                    title: "Acciones",
                    data: "activo",
                    orderable: false,
                    searchable: false,
                    className: 'no-export',
                    render: (data, type, row) => {
                      const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
                      const editBtn = `<button class="btn-edit px-2 py-1 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>`;
                      /*const toggleBtn = data
                        ? `<button class="btn-delete px-2 py-1 text-red-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="delete"><i class="fa-regular fa-rectangle-xmark fa-lg"></i></button>`
                        : `<button class="btn-delete px-2 py-1 text-green-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="active"><i class="fa-regular fa-square-check fa-lg"></i></button>`;*/
                      if (rol == "visor" || rol == "auditor"){
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`; //${toggleBtn}
                      }else{
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${editBtn}</div>`; //${toggleBtn}
                      }
                    }
                  }
                ]}

                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha

                  serverSide: true,
                  processing: true,
                  ajax: async (params, callback) => {
                    try {
                      const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;
                      const searchValue = params.search?.value?.toLowerCase() || '';
                      //console.log('searchValue: ', searchValue);
                      if (searchValue == ''){
                        const response = await getCompanyUsers({ page, per_page });
                        // Respaldar response anterior
                        responseCache = response;
                        //console.log('response: ', response);
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

                      callback({
                        draw: params.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data
                      });
                    } catch (error) {
                      console.error("Error cargando usuarios de la empresa:", error);
                      callback({
                        draw: params.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: []
                      });
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
                          title: "Lista de usuarios"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de usuarios",  // título dentro del archivo
                          filename: "Lista_usuarios",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de usuarios",
                          filename: "Lista_usuarios",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de usuarios",
                          filename: "Lista_usuarios",
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
                          title: "Lista de usuarios",
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
        <ModalCompanyUsers
          isOpen={modalOpenCompanyUsers}
          onClose={handleCloseModalCompanyUsers}
          companyUser={companyUsersIdToAction}
        />
      </div>
    </div>
  );
}
