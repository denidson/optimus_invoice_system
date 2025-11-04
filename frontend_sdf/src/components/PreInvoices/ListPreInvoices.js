import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // Para la redirección
import { getPreInvoices, deletePreInvoice, showPreInvoice, createPreInvoice, convertInInvoice } from '../../services/api_pre_invoices'; // Importa el servicio
import { encryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import ModalConfirmation from "../Modals/ModalConfirmation";
import ModalPreinvoices from "./ModalPreInvoices";
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

function ListPreInvoices() {
  const navigate = useNavigate(); // Hook para redirección
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenPreinvoices, setModalOpenPreinvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenInInvoices, setModalOpenInInvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [preInvoicesIdToDeactivate, setPreInvoicesIdToDeactivate] = useState(null); // Estado para almacenar el ID de la pre-factura a eliminar
  const [preInvoicesIdInInvoices, setPreInvoicesIdInInvoices] = useState(null); // Estado para almacenar el ID de la pre-factura a Facturar
  const authData = localStorage.getItem("authData");
  var rol;
  if (authData) {
    rol = JSON.parse(authData)['rol'];
  }

  // Cargar las pre-facturas al inicio
  useEffect(() => {
    const table = $("#ListPreInvoicesDt").DataTable();

    // Click editar
    $("#ListPreInvoicesDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    // Click Convertir en factura
    $("#ListPreInvoicesDt tbody").on("click", "button.btn-invoice", function () {
      const id = $(this).data("id");
      const correlativo_interno = $(this).data("correlativo_interno");
      handleOpenModalInInvoices(id, correlativo_interno);
    });

    // Click eliminar
    $("#ListPreInvoicesDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModal(id, nombre);
    });

    // Click visualizar
    $("#ListPreInvoicesDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModalPreinvoices(id, nombre);
    });

    return () => {
      // limpiar eventos para evitar duplicados
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-edit");
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-delete");
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-view");
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/preinvoices/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => {
    navigate(`/preinvoices/create`);
  };

  const handleAction = async (id) => {
    try {
      const data = await deletePreInvoice(id);
      toast.success(data.mensaje, {
        onClose: () => {
          setTimeout(() => refreshPreInvoices(), 2000);
        },
      });
    } catch (err) {
      toast.error("Error al actualizar la Pre-Factura");
    }
  };

  const refreshPreInvoices = async () => {
    // Llamamos a la función del servicio REST para obtener los clientes
    try {
      /*const data = await getPreInvoices();
      setPreInvoices(data); // Actualizamos el estado con los clientes obtenidos*/
      location.reload(true);
    } catch (error) {
      console.error("Error al cargar las Pre-Facturas:", error);
    }
  };

  const handleConfirm = () => {
    if (preInvoicesIdToDeactivate) {
      handleAction(preInvoicesIdToDeactivate.id);
      setModalOpen(false);
    }
  };

  const handleOpenModal = (id, nombre_empresa) => {
    setPreInvoicesIdToDeactivate({ id, nombre_empresa });
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
          await uploadPreInvoices(results.data);
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
        await uploadPreInvoices(data);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Archivo no soportado. Solo CSV o Excel.');
    }
  };

  // Función que envía las Pre-Facturas a la API
  const uploadPreInvoices = async (preInvoicesArray) => {
    try {
      for (let preInvoice of preInvoicesArray) {
        await createPreInvoice(client); // Llama a tu API para cada cliente
      }
      toast.success('Clientes importados correctamente');
      refreshPreInvoices();
    } catch (err) {
      console.error(err);
      toast.error('Error al importar clientes');
    }
  };

  const handleOpenModalPreinvoices = async (id) => {
    try{
        const data = await showPreInvoice(id);
        setPreInvoicesIdToDeactivate(data);
        setModalOpenPreinvoices(true); // Abre la modal de confirmación
    } catch (err) {
      // Mostrar una notificación de error
      toast.error("Error al consultar los datos del cliente.");
    } finally {
      // Indicamos que la carga ha finalizado
    }
  };

  const handleCloseModalPreinvoices = () => {
    setModalOpenPreinvoices(false); // Cierra la modal
  };

  const handleOpenModalInInvoices = (id, correlativo_interno) => {
    setPreInvoicesIdInInvoices({ id, correlativo_interno });
    setModalOpenInInvoices(true);
  };

  const handleConfirmInInvoices = () => {
    if (preInvoicesIdInInvoices) {
      handleActionInInvoices(preInvoicesIdInInvoices.id);
      setModalOpenInInvoices(false);
    }
  };

  const handleActionInInvoices = async (id) => {
    try{
        var body = { 'prefactura_id': id };
        console.log('handleActionInInvoices-body: ', body);
        const data = await convertInInvoice(body);
        console.log('handleActionInInvoices-data: ', data);
        toast.success(data.mensaje, {
          onClose: () => {
            setTimeout(() => refreshPreInvoices(), 2000);
          },
        });
    } catch (err) {
      // Mostrar una notificación de error
      toast.error("Error al consultar los datos del cliente.");
    } finally {
      // Indicamos que la carga ha finalizado
    }
  };

  const handleCloseModalInInvoices = () => {
    setModalOpenInInvoices(false); // Cierra la modal
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Pre-Facturas</h6>
              {/* Grupo de botones alineado a la derecha */}
              {rol == 'operador' ?
              (<div className="flex items-center space-x-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={redirectToCreate}>
                  Crear Pre-Facturas
                </button>

                <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                  Importar Excel/CSV
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              ):
              (<div className="flex items-center space-x-3"></div>)
            }
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListPreInvoicesDt"
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
                  //{ title: "Número de control", data: "numero_control" },
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
                      if (rol == 'admin'){
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                          `;
                      }else{
                        if (row.estatus.toUpperCase() != 'FACTURADA'){
                          return `
                            <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                            <button class="btn-invoice px-1 py-1 mx-0 text-green-600" data-id="${row.id}" data-correlativo_interno="${row.correlativo_interno}"><i class="fa-solid fa-file-invoice fa-lg"></i></button>
                            <button class="btn-edit px-1 py-1 mx-0 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>`;
                            //<button class="btn-delete px-1 py-1 mx-0 text-red-600" data-id="${row.id}" data-nombre="${row.cliente_final_nombre}"><i class="fa-regular fa-rectangle-xmark fa-lg"></i></button>
                        }else{
                          return `
                            <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                          `;
                        }
                      }
                      // btn-edit bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl mx-1
                      //btn-delete bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl mx-1
                    }
                  },
                ]}
                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-center'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: false, // si es true la paginación se debe controlar a traves del servidor
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      const response = await getPreInvoices();
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
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={'¿Estás seguro de que deseas eliminar la Pre-Factura de '+ (preInvoicesIdToDeactivate ? preInvoicesIdToDeactivate.nombre_empresa : '') +'?'} // Pasamos el mensaje personalizado
              />
              {/* Modal de confirmación */}
              <ModalPreinvoices
                isOpen={modalOpenPreinvoices}
                onClose={handleCloseModalPreinvoices}
                message={preInvoicesIdToDeactivate}//{'Detalle del Pre-Factura'} // Pasamos el mensaje personalizado
              />
              {/* Modal de confirmación */}
              <ModalConfirmation
                isOpen={modalOpenInInvoices}
                onClose={handleCloseModalInInvoices}
                onConfirm={handleConfirmInInvoices}
                message={'¿Estás seguro de que deseas convertir en Factura la Pre-Factura '+ (preInvoicesIdInInvoices ? preInvoicesIdInInvoices.correlativo_interno : '') +'?'} // Pasamos el mensaje personalizado
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPreInvoices;

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