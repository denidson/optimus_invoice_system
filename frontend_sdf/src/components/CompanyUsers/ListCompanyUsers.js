import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyUsers, editCompanyUsers, createCompanyUsers } from "../../services/apiCompanyUsers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const table = $("#ListCompanyUsersDt").DataTable();

    // Evento para botón Editar
    $("#ListCompanyUsersDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      handleEdit(id);
    });

    return () => {
      $("#ListCompanyUsersDt tbody").off("click", "button.btn-edit");
    };
  }, []);

  const handleEdit = async (id) => {
    try {
      navigate(`/company-users/edit/${id}`);
    } catch (error) {
      toast.error("Error al cargar usuario");
    }
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />

      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative mt-20 flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">

            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b flex justify-between items-center">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Usuarios</h6>

              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => navigate("/company-users/create")}
              >
                Crear Usuario
              </button>
            </div>

            {/* Tabla */}
            <div className="block w-full overflow-x-auto px-4 py-4">

              <DataTable
                id="ListCompanyUsersDt"
                className="table-auto w-full text-left bg-transparent border-collapse"
                columns={[
                  { title: "Nombre", data: "nombre" },
                  { title: "Correo", data: "email" },
                  { 
                    title: "Rol", 
                    data: "rol",
                    render: (v) => v.toUpperCase()
                  },
                  {
                    title: "Debe cambiar clave",
                    data: "must_change_password",
                    render: (v) => (v ? '<i class="fas fa-circle text-orange-500 mr-2"></i> Sí' : '<i class="fas fa-circle text-emerald-500 mr-2"></i> No')
                  },
                  {
                    title: "Creado",
                    data: "created_at",
                    render: (d) => d ? d.replace("T", " ").substring(0,19) : ""
                  },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => `
                      <button class="btn-edit px-1 py-1 mx-0" data-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                    `
                  }
                ]}

                options={{
                  dom:
                    "<'row'<'col-sm-12 text-center'B>>" +
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",

                  serverSide: true,
                  processing: true,

                  ajax: async (params, callback) => {
                    try {
                      const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;

                      const response = await getCompanyUsers({ page, per_page });

                      const { data, total } = response;

                      callback({
                        draw: params.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data
                      });
                    } catch (error) {
                      console.error("Error cargando usuarios:", error);
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
                  pageLength: 20,
                  lengthMenu: [20, 50, 100],

                  buttons: [
                    { extend: "copyHtml5", text: "Copiar", title: "Usuarios" },
                    { extend: "excelHtml5", text: "Excel", filename: "Usuarios" },
                    { extend: "csvHtml5", text: "CSV", filename: "Usuarios" },
                    { extend: "pdfHtml5", text: "PDF", filename: "Usuarios" },
                    { extend: "print", text: "Imprimir", title: "Usuarios" },
                  ],

                  language: {
                    decimal: ",",
                    thousands: ".",
                    lengthMenu: "Mostrar _MENU_ registros",
                    zeroRecords: "No hay registros",
                    info: "Mostrando _START_ a _END_ de _TOTAL_",
                    infoEmpty: "No hay información",
                    infoFiltered: "(filtrado de _MAX_ registros)",
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
          </div>
        </div>
      </div>
    </div>
  );
}
