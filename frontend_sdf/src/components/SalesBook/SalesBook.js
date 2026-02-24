import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { getSalesBook } from '../../services/api_invoices';
import { createPreInvoice } from "../../services/api_pre_invoices";
import { encryptText } from '../../services/api';
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
import "../../assets/styles/salesBook.css";
import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
//import { read, utils } from 'xlsx';
import * as XLSX from "xlsx";
const { read, utils } = XLSX;
import { formatDecimal, formatDate, formatDateTime, formatText, formatInteger } from "../../utils/formatters";
import Papa from 'papaparse';
import { tooltipBtn } from "../../utils/datatableTooltip";

window.JSZip = JSZip;
DataTable.use(DT);

function SalesBook({ title, type }) {
  const navigate = useNavigate();
  const [modalOpenInvoices, setModalOpenInvoices] = useState(false);
  const [Invoices, setInvoices] = useState(false);

  const [modalImportOpen, setModalImportOpen] = useState(false);
  const [preInvoicesToImport, setPreInvoicesToImport] = useState([]);
  const [filterType, setFilterType] = useState("");
  var responseCache = useState(false);
  const [showSummary, setShowSummary] = useState(null);
  const authData = localStorage.getItem("authData");
  const authclientId = authData ? JSON.parse(authData).cliente_id : null;
  const formattedDate = new Date().toISOString().split("T")[0];
  const rol = authData ? JSON.parse(authData)['rol'] : null;

  useEffect(() => {

  }, []);

  const actionSearch = () => {
    const table = $("#ListSalesBookDt").DataTable();
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
                    <option value="-"> - </option>
                    <option value="periodo">Período</option>
                    <option value="rango_fecha">Fecha</option>
                  </select>
                  {filterType === "periodo" && (
                    <select id="filtro_periodo" className="border p-2 rounded">
                      <option value="2025-11">2025-11</option>
                      <option value="2026-01">2026-01</option>
                      <option value="2026-02">2026-02</option>
                    </select>
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
                </div>
              </div>
            </div>

            {/* Tabla con scroll horizontal contenido en card */}
            <div className="w-full px-4 py-4 overflow-x-auto">
              <DataTable
                id="ListSalesBookDt"
                className="table-auto w-full text-left"
                columns={[
                  {
                    title: "Nro Oper.",
                    data: "nro_operacion",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return formatInteger(data);
                    }
                  },
                  {
                    title: "Fecha de la factura",
                    data: "fecha_documento",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return formatDate(data);
                    }
                  },
                  { title: "Tipo de documento", data: "tipo_transaccion", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Factura o Número de documento", data: "numero_factura", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Número de control", data: "numero_control", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "N° comprobante", data: "numero_comprobante_retencion", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Número factura afectada", data: "numero_factura_afectada", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Nombre o razón social", data: "nombre_razon_social", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "RIF", data: "rif", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  /*{
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
                  },*/
                  {
                    title: "Total Ventas  Bs. Incluyendo IVA.",
                    data: "total_ventas_con_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Ventas Internas No Gravadas",
                    data: "",
                    render: (data, type, row) => {
                      return formatDecimal(0.0);
                    }
                  },
                  {
                    title: " Base Imponible",
                    data: "",
                    render: (data, type, row) => {
                      return formatDecimal(0.0);
                    }
                  },
                  {
                    title: " % Alicuota",
                    data: "",
                    render: (data, type, row) => {
                      return formatDecimal(0.0);
                    }
                  },
                  {
                    title: " Impuesto I.V.A",
                    data: "",
                    render: (data, type, row) => {
                      return formatDecimal(0.0);
                    }
                  },
                  {
                    title: "Ventas Internas No Gravadas",
                    data: "ventas_exentas",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "% Alicuota General",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "% Alicuota Reducida",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "% Alicuota Adicional",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Ventas Internas No Gravadas",
                    data: "ventas_exentas",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " % Alicuota General",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " % Alicuota Reducida",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Base Imponible",
                    data: "base_imponible",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " % Alicuota Adicional",
                    data: "alicuota",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: " Impuesto I.V.A",
                    data: "impuesto_iva",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "I.V.A Retenido",
                    data: "iva_retenido",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                  {
                    title: "I.G.T.F Percibido",
                    data: "igtf",
                    render: (data, type, row) => {
                      return formatDecimal(data);
                    }
                  },
                ]}
                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6 py-5'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'rt>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  /*dom:
                    "<'row'<'col-sm-12 text-start'B>>" +
                    "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12'rt>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",*/
                  serverSide: true, // si es true la paginación se debe controlar a traves del servidor
                  searching: true,
                  processing: true,
                  //scrollX: true,
                  scrollCollapse: true,
                  autoWidth: false,
                  paging: false,
                  //fixedHeader: true,
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
                          title: "Libro de ventas"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Libro de ventas",  // título dentro del archivo
                          filename: "Libro_de_ventas",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Libro de ventas",
                          filename: "Libro_de_ventas",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Libro de ventas",
                          filename: "Libro_de_ventas",
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
                          title: "Libro de ventas",
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


                              // Mostrar mensaje de progreso
                              $(exportButton).text("Cargando...").prop("disabled", true).attr("style", "pointer-events: none;");
                              const query = {};
                              // Añadir filtros según filtro activo
                              if ($('#filter_type option:selected').val() === "periodo" && $("#filtro_periodo").val())
                                query.periodo = $("#filtro_periodo").val();

                              if ($('#filter_type option:selected').val() === "rango_fecha" && $('#filtro_desde').val() && $('#filtro_hasta').val()) {
                                query.desde = $('#filtro_desde').val();
                                query.hasta = $('#filtro_hasta').val();
                              }
                              console.log('query: ', query);
                              // Cargar todas las páginas hasta completar total_pages
                              do {
                                query.page = page;
                                query.per_page = 100;
                                const response = await getSalesBook(query);
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
                                "Base imponible (Bs.)": formatDecimal(item.total_base),
                                "IVA (Bs.)": formatDecimal(item.total_impuestos),
                                "Total (Bs.)": formatDecimal(item.total_neto),
                                "Pago en divisas (Bs.)": formatDecimal(item.monto_pagado_divisas),
                                "IGTF (Bs.)": formatDecimal(item.igtf_monto),
                                "Zona":formatText(item.zona),
                                "Estatus": formatText(item.estatus),
                              })));

                              utils.book_append_sheet(wb, ws, "Auditoría");

                              const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                              const blob = new Blob([wbout], { type: "application/octet-stream" });
                              const link = document.createElement("a");
                              link.href = URL.createObjectURL(blob);
                              link.download = "Libro_de_ventas.xlsx";
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
                      const query = {};
                      // Añadir filtros según filtro activo
                      if ($('#filter_type option:selected').val() === "periodo" && $("#filtro_periodo").val())
                        query.periodo = $("#filtro_periodo").val();

                      if ($('#filter_type option:selected').val() === "rango_fecha" && $('#filtro_desde').val() && $('#filtro_hasta').val()) {
                        query.desde = $('#filtro_desde').val();
                        query.hasta = $('#filtro_hasta').val();
                      }
                      //console.log("dataTablesParams-ajax: ", dataTablesParams);
                      //console.log("query-ajax: ", query);dataTablesParams
                      if (searchValue == ''){
                        //console.log('if');
                        // Pasamos los filtros al servicio
                        const response = $('#filter_type option:selected').val() != '-' ? await getSalesBook(query) : [];
                        //console.log('response: ', response);
                        // Respaldar response anterior
                        if (response.error == undefined){
                          responseCache = response;
                          setShowSummary(response);
                        }else{
                          response.hoja_detalle = [];
                          responseCache = response;
                          setShowSummary(response);
                        }
                        console.log('responseCache: ', responseCache);
                        console.log('responseCache: ', responseCache.hoja_detalle.length);

                        // Aseguramos que la estructura esperada esté presente
                        var { hoja_detalle, hoja_resumen } = response;
                      }else{
                        //console.log('else');
                        const CAMPOS_EXCLUIDOS = [
                          "created_at",
                          "updated_at"
                        ];
                        //console.log('responseCache: ', responseCache);
                        var filteredData = responseCache.hoja_detalle.filter(item =>
                          Object.entries(item).some(([key, value]) => {
                            // Excluir campos internos
                            if (CAMPOS_EXCLUIDOS.includes(key)) return false;

                            if (!value) return false;

                            // Si es campo de fecha
                            if (key.includes("fecha_documento")) {
                              /*console.log('fecha_documento: ', value);
                              console.log('searchValue: ', searchValue);
                              console.log('formatDate: ', formatDate(value));*/
                              return formatDate(value).includes(searchValue.toUpperCase());
                            }

                            return String(value).toUpperCase().includes(searchValue.toUpperCase());
                          })
                        );
                        //console.log('filteredData: ', filteredData);
                        var hoja_detalle = filteredData;
                        var hoja_resumen = responseCache.hoja_resumen;
                        //var { data, total } = responseCache;
                      }
                      //console.log('hoja_detalle: ', hoja_detalle);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: hoja_detalle.length,
                        recordsFiltered: hoja_detalle.length,
                        data: hoja_detalle,
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
                  headerCallback: function(thead, data, start, end, display) {
                    const api = this.api();
                    const $table = $(api.table().container());

                    // Función para contar columnas consecutivas con un prefijo
                    const countSpan = (startIndex, prefix) => {
                      let span = 0;
                      const colCount = api.columns().count();
                      if (prefix == 'gp-end -'){
                        span = 2;
                      }else if (prefix == 'gp-start -'){
                        span = 10;
                      }else if (startIndex == 10){
                        span = 4;
                      }else if (startIndex == 14 || startIndex == 24){
                        span = 10;
                      }
                      //console.log('span: ', span);
                      return span;
                    };

                    // Crear la fila de encabezado agrupado
                    const $groupRow = $('<tr class="group-header"></tr>');
                    const colCount = api.columns().count();
                    let colIndex = 0;

                    while (colIndex < colCount) {
                      const title = api.column(colIndex).header().textContent;
                      if (colIndex == 10) {
                        const span = countSpan(colIndex, "");
                        $groupRow.append(`<th colspan="${span}" class="text-center border">Ventas por cuenta de terceros</th>`);
                        colIndex += span;
                      } else if (colIndex == 14) {
                        const span = countSpan(colIndex, "");
                        $groupRow.append(`<th colspan="${span}" class="text-center border">Contribuyente</th>`);
                        colIndex += span;
                      } else if (colIndex == 24) {
                        const span = countSpan(colIndex, "");
                        $groupRow.append(`<th colspan="${span}" class="text-center border">No contribuyente</th>`);
                        colIndex += span;
                      } else if (title == 'I.V.A Retenido' || title == 'I.G.T.F Percibido') {
                        const span = countSpan(colIndex, "gp-end -");
                        $groupRow.append(`<th colspan="${span}" class="text-center border"></th>`);
                        colIndex += span;
                      } else {
                        const span = countSpan(colIndex, "gp-start -");
                        $groupRow.append(`<th colspan="${span}" class="text-center border"></th>`);
                        colIndex += span;
                      }
                    }

                    // Función para insertar la fila de agrupación en cualquier thead
                    const insertGroupHeader = ($thead) => {
                      // Evitar duplicados
                      if ($thead.find('tr.group-header').length === 0) {
                        $thead.find('tr').first().before($groupRow.clone(true));
                      }
                    };

                    // Insertar en thead principal
                    insertGroupHeader($table.find('.dataTables_scrollHead thead'));

                    // Si hay FixedHeader o multiple thead, insertar también
                    insertGroupHeader($table.find('thead')); // fallback general
                  },
                }}
              />
            </div>
            {(showSummary?.hoja_detalle?.length || 0) > 0 && (
            <div className="w-full px-4 py-4 overflow-x-auto">
              <div class="flex flex-wrap py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Resumen general</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-center">Base imponible</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-center">Débito fiscal</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-center">IVA retenido</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-center">IGTF percibido</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total ventas internas no gravadas</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_no_gravadas || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total nota de crédito no gravadas</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_no_gravadas || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total nota de débito no gravadas</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_no_gravadas || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">0,00</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total ventas internas afectadas sólo alícuota general 16.00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total ventas internas afectadas sólo alícuota reducida 8.00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total ventas internas afectadas sólo alícuota adicional 31.00</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de crédito o devoluciones aplicadas en ventas 16%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de crédito o devoluciones aplicadas en ventas 8%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de crédito o devoluciones aplicadas en ventas 31%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de débito o recargos aplicadas en Ventas 16%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de débito o recargos aplicadas en Ventas 8%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total notas de débito o recargos aplicadas en ventas 31%</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
              <div class="flex flex-wrap border border-top-1 py-1">
                <div class="w-full md:w-4/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold">Total</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.ventas_internas_gravadas_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.iva_alic_general || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_iva_retenido_periodo || 0.0)}</h6>
                </div>
                <div class="w-full md:w-2/12 px-2">
                  <h6 className="text-blueGray-700 text-sm font-bold text-end">{formatDecimal(showSummary?.hoja_resumen.total_igtf_percibido || 0.0)}</h6>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}

export default SalesBook;