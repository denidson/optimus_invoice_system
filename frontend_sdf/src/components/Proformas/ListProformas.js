import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPreInvoices,
  deletePreInvoice,
  showPreInvoice,
  createPreInvoice,
  convertInInvoice,
} from "../../services/api_pre_invoices";
import { encryptText } from "../../services/api";
import ModalConfirmation from "../Modals/ModalConfirmation";
import ModalProformas from "./ModalProformas";
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
import * as XLSX from "xlsx";
const { utils, read } = XLSX;
import Papa from "papaparse";
import { formatDecimal, formatDate, formatDateTime, formatText } from "../../utils/formatters";
import { tooltipBtn } from "../../utils/datatableTooltip";
import { generateExcelDemo } from "../../utils/excelDemoGenerator";

window.JSZip = JSZip;
DataTable.use(DT);

function ListProformas() {
  const navigate = useNavigate(); // Hook para redirección
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenPreinvoices, setModalOpenPreinvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenInInvoices, setModalOpenInInvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [preInvoicesIdToDeactivate, setPreInvoicesIdToDeactivate] = useState(null); // Estado para almacenar el ID de la proformas a eliminar
  const [preInvoicesIdInInvoices, setPreInvoicesIdInInvoices] = useState(null); // Estado para almacenar el ID de la proformas a Facturar
  const [filterType, setFilterType] = useState("");
  const [modalImportOpen, setModalImportOpen] = useState(false);
  const [preInvoicesToImport, setPreInvoicesToImport] = useState([]);
  var responseCache = useState(false);

  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";
  var authclientId;
  if (authData) {
    authclientId = JSON.parse(authData)['cliente_id'];
  }

  const downloadExcelDemoPreInvoices = () => {
    const demoData = [
      {
        correlativo_interno: "PREF-0002",
        cliente_final_nombre: "Ferretería El Tornillo Feliz",
        cliente_final_rif: "V-12312312-3",
        cliente_final_email: "",
        cliente_final_telefono: "",
        fecha_factura: "2025-11-20",
        tipo_documento: "FC",
        serial: "S001",
        cliente_final_direccion: "",
        zona: "CCS",
        aplica_igtf: "Si",
        monto_pagado_divisas: 100,
        igtf_porcentaje: 3,
        igtf_monto: "",
        producto_sku: "CONS-001",
        cantidad: 4,
        precio_unitario: 120.5,
        descuento_porcentaje: 0
      }
    ];

    const notes = [
      "NOTAS IMPORTANTES:",
      "",
      "TIPO DOCUMENTO:",
      "- FC: Factura",
      "- NC: Nota de Crédito",
      "- ND: Nota de Débito",
      "",
      "IGTF:",
      "- aplica_igtf: Si o No",
      "- igtf_porcentaje: normalmente 3",
      "",
      "FECHA:",
      "- Formato: YYYY-MM-DD",
      "",
      "AGRUPACIÓN:",
      "- correlativo_interno agrupa productos en una misma factura"
    ];

    generateExcelDemo(
      demoData,
      "Demo Proformas",
      "Demo_Importacion_Proformas.xlsx",
      notes
    );
  };

  // ----------------------
  // DataTable event listeners
  // ----------------------
  useEffect(() => {
    const table = $("#ListPreInvoicesDt").DataTable();

    $("#ListPreInvoicesDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    // Click convertir en factura
    $("#ListPreInvoicesDt tbody").on("click", "button.btn-invoice", function () {
      const id = $(this).data("id");
      const factura_afectada_id = $(this).data("factura_afectada_id");
      const correlativo_interno = $(this).data("correlativo_interno");
      const descripcion = $(this).data("descripcion");
      handleOpenModalInInvoices(id, factura_afectada_id, correlativo_interno, descripcion);
    });

    $("#ListPreInvoicesDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      handleOpenModal(id, nombre);
    });

    $("#ListPreInvoicesDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      handleOpenModalPreinvoices(id);
    });

    return () => {
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-edit");
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-delete");
      $("#ListPreInvoicesDt tbody").off("click", "button.btn-view");
    };
  }, []); // Se ejecuta solo una vez

  // ----------------------
  // Redirecciones
  // ----------------------
  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/proformas/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => navigate(`/proformas/create`);
  const actionSearch = () => {
    const table = $("#ListPreInvoicesDt").DataTable();
    table.clear();
    table.search("");
    table.columns().search("");
    table.ajax.reload();
  };


  const refreshPreInvoices = async () => {
    try {
      location.reload(true);
    } catch (error) {
      console.error("Error al recargar las Proformas:", error);
    }
  };

  // ----------------------
  // Acciones de proformass
  // ----------------------
  const handleAction = async (id) => {
    try {
      const data = await deletePreInvoice(id);
      toast.success(data.mensaje, { onClose: () => setTimeout(() => refreshPreInvoices(), 2000) });
    } catch {
      toast.error("Error al eliminar la Proformas");
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

  const handleOpenModalPreinvoices = async (id) => {
    try {
      const data = await showPreInvoice(id);
      //console.log('data: ', data);
      setPreInvoicesIdToDeactivate(data);
      setModalOpenPreinvoices(true);
    } catch {
      toast.error("Error al consultar la Proformas.");
    }
  };

  const handleCloseModalPreinvoices = () => setModalOpenPreinvoices(false);

  const handleOpenModalInInvoices = (id, factura_afectada_id, correlativo_interno, descripcion) => {
    setPreInvoicesIdInInvoices({ id, factura_afectada_id, correlativo_interno, descripcion });
    setModalOpenInInvoices(true);
  };

  const handleActionInInvoices = async (id, factura_afectada_id) => {
    try {
      const data = await convertInInvoice({ prefactura_id: id, factura_afectada_id, factura_afectada_id });
      toast.success(data.mensaje, { onClose: () => setTimeout(() => refreshPreInvoices(), 2000) });
    } catch {
      toast.error("Error al convertir en factura.");
    }
  };

  const handleConfirmInInvoices = () => {
    if (preInvoicesIdInInvoices) {
      handleActionInInvoices(preInvoicesIdInInvoices.id, preInvoicesIdInInvoices.factura_afectada_id);
      setModalOpenInInvoices(false);
    }
  };

  const handleCloseModalInInvoices = () => setModalOpenInInvoices(false);

  // ----------------------
  // Lectura de archivos e importación
  // ----------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    const processData = (data) => {
      // Agrupamos prefacturas por correlativo_interno
      const grouped = Object.values(
        data.reduce((acc, row) => {
          const key = row.correlativo_interno;
          if (!acc[key]) {
            acc[key] = {
              prefactura: {
                id: "#",  // o row.id si viene del Excel
                cliente_final_id: row.cliente_final_id || "",
                cliente_final_nombre: row.cliente_final_nombre || "",
                cliente_final_rif: row.cliente_final_rif || "",
                cliente_final_telefono: row.cliente_final_telefono || "",
                cliente_final_email: row.cliente_final_email || "",
                cliente_final_direccion: row.cliente_final_direccion || "",
                cliente_id: authclientId, // puedes asignar luego al confirmar importación
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

      console.log("📦 Datos agrupados:", grouped);
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
        const jsonData = utils.sheet_to_json(sheet, { defval: "" });

        processData(jsonData);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Archivo no soportado. Solo CSV o Excel.");
    }

    e.target.value = ""; // limpiar input
  };

  var columns = [];
  var columnDefs;

  columns.push({ title: "Fecha", data: "fecha_factura", className: "dt-center",
    render: (data, type, row) => {
      return formatDate(data);
    }
  });

  if (rol == 'admin' || rol == 'auditor'){
    columns.push({ title: "RIF (Afiliada)", data: "cliente_emisor.rif", className: "dt-center", render: (data, type, row) => {
        return formatText(data);
      }
    });
    columns.push({ title: "Nombre (Afiliada)", data: "cliente_emisor.nombre_empresa", render: (data, type, row) => {
        return formatText(data);
      }
    });
    columnDefs = [6, 7, 8, 10, 11, 12, 13]
  }else{
    columnDefs = [4, 5, 6, 8, 9, 10, 11]
  }

  columns.push({ title: "RIF", data: "cliente_final_rif", className: "dt-center", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({ title: "Razón Social", data: "cliente_final_nombre", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({
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
  });
  columns.push({ title: "Correlativo", data: "correlativo_interno", className: "dt-center", render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({
    title: "Base imponible (Bs.)",
    data: "total_base",
    render: (data, type, row) => {
      return formatDecimal(data);
    }
  });
  columns.push({
    title: "I.V.A. (Bs.)",
    data: "total_impuestos",
    render: (data, type, row) => {
      return formatDecimal(data);
    }
  });
  columns.push({
    title: "Total (Bs.)",
    data: "total_neto",
    render: (data, type, row) => {
      return formatDecimal(data);
    }
  });
  columns.push({
    title: "Pagado en divisas (Bs.)",
    data: "monto_pagado_divisas",
    render: (data, type, row) => {
      return formatDecimal(data);
    }
  });
  columns.push({
    title: "IGTF (Bs.)",
    data: "igtf_monto",
    render: (data, type, row) => {
      return formatDecimal(data);
    }
  });
  columns.push({
    title: "Zona",
    data: "zona",
    orderable: true,
    searchable: false,
    render: (data, type, row) => {
      return formatText(data);
    }
  });
  columns.push({
    title: "Estatus",
    data: "estatus",
    className: "dt-center",
    orderable: true,
    searchable: true,
    render: (data, type, row) => {
      if (data == 'borrador'){
        return '<i class="fas fa-circle text-orange-500 mr-2"></i> ' + formatText(data);
      }else if (data == 'facturada'){
        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText(data);
      } else {
        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText(data);
      }

    }
  });
  columns.push({
    title: "Acciones",
    data: null,
    orderable: false,
    searchable: false,
    className: 'no-export',
    render: (data, type, row) => {
      // const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
      const viewBtn = tooltipBtn({
        html: `
          <button
            class="btn-view px-2 py-1 text-gray-700"
            data-id="${row.id}">
            <i class="fa-solid fa-lg fa-expand"></i>
          </button>
        `,
        text: "Ver proformas"
      });

      if (rol === "admin" || rol === 'visor' || rol == "auditor") {
        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
      }
      if (row.estatus.toUpperCase() != 'FACTURADA'){
        // const editBtn = `<button class="btn-edit px-2 py-1 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>`;
        // const invoiceBtn = `<button class="btn-invoice px-1 py-1 mx-0 text-green-600" data-id="${row.id}" data-factura_afectada_id="${row.factura_afectada_rel ? row.factura_afectada_rel.id : 0}" data-correlativo_interno="${row.correlativo_interno}"><i class="fa-solid fa-file-invoice fa-lg"></i></button>`;
        const editBtn = tooltipBtn({
          html: `
            <button
              class="btn-edit px-2 py-1 text-blue-600"
              data-id="${row.id}">
              <i class="fa-solid fa-lg fa-pen-to-square"></i>
            </button>
          `,
          text: "Editar proformas"
        });
        const invoiceBtn = tooltipBtn({
          html: `
            <button
              class="btn-invoice px-1 py-1 mx-0 text-green-600"
              data-descripcion="${((row.tipo_documento == 'FC' ? 'Factura' : (row.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') ))}"
              data-id="${row.id}"
              data-factura_afectada_id="${
                row.factura_afectada_rel ? row.factura_afectada_rel.id : 0
              }"
              data-correlativo_interno="${row.correlativo_interno}">
              <i class="fa-solid fa-file-invoice fa-lg"></i>
            </button>
          `,
          text: "Convertir en " + ((row.tipo_documento == 'FC' ? 'Factura' : (row.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') ))
        });
        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${editBtn}${invoiceBtn}</div>`;
      }else{
        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
      }
    }
  });


  // ----------------------
  // Confirmar importación (guardar en backend)
  // ----------------------
  const handleConfirmImport = async (prefacturasEditadas) => {
    try {
      const authData = localStorage.getItem("authData");
      const cliente_id = authData ? JSON.parse(authData).cliente_id : null;

      console.log("👷 Cliente ID autenticado:", cliente_id);
      console.log("🚀 Prefacturas a importar:", prefacturasEditadas);

      let errores = 0;

      for (let pre of prefacturasEditadas) {
        // Asignamos cliente_id del usuario autenticado
        const payload = { ...pre, cliente_id };

        try {
          await createPreInvoice(payload);
        } catch (error) {
          console.error("❌ Error en proformas:", pre.correlativo_interno, error);
          errores++;
        }
      }

      if (errores === 0) {
        toast.success("✅ Proformas importadas correctamente", { autoClose: 2000 });
      } else {
        toast.warn(`⚠️ ${errores} proformas(s) no se pudieron guardar. Revisa la consola.`, { autoClose: 4000 });
      }
    } catch (err) {
      console.error("Error al importar:", err);
      toast.error("❌ Error inesperado al importar proformass");
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Proformas</h6>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-blueGray-700 font-bold mr-3 whitespace-nowrap">Buscar por:</h3><br/>
                    {/* SELECT PRINCIPAL */}
                    <select id="filter_type" className="border p-2 rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                      <option value=""> - </option>
                      <option value="estatus">Estatus</option>
                      <option value="zona">Zona</option>
                      <option value="correlativo_interno">Correlativo Interno</option>
                      <option value="cliente_final_rif">RIF del cliente</option>
                      <option value="rango_fecha">Rango de fecha</option>
                    </select>
                    {filterType === "estatus" && (
                      <select id="filtro_estatus" className="border p-2 rounded">
                        <option value="">Todos</option>
                        <option value="borrador">Borrador</option>
                        <option value="facturada">Facturada</option>
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
                    {(rol != "visor" && rol != "auditor") && (
                      <button
                        className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                        onClick={redirectToCreate}>
                        Crear Proformas
                      </button>
                    )}
                    {(rol != "admin" && rol != "visor" && rol != "auditor") && (
                      <>
                        <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                          Importar Excel/CSV
                          <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>

                        {/* BOTÓN DESCARGAR DEMO */}
                        <div className="relative group inline-block">
                          <button
                            onClick={downloadExcelDemoPreInvoices}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                          >
                            <i className="fas fa-download"></i>
                          </button>

                          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                            px-2 py-1 text-xs text-white bg-gray-800 rounded
                            opacity-0 group-hover:opacity-100 transition-opacity
                            whitespace-nowrap pointer-events-none z-50">
                            Descargar Excel de ejemplo
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListPreInvoicesDt"
                className="table-auto w-full"
                columns={columns}
                options={{
                  columnDefs:[{
                    targets: columnDefs, // índices de columnas a ocultar (ej: RIF, Zona)
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
                  ajax: async (dataTablesParams, callback) => {
                    try {

                      const searchValue = dataTablesParams.search?.value?.toLowerCase() || '';
                      //console.log('searchValue: ', searchValue);
                      // DataTables usa start y length, los convertimos a page y per_page
                      const page = Math.floor(dataTablesParams.start / dataTablesParams.length) + 1;
                      const per_page = dataTablesParams.length;
                      const query = {
                        page,
                        per_page
                      };

                      // Añadir filtros según filtro activo
                      console.log('filtro_estatus: ', $('#filtro_estatus option:selected').val());
                      if ($('#filter_type option:selected').val() === "estatus" && $('#filtro_estatus option:selected').val() != undefined){
                        query.estatus = $('#filtro_estatus option:selected').val();
                      }else{
                        query.estatus = 'borrador';
                      }

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
                        const response = await getPreInvoices(query);

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

                      // Retornamos a DataTables con la estructura esperada
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: data,
                      });
                    } catch (err) {
                      console.error("Error cargando Proformas:", err);
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  },
                  paging: true,
                  ordering: true,
                  info: true,
                  scrollx: true,
                  responsive: true,
                  pageLength: 20,         // cantidad inicial por página
                  lengthMenu: [20, 50, 100], // opciones en el desplegable, false para oculta el selector
                  //dom: "Blfrtip",
                  buttons: [
                    {
                      extend: "collection",
                      text: "Exportar",
                      className: "bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded",
                      buttons: [
                        {
                          extend: "copyHtml5",
                          text: "Copiar",
                          title: "Lista de Proformas"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de Proformas",  // título dentro del archivo
                          filename: "Lista_proformas",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de Proformas",
                          filename: "Lista_proformas",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de Proformas",
                          filename: "Lista_proformas",
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
                          title: "Lista de Proformas",
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
                            console.log('dt: ', dt);
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
                              // Cargar todas las páginas hasta completar total_pages
                              do {
                                query.page = page;
                                query.per_page = 100;
                                const response = await getPreInvoices(query);
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
                              link.download = "Proformas.xlsx";
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
                  }
                }}
              />

              {/* Modales */}
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={`¿Estás seguro de que deseas eliminar la Proformas de ${preInvoicesIdToDeactivate?.nombre_empresa || ""}?`}
              />

              <ModalProformas
                isOpen={modalOpenPreinvoices}
                onClose={handleCloseModalPreinvoices}
                message={preInvoicesIdToDeactivate}
              />

              <ModalConfirmation
                isOpen={modalOpenInInvoices}
                onClose={handleCloseModalInInvoices}
                onConfirm={handleConfirmInInvoices}
                message={`¿Convertir la ${preInvoicesIdInInvoices?.descripcion || ""} (${preInvoicesIdInInvoices?.correlativo_interno || ""}) en documento legal?`}
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

export default ListProformas;