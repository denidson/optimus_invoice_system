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
                  { title: "Descripción", data: "descripcion" },
                  { title: "Código Seniat", data: "codigo_seniat"},
                  { title: "Porcentaje", data: "porcentaje" }
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
                  pageLength: 10,
                  lengthMenu: [5, 10, 25, 50, 100],
                  buttons: [],
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListWithholdings;
