import React, { useState, useEffect, useMemo, useRef } from "react";
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
//import { read, utils } from 'xlsx';
import * as XLSX from "xlsx";
const { read, utils } = XLSX;
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";
import Papa from 'papaparse';
import { tooltipBtn } from "../../utils/datatableTooltip";


window.JSZip = JSZip;
DataTable.use(DT);

function ListInvoices({ title, type }) {
  const navigate = useNavigate();
  const [modalOpenInvoices, setModalOpenInvoices] = useState(false);
  const [Invoices, setInvoices] = useState(false);

  const [modalImportOpen, setModalImportOpen] = useState(false);
  const [preInvoicesToImport, setPreInvoicesToImport] = useState([]);
  const [filterType, setFilterType] = useState("");
  var responseCache = useState(false);

  const authData = localStorage.getItem("authData");
  const authclientId = authData ? JSON.parse(authData).cliente_id : null;
  const formattedDate = new Date().toISOString().split("T")[0];
  const rol = authData ? JSON.parse(authData)['rol'] : null;

  useEffect(() => {
    const table = $("#ListInvoicesDt").DataTable();

    $("#ListInvoicesDt tbody").on("click", "button.btn-view", function () {
      handleOpenModalInvoices($(this).data("id"));
    });
    $("#ListInvoicesDt tbody").on("click", "button.btn-credit-note", function () {
      redirectToCreateNote($(this).data("id"), 'NC');
    });
    $("#ListInvoicesDt tbody").on("click", "button.btn-debit-note", function () {
      redirectToCreateNote($(this).data("id"), 'ND');
    });

    return () => {
      $("#ListInvoicesDt tbody").off("click", "button.btn-view");
      $("#ListInvoicesDt tbody").off("click", "button.btn-credit-note");
      $("#ListInvoicesDt tbody").off("click", "button.btn-debit-note");
    };
  }, []);

  const redirectToCreateNote = async (id, tipo_documento) => {
    if (tipo_documento.toString() == 'NC'){
      const data = await showInvoice(id);
      var validateGenerate = false;
      if (data){
        for (var i = 0; i < data.items.length; i++){
          if (data.items[i].cantidad_disponible > 0){
            validateGenerate = true;
          }
        }
        if (validateGenerate == false){
          toast.info(`La factura con el número de control (${data.numero_control}) no dispone de productos disponibles para procesar la nota de crédito.`);
          return;
        }
      }
      if (validateGenerate == false){
        toast.error(`No se pudo acceder a la información de la factura.`);
        return;
      }
    }
    const hash = encryptText(id.toString());
    const hashType = encryptText(tipo_documento.toString());
    navigate(`/preinvoices/create?id=${encodeURIComponent(hash)}&type=${encodeURIComponent(hashType)}`);
  };

  const handleOpenModalInvoices = async (id) => {
    try {
      const data = await showInvoice(id);
      setInvoices(data);
      setModalOpenInvoices(true);
    } catch {
      toast.error("Error al consultar los datos del cliente.");
    }
  };

  const handleCloseModalInvoices = () => setModalOpenInvoices(false);

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
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => processData(res.data) });
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

  const handleConfirmImport = async (prefacturasEditadas) => {
    try {
      const cliente_id = authclientId;
      let errores = [];

      for (let pre of prefacturasEditadas) {
        const payload = { ...pre, cliente_id, force_final: true };
        try {
          const response = await createPreInvoice(payload);
          if (response?.resultados?.length) {
            response.resultados.forEach((r) => {
              if (r.status?.toLowerCase() === "error") errores.push(`Fila ${r.index + 1}: ${r.error}`);
            });
          }
        } catch (error) {
          errores.push(`Factura ${pre.prefactura?.correlativo_interno || "#"}: ${error.message}`);
        }
      }

      if (!errores.length) toast.success("Facturas importadas correctamente");
      else {
        errores.forEach((msg) => toast.error(`❌ ${msg}`));
        toast.warn(`${errores.length} factura(s) fallaron.`);
      }
    } catch {
      toast.error("Error inesperado al importar");
    }
  };

  const actionSearch = () => {
    const table = $("#ListInvoicesDt").DataTable();
    table.clear();
    table.search("");
    table.columns().search("");
    table.ajax.reload();
  };

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">{title}</h6>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2 mb-3">
                  <h3 class="text-blueGray-700 font-bold me-3 my-3">Buscar por:</h3><br/>
                  {/* SELECT PRINCIPAL */}
                  <select id="filter_type" className="border p-2 rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value=""> - </option>
                    <option value="estatus">Estado</option>
                    <option value="zona">Zona</option>
                    <option value="correlativo_interno">Correlativo Interno</option>
                    <option value="cliente_final_rif">RIF del cliente</option>
                    <option value="rango_fecha">Rango de fecha</option>
                  </select>
                  {filterType === "estatus" && (
                    <select id="filtro_estatus" className="border p-2 rounded">
                      <option value="">Todos</option>
                      <option value="normal">Normal</option>
                      <option value="anulada">Anulada</option>
                    </select>
                  )}
                  {(filterType === "zona" || filterType === "correlativo_interno" || filterType === "cliente_final_rif") && (
                    <input id="filtro_text" className="border p-2 rounded" placeholder="Buscar..."/>
                  )}
                  {filterType === "rango_fecha" && (
                    <>
                      <input id="filtro_desde" type="date" className="border p-2 rounded" />
                      <input id="filtro_hasta" type="date" className="border p-2 rounded" />
                    </>
                  )}
                  <button
                    className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                    onClick={actionSearch}>
                    Buscar
                  </button>
                  
                  <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                    Importar Excel/CSV
                    <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Tabla con scroll horizontal contenido en card */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListInvoicesDt"
                className="table-auto w-full text-left"
                columns={[
                  {
                    title: "Fecha",
                    data: "fecha_factura",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return formatDate(data);
                    }
                  },
                  { title: "RIF", data: "cliente_final_rif", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Razón Social", data: "cliente_final_nombre", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  {
                    title: "Tipo de documento",
                    data: "tipo_documento",
                    className: "text-center",
                    orderable: true,
                    searchable: true,
                    render: (data, type, row) => {
                      if (data == 'FC'){
                        return 'FACTURA';
                      }else if (data == 'NC'){
                        return 'NOTA DE CRÉDITO';
                      } else {
                        return 'NOTA DE DÉBITO';
                      }

                    }
                  },
                  { title: "Número de control", data: "numero_control", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Correlativo", data: "correlativo_interno", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  {
                    title: "Base imponible (Bs.)",
                    data: "total_base",
                    render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  {
                    title: "I.V.A. (Bs.)",
                    data: "total_impuestos",
                    render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  {
                    title: "Total (Bs.)",
                    data: "total_neto",
                    render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  {
                    title: "Pagado en divisas (Bs.)",
                    data: "monto_pagado_divisas",
                    render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  {
                    title: "IGTF (Bs.)",
                    data: "igtf_monto",
                    render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  {
                    title: "Zona",
                    data: "zona",
                    orderable: true,
                    searchable: false,
                    render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  {
                    title: "Estatus",
                    data: "estatus",
                    className: "dt-center",
                    orderable: true,
                    searchable: true,
                    render: (data, type, row) => {
                      if (data == 'anulada'){
                        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText(data);
                      }else if (data == 'normal'){
                        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText(data);
                      } else {
                        return '<i class="fas fa-circle text-orange-500 mr-2"></i> ' + formatText(data);
                      }
                    }
                  },
                  {
                    title: "Acciones",
                    data: null,
                    orderable: false,
                    searchable: false,
                    className: 'no-export',
                    render: (data, type, row) => {
                      // const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
                      const viewBtn = tooltipBtn({
                        html: `
                          <button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-expand"></i>
                          </button>
                        `,
                        text:
                          row.tipo_documento === "FC"
                            ? "Ver factura"
                            : row.tipo_documento === "NC"
                            ? "Ver nota de crédito"
                            : "Ver nota de débito"
                      });
                      if (rol === "admin") {
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
                      }
                      if (rol !== "admin" && row.estatus.toUpperCase() != 'ANULADA' && row.tipo_documento == 'FC'){
                        // const creditNoteBtn = `<button class="btn-credit-note px-2 py-1 text-red-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-file-invoice"></i></button>`;
                        // const debitNoteBtn = `<button class="btn-debit-note px-1 py-1 mx-0 text-green-600" data-id="${row.id}" data-correlativo_interno="${row.correlativo_interno}"><i class="fa-solid fa-file-invoice fa-lg"></i></button>`;
                        const creditNoteBtn = tooltipBtn({
                          html: `
                            <button class="btn-credit-note px-2 py-1 text-red-600"
                              data-id="${row.id}">
                              <i class="fa-solid fa-lg fa-file-invoice"></i>
                            </button>
                          `,
                          text: "Crear nota de crédito"
                        });
                        const debitNoteBtn = tooltipBtn({
                          html: `
                            <button class="btn-debit-note px-1 py-1 mx-0 text-green-600"
                              data-id="${row.id}"
                              data-correlativo_interno="${row.correlativo_interno}">
                              <i class="fa-solid fa-lg fa-file-invoice"></i>
                            </button>
                          `,
                          text: "Crear nota de débito"
                        });


                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${creditNoteBtn}${debitNoteBtn}</div>`;
                      }else{
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
                      }
                    }
                  }
                ]}
                options={{
                  columnDefs:[{
                    targets: [5, 6, 7, 9, 10, 11], // índices de columnas a ocultar (ej: RIF, Zona)
                    visible: false,
                    searchable: true // siguen siendo buscables
                  }],
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
                          title: "Lista de Facturas"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de Facturas",  // título dentro del archivo
                          filename: "Lista_facturas",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de Facturas",
                          filename: "Lista_facturas",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de Facturas",
                          filename: "Lista_facturas",
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
                          title: "Lista de Facturas",
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
                              query.tipo_documento = type;
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
                              console.log('query: ', query);
                              // Cargar todas las páginas hasta completar total_pages
                              do {
                                query.page = page;
                                query.per_page = 100;
                                const response = await getInvoices(query);
                                const { data, total_pages } = response;

                                allData.push(...data);
                                totalPages = total_pages;
                                page++;
                              } while (page <= totalPages);

                              // Convertimos a Excel con xlsx
                              const wb = utils.book_new();
                              const ws = utils.json_to_sheet(allData.map(item => ({
                                "Fecha": formatDate(item.fecha_factura),
                                "RIF": formatText(item.cliente_final_rif),
                                "Razon Social": formatText(item.cliente_final_nombre),
                                "Tipo de documento": item.tipo_documento === "FC"
                                    ? "FACTURA"
                                    : item.tipo_documento === "ND" ? "NOTA DE DÉBITO" : "NOTA DE CRÉDITO",
                                "Correlativo interno": formatText(item.correlativo_interno),
                                "Factura afectada NC": formatText(item.factura_afectada_rel ? item.factura_afectada_rel.numero_control : ''),
                                "Base imponible (Bs.)": formatMoney(item.total_base),
                                "IVA (Bs.)": formatMoney(item.total_impuestos),
                                "Total (Bs.)": formatMoney(item.total_neto),
                                "Pago en divisas (Bs.)": formatMoney(item.monto_pagado_divisas),
                                "IGTF (Bs.)": formatMoney(item.igtf_monto),
                                "Zona":formatText(item.zona),
                                "Estatus": formatText(item.estatus),
                              })));

                              utils.book_append_sheet(wb, ws, "Auditoría");

                              const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                              const blob = new Blob([wbout], { type: "application/octet-stream" });
                              const link = document.createElement("a");
                              link.href = URL.createObjectURL(blob);
                              link.download = "Facturas.xlsx";
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
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      /*const page = Math.floor(params.start / params.length) + 1;
                      const per_page = params.length;
                      const response = await getInvoices({ page, per_page });*/
                      const searchValue = dataTablesParams.search?.value?.toLowerCase() || '';
                      //console.log('searchValue: ', searchValue);
                      // DataTables usa start y length, los convertimos a page y per_page
                      const page = Math.floor(dataTablesParams.start / dataTablesParams.length) + 1;
                      const per_page = dataTablesParams.length;
                      const query = {
                        page,
                        per_page
                      };
                      query.tipo_documento = type;
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

                      if (searchValue == ''){
                        //console.log('if');
                        // Pasamos los filtros al servicio
                        const response = await getInvoices(query);

                        // Respaldar response anterior
                        responseCache = response;
                        //console.log('responseCache: ', responseCache);

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

                            // Si es campo de fecha
                            if (key.includes("fecha_factura")) {
                              /*console.log('fecha_factura: ', value);
                              console.log('searchValue: ', searchValue);
                              console.log('formatDate: ', formatDate(value));*/
                              return formatDate(value).includes(searchValue.toUpperCase());
                            }

                            return String(value).toUpperCase().includes(searchValue.toUpperCase());
                          })
                        );
                        //console.log('filteredData: ', filteredData);
                        var data = filteredData;
                        var total = filteredData.length;
                        //var { data, total } = responseCache;
                      }
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data,
                      });
                    } catch {
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: []
                      });
                    }
                  },
                  createdRow: function (row) {
                    $(row).find("td").css({
                      "font-size": "0.85rem",
                      "white-space": "nowrap",
                      "overflow": "hidden",
                      "text-overflow": "ellipsis"
                    });

                    $(row).find("td:last-child").css({
                      "overflow": "visible"
                    });
                  },
                  headerCallback: function(thead) {
                    $(thead).find("th").css({
                      "font-size": "0.85rem", 
                      "text-align": "center",
                      "font-weight": "bold"
                    });
                  }
                }}
              />

              <ModalInvoices isOpen={modalOpenInvoices} onClose={handleCloseModalInvoices} message={Invoices} />
              {modalImportOpen && (
                <ModalImportPreviewPreInvoices
                  isOpen={modalImportOpen}
                  onClose={() => { setModalImportOpen(false); setPreInvoicesToImport([]); }}
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