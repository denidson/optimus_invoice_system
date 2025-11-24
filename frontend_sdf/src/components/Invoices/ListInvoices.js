import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // Para la redirección
import { getInvoices, showInvoice } from '../../services/api_invoices'; // Importa el servicio
import { encryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import ModalInvoices from "./ModalInvoices";
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
// Importa estilos de DataTables
import "datatables.net-dt/css/dataTables.dataTables.css";
// extensiones de exportación
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
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
// Activar el "plugin" base de DataTables
DataTable.use(DT);

function ListInvoices() {
  const navigate = useNavigate(); // Hook para redirección
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenInvoices, setModalOpenInvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [Invoices, setInvoices] = useState(false);
  const authData = localStorage.getItem("authData");
  var rol;
  if (authData) {
    rol = JSON.parse(authData)['rol'];
  }

  // Cargar las pre-facturas al inicio
  useEffect(() => {
    const table = $("#ListInvoicesDt").DataTable();

    // Click visualizar
    $("#ListInvoicesDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModalInvoices(id, nombre);
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
      // limpiar eventos para evitar duplicados
      $("#ListInvoicesDt tbody").off("click", "button.btn-view");
      $("#ListInvoicesDt tbody").off("click", "button.credit-note");
      $("#ListInvoicesDt tbody").off("click", "button.debit-note");
    };
  }, []); // Se ejecuta solo una vez al montar el componente


  const redirectToCreateNote = (id, tipo_documento) => {
    const hash = encryptText(id.toString());
    const hashType = encryptText(tipo_documento.toString());
    navigate(`/preinvoices/create?id=${encodeURIComponent(hash)}&type=${encodeURIComponent(hashType)}`);
  };

  const handleOpenModalInvoices = async (id) => {
    try{
        const data = await showInvoice(id);
        setInvoices(data);
        setModalOpenInvoices(true); // Abre la modal de confirmación
    } catch (err) {
      // Mostrar una notificación de error
      toast.error("Error al consultar los datos del cliente.");
    } finally {
      // Indicamos que la carga ha finalizado
    }
  };

  const handleCloseModalInvoices = () => {
    setModalOpenInvoices(false); // Cierra la modal
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Facturas</h6>
              {/* Grupo de botones alineado a la derecha */}
              <div className="flex items-center space-x-3"></div>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListInvoicesDt"
                className="table-auto w-full text-left"
                columns={[
                  {
                    title: "Fecha",
                    data: "fecha_factura",
                    orderable: true,
                    searchable: false,
                    render: (data, type, row) => {
                      return data ? data.toString().replace('T', ' ').substr(0,19) : '';
                    }
                  },
                  { title: "RIF", data: "cliente_final_rif" },
                  { title: "Razón Social", data: "cliente_final_nombre" },
                  {
                    title: "Tipo de documento", data: "tipo_documento",
                    orderable: true,
                    searchable: false,
                    render: (data, type, row) => {
                      if (data == 'FC'){
                        return 'FACTURA';
                      }else if(data == 'NC'){
                        return 'NOTA DE CREDITO';
                      }else{
                        return 'NOTA DE DEBITO';
                      }
                    }
                  },
                  { title: "Número de control", data: "numero_control" },
                  { title: "Correlativo", data: "correlativo_interno" },
                  {
                    title: "Base imponible",
                    data: "total_base",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `Bs. ${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "I.V.A.",
                    data: "total_impuestos",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `Bs. ${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "Total",
                    data: "total_neto",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `Bs. ${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "Pagado en divisas",
                    data: "monto_pagado_divisas",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `Bs. ${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "IGTF",
                    data: "igtf_monto",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `Bs. ${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "Zona",
                    data: "zona",
                    orderable: true,
                    searchable: false,
                    render: (data, type, row) => {
                      return data ? data.toUpperCase():'';
                    }
                  },
                  {
                    title: "Estado",
                    data: "estatus",
                    orderable: true,
                    searchable: false,
                    render: (data, type, row) => {
                      return data ? data.toUpperCase():'';
                    }
                  },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                      if (rol === "admin" || row.estatus.toUpperCase() == 'ANULADA') {
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                        `;
                      }else{
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                          <button class="btn-credit-note px-1 py-1 mx-0 text-red-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-file-invoice"></i></button>
                          <button class="btn-debit-note px-1 py-1 mx-0 text-green-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-file-invoice"></i></button>
                        `;
                      }
                    }
                  },
                ]}
                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-center'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: true, // si es true la paginación se debe controlar a traves del servidor
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {

                      // DataTables usa start y length, los convertimos a page y per_page
                      const page = Math.floor(dataTablesParams.start / dataTablesParams.length) + 1;
                      const per_page = dataTablesParams.length;
                      const query = {
                        page,
                        per_page
                      };

                      // Añadir filtros según filtro activo
                      if ($('#filter_type option:selected').val() === "estatus" && $('#filtro_estatus option:selected').val()) query.estatus = $('#filtro_estatus option:selected').val();

                      if ($('#filter_type option:selected').val() === "zona" && $("#filtro_text").val()) query.zona = $("#filtro_text").val();

                      if ($('#filter_type option:selected').val() === "correlativo_interno" && $("#filtro_text").val())
                        query.correlativo_interno = $("#filtro_text").val();

                      if ($('#filter_type option:selected').val() === "cliente_final_rif" && $("#filtro_text").val())
                        query.cliente_final_rif = $("#filtro_text").val();

                      if ($('#filter_type option:selected').val() === "rango_fecha" && $('#filtro_desde').val() && $('#filtro_hasta').val()) {
                        query.desde = $('#filtro_desde').val();
                        query.hasta = $('#filtro_hasta').val();
                      }

                      // Pasamos los filtros al servicio
                      const response = await getInvoices(query);

                      // Aseguramos que la estructura esperada esté presente
                      const { data, total } = response;

                      // Retornamos a DataTables con la estructura esperada
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data,
                      });
                    } catch (err) {
                      console.error("Error cargando Pre-Factura:", err);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  },
                  paging: true,
                  searching: true,
                  ordering: true,
                  info: true,
                  scrollx: true,
                  responsive: true,
                  pageLength: 10,         // cantidad inicial por página
                  lengthMenu: [5, 10, 25, 50, 100], // opciones en el desplegable, false para oculta el selector
                  //dom: "Blfrtip",
                  buttons: [
                    {
                      extend: "copyHtml5",
                      text: "Copiar",
                      title: "Lista de Pre-Facturas"   // nombre del documento en el portapapeles
                    },
                    {
                      extend: "excelHtml5",
                      text: "Excel",
                      title: "Lista de Pre-Facturas",  // título dentro del archivo
                      filename: "Lista_pre_facturas"   // nombre del archivo generado (sin extensión)
                    },
                    {
                      extend: "csvHtml5",
                      text: "CSV",
                      title: "Lista de Pre-Facturas",
                      filename: "Lista_pre_facturas"
                    },
                    {
                      extend: "pdfHtml5",
                      text: "PDF",
                      title: "Lista de Pre-Facturas",
                      filename: "Lista_pre_facturas",
                      //orientation: "landscape",   // opcional
                      //pageSize: "A4"              // opcional
                    },
                    {
                      extend: "print",
                      text: "Imprimir",
                      title: "Lista de Pre-Facturas"
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
                  }
                }}
              className="items-center w-full bg-transparent border-collapse"/>
              {/* Modal de confirmación */}
              <ModalInvoices
                isOpen={modalOpenInvoices}
                onClose={handleCloseModalInvoices}
                message={Invoices}//{'Detalle del Pre-Factura'} // Pasamos el mensaje personalizado
              />
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