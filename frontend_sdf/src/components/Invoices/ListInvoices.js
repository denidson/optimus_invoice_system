import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 
import { getInvoices, showInvoice } from '../../services/api_invoices';
import { createPreInvoice } from "../../services/api_pre_invoices";
import { encryptText } from '../../services/api';
import ModalInvoices from "./ModalInvoices";
import ModalImportPreviewPreInvoices from "../Modals/ModalImportPreviewPreInvoice";
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

import { read, utils } from 'xlsx';
import Papa from 'papaparse';

window.JSZip = JSZip;
DataTable.use(DT);

function ListInvoices() {
  const navigate = useNavigate();
  const [modalOpenInvoices, setModalOpenInvoices] = useState(false);
  const [Invoices, setInvoices] = useState(false);

  // 🔥 Estados faltantes que daban error
  const [modalImportOpen, setModalImportOpen] = useState(false);
  const [preInvoicesToImport, setPreInvoicesToImport] = useState([]);

  // 🔥 Variables faltantes que daban error
  const authData = localStorage.getItem("authData");
  const authclientId = authData ? JSON.parse(authData).cliente_id : null;
  const formattedDate = new Date().toISOString().split("T")[0];

  var rol;
  if (authData) {
    rol = JSON.parse(authData)['rol'];
  }

  useEffect(() => {
    const table = $("#ListInvoicesDt").DataTable();

    $("#ListInvoicesDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      handleOpenModalInvoices(id);
    });

    $("#ListInvoicesDt tbody").on("click", "button.btn-credit-note", function () {
      const id = $(this).data("id");
      redirectToCreateNote(id, 'NC');
    });

    $("#ListInvoicesDt tbody").on("click", "button.btn-debit-note", function () {
      const id = $(this).data("id");
      redirectToCreateNote(id, 'ND');
    });

    return () => {
      $("#ListInvoicesDt tbody").off("click", "button.btn-view");
      $("#ListInvoicesDt tbody").off("click", "button.credit-note");
      $("#ListInvoicesDt tbody").off("click", "button.debit-note");
    };
  }, []);

  const redirectToCreateNote = (id, tipo_documento) => {
    const hash = encryptText(id.toString());
    const hashType = encryptText(tipo_documento.toString());
    navigate(`/preinvoices/create?id=${encodeURIComponent(hash)}&type=${encodeURIComponent(hashType)}`);
  };

  const handleOpenModalInvoices = async (id) => {
    try {
      const data = await showInvoice(id);
      setInvoices(data);
      setModalOpenInvoices(true);
    } catch (err) {
      toast.error("Error al consultar los datos del cliente.");
    }
  };

  const handleCloseModalInvoices = () => {
    setModalOpenInvoices(false);
  };

  // ----------------------
  // CARGA DE ARCHIVO
  // ----------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    const processData = (data) => {
      const grouped = Object.values(
        data.reduce((acc, row) => {
          const key = row.correlativo_interno;
          if (!acc[key]) {
            acc[key] = {
              prefactura: {
                id: "#",
                cliente_final_id: row.cliente_final_id || "",
                cliente_final_nombre: row.cliente_final_nombre || "",
                cliente_final_rif: row.cliente_final_rif || "",
                cliente_final_telefono: row.cliente_final_telefono || "",
                cliente_final_email: row.cliente_final_email || "",
                cliente_final_direccion: row.cliente_final_direccion || "",
                cliente_id: authclientId,
                correlativo_interno: row.correlativo_interno || "",
                zona: row.direccion || row.zona || "",
                aplica_igtf: row.aplica_igtf || false,
                monto_pagado_divisas: Number(row.monto_pagado_divisas) || 0,
                igtf_porcentaje: Number(row.igtf_porcentaje) || 3.0,
                igtf_monto: Number(row.igtf_monto) || 0,
                tipo_documento: row.tipo_documento || "FC",
                fecha_factura: row.fecha_factura || formattedDate,
                serial: row.serial || "",
              },
              items: [],
            };
          }
          acc[key].items.push({
            producto_sku: row.producto_sku || "",
            cantidad: Number(row.cantidad) || 0,
            precio_unitario: Number(row.precio_unitario) || 0,
            descuento_porcentaje: Number(row.descuento_porcentaje) || 0,
            iva_categoria_id: row.iva_categoria_id || "",
            descripcion: row.descripcion || "",
          });
          return acc;
        }, {})
      );

      setPreInvoicesToImport(grouped);
      setModalImportOpen(true);
    };

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => processData(res.data),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      reader.onload = (evt) => {
        const workbook = read(evt.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        processData(utils.sheet_to_json(sheet));
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Archivo no soportado. Solo CSV o Excel.");
    }

    e.target.value = "";
  };

  // ----------------------
  // ENVÍO A API
  // ----------------------
  const handleConfirmImport = async (prefacturasEditadas) => {
    try {
      const authData = localStorage.getItem("authData");
      const cliente_id = authData ? JSON.parse(authData).cliente_id : null;

      let errores = [];

      for (let i = 0; i < prefacturasEditadas.length; i++) {
        const pre = prefacturasEditadas[i];
        const payload = { ...pre, cliente_id, force_final: true };

        try {
          const response = await createPreInvoice(payload);

          // ✅ Revisar si el response trae resultados con error
          if (response?.resultados?.length) {
            response.resultados.forEach((r) => {
              if (r.status && r.status.toLowerCase() === "error") {
                errores.push(`Fila ${r.index + 1}: ${r.error}`);
              }
            });
          }
        } catch (error) {
          errores.push(`Factura ${pre.prefactura?.correlativo_interno || "#"}: ${error.message}`);
        }
      }

      if (errores.length === 0) {
        toast.success("Facturas importadas correctamente");
      } else {
        errores.forEach((msg) => toast.error(`❌ ${msg}`));
        toast.warn(`${errores.length} factura(s) fallaron.`);
      }
    } catch (err) {
      toast.error("Error inesperado al importar");
    }
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />

      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">

            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">
                Lista de Facturas
              </h6>

              <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                Importar Excel/CSV
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Tabla */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListInvoicesDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "Fecha", data: "fecha_factura" },
                  { title: "RIF", data: "cliente_final_rif" },
                  { title: "Razón Social", data: "cliente_final_nombre" },
                  { title: "Tipo de documento", data: "tipo_documento" },
                  { title: "Número de control", data: "numero_control" },
                  { title: "Correlativo", data: "correlativo_interno" },
                  { title: "Base imponible", data: "total_base" },
                  { title: "I.V.A.", data: "total_impuestos" },
                  { title: "Total", data: "total_neto" },
                  { title: "Pagado en divisas", data: "monto_pagado_divisas" },
                  { title: "IGTF", data: "igtf_monto" },
                  { title: "Zona", data: "zona" },
                  { title: "Estado", data: "estatus" },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    render: (data, type, row) => {
                      if (rol === "admin" || row.estatus.toUpperCase() === "ANULADA") {
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-expand"></i>
                          </button>
                        `;
                      } else {
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-expand"></i>
                          </button>
                          <button class="btn-credit-note px-1 py-1 mx-0 text-red-600" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-file-invoice"></i>
                          </button>
                          <button class="btn-debit-note px-1 py-1 mx-0 text-green-600" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-file-invoice"></i>
                          </button>
                        `;
                      }
                    },
                  },
                ]}
                options={{
                  serverSide: true,
                  processing: true,
                  ajax: async (params, callback) => {
                    try {
                      const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;

                      const response = await getInvoices({ page, per_page });

                      callback({
                        draw: params.draw,
                        recordsTotal: response.total,
                        recordsFiltered: response.total,
                        data: response.data,
                      });
                    } catch (err) {
                      callback({
                        draw: params.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  },
                }}
              />

              <ModalInvoices
                isOpen={modalOpenInvoices}
                onClose={handleCloseModalInvoices}
                message={Invoices}
              />

              {modalImportOpen && (
                <ModalImportPreviewPreInvoices
                  isOpen={modalImportOpen}
                  onClose={() => {
                    setModalImportOpen(false);
                    setPreInvoicesToImport([]);
                  }}
                  data={preInvoicesToImport}
                  onConfirm={handleConfirmImport}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListInvoices;

/* ⚙️ Atributos principales de options
🔹 Control de datos y renderizado

data: datos a renderizar (array de objetos o array de arrays).

columns: definición de columnas (title, data, render, orderable, searchable, className, etc.).

ajax: URL o función para cargar datos dinámicamente.

deferRender: true → mejora rendimiento cargando filas bajo demanda.

serverSide: true → delega búsqueda, ordenamiento y paginación al backend.

processing: true → muestra mensaje de "Procesando…" cuando hay carga de datos.

🔹 Paginación

paging: habilita/deshabilita paginación (true/false).

pageLength: número de registros por página (ej: 10).

lengthMenu: array con opciones de tamaño de página. Ej: [5, 10, 25, 50] o [[5, 10, -1], [5, 10, "Todos"]].

pagingType: tipo de paginación. Ej: simple, simple_numbers, full, full_numbers, first_last_numbers.

🔹 Búsqueda y filtrado

searching: habilita la caja de búsqueda.

search: objeto de configuración inicial de búsqueda. Ej: { search: "texto" }.

searchDelay: milisegundos de delay antes de lanzar búsqueda (para optimizar).

🔹 Ordenamiento

ordering: habilita ordenamiento en columnas.

order: orden inicial. Ej: [[0, "asc"], [1, "desc"]].

orderFixed: orden fijo que no cambia.

columnDefs: personaliza columnas por índice (targets). Ej: ocultar, hacer no ordenable, etc.

🔹 Estilos y UI

dom: controla la posición de elementos (B=botones, f=filtro, l=selector length, r=processing, t=tabla, i=info, p=paginación). Ej: "Blfrtip".

buttons: array de botones (con extensiones datatables.net-buttons).

autoWidth: ajusta automáticamente el ancho de columnas (true/false).

scrollX: activa scroll horizontal.

scrollY: activa scroll vertical fijo.

responsive: adapta tabla a pantallas pequeñas.

🔹 Idioma

language: objeto para traducir la interfaz. Ejemplo:

language: {
  decimal: ",",
  thousands: ".",
  search: "Buscar:",
  lengthMenu: "Mostrar _MENU_ registros",
  info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
  paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" }
}


También puedes usar un archivo remoto JSON oficial (cdn.datatables.net/plug-ins/.../i18n/Spanish.json).

🔹 Exportación (requiere datatables.net-buttons)

buttons → cada botón puede tener:

extend: tipo de exportación (copyHtml5, excelHtml5, csvHtml5, pdfHtml5, print).

text: texto en el botón.

title: título del documento exportado.

filename: nombre de archivo exportado.

exportOptions: qué columnas exportar.

Ejemplo:

buttons: [
  { extend: "copyHtml5", text: "Copiar" },
  { extend: "excelHtml5", text: "Excel", filename: "Lista_Clientes" },
  { extend: "pdfHtml5", text: "PDF", title: "Lista de Clientes", orientation: "landscape" },
  { extend: "print", text: "Imprimir" }
]

🔹 Callbacks y eventos

initComplete: función al finalizar la inicialización.

rowCallback: manipula cada fila en el render.

drawCallback: ejecuta algo cada vez que se dibuja la tabla.

createdRow: manipula fila al momento de ser creada.
*/