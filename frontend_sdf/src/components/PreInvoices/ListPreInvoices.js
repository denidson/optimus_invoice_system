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
import ModalPreinvoices from "./ModalPreInvoices";
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
import { read, utils } from "xlsx";
import Papa from "papaparse";

window.JSZip = JSZip;
DataTable.use(DT);

function formatDate(valor) {
  if (!valor) return "";

  const fecha = new Date(valor);
  if (isNaN(fecha)) return "";

  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

function ListPreInvoices() {
  const navigate = useNavigate(); // Hook para redirección
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenPreinvoices, setModalOpenPreinvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [modalOpenInInvoices, setModalOpenInInvoices] = useState(false); // Estado para manejar la visibilidad de la modal
  const [preInvoicesIdToDeactivate, setPreInvoicesIdToDeactivate] = useState(null); // Estado para almacenar el ID de la pre-factura a eliminar
  const [preInvoicesIdInInvoices, setPreInvoicesIdInInvoices] = useState(null); // Estado para almacenar el ID de la pre-factura a Facturar
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
      const correlativo_interno = $(this).data("correlativo_interno");
      handleOpenModalInInvoices(id, correlativo_interno);
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
    navigate(`/preinvoices/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => navigate(`/preinvoices/create`);

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
      console.error("Error al recargar las Pre-Facturas:", error);
    }
  };

  // ----------------------
  // Acciones de pre-facturas
  // ----------------------
  const handleAction = async (id) => {
    try {
      const data = await deletePreInvoice(id);
      toast.success(data.mensaje, { onClose: () => setTimeout(() => refreshPreInvoices(), 2000) });
    } catch {
      toast.error("Error al eliminar la Pre-Factura");
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
      setPreInvoicesIdToDeactivate(data);
      setModalOpenPreinvoices(true);
    } catch {
      toast.error("Error al consultar la Pre-Factura.");
    }
  };

  const handleCloseModalPreinvoices = () => setModalOpenPreinvoices(false);

  const handleOpenModalInInvoices = (id, correlativo_interno) => {
    setPreInvoicesIdInInvoices({ id, correlativo_interno });
    setModalOpenInInvoices(true);
  };

  const handleActionInInvoices = async (id) => {
    try {
      const data = await convertInInvoice({ prefactura_id: id });
      toast.success(data.mensaje, { onClose: () => setTimeout(() => refreshPreInvoices(), 2000) });
    } catch {
      toast.error("Error al convertir en factura.");
    }
  };

  const handleConfirmInInvoices = () => {
    if (preInvoicesIdInInvoices) {
      handleActionInInvoices(preInvoicesIdInInvoices.id);
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
        processData(utils.sheet_to_json(sheet));
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Archivo no soportado. Solo CSV o Excel.");
    }

    e.target.value = ""; // limpiar input
  };

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
          console.error("❌ Error en pre-factura:", pre.correlativo_interno, error);
          errores++;
        }
      }

      if (errores === 0) {
        toast.success("✅ Pre-facturas importadas correctamente", { autoClose: 2000 });
      } else {
        toast.warn(`⚠️ ${errores} pre-factura(s) no se pudieron guardar. Revisa la consola.`, { autoClose: 4000 });
      }
    } catch (err) {
      console.error("Error al importar:", err);
      toast.error("❌ Error inesperado al importar pre-facturas");
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
              <h6 className="text-blueGray-700 text-xl font-bold">
                Lista de Pre-Facturas
              </h6>
              {rol != "admin" && (
                <div className="flex items-center space-x-3">
                  <button
                    className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded"
                    onClick={redirectToCreate}
                  >
                    Crear Pre-Facturas
                  </button>
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
              )}
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <div className="flex space-x-2 mb-3">
                <h3 class="text-blueGray-700 font-bold me-3">Buscar por:</h3><br/>
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
              </div>
              <style>{`

              `}</style>
              <DataTable
                id="ListPreInvoicesDt"
                className="table-auto w-full"
                columns={[
                  {
                    title: "Fecha",
                    data: "fecha_factura",
                    className: "dt-center",
                    render: (data, type, row) => {
                      return new Intl.DateTimeFormat("es-VE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      }).format(new Date(data));
                    }
                  },
                  { title: "RIF", data: "cliente_final_rif", className: "dt-center" },
                  { title: "Razón Social", data: "cliente_final_nombre" },
                  { title: "Correlativo", data: "correlativo_interno", className: "dt-center" },
                  {
                    title: "Base imponible (Bs.)",
                    data: "total_base",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "I.V.A. (Bs.)",
                    data: "total_impuestos",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "Total (Bs.)",
                    data: "total_neto",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "Pagado en divisas (Bs.)",
                    data: "monto_pagado_divisas",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `${formatted}`;
                      }
                      // Para ordenamiento y cálculos → devolver el valor numérico real
                      return data;
                    }
                  },
                  {
                    title: "IGTF (Bs.)",
                    data: "igtf_monto",
                    render: (data, type, row) => {
                      if (type === "display" || type === "filter") {
                        // Formato de número con separadores para Venezuela
                        const formatted = new Intl.NumberFormat("es-VE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(data);

                        return `${formatted}`;
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
                    title: "Estatus",
                    data: "estatus",
                    className: "dt-center",
                    orderable: true,
                    searchable: true,
                    render: (data, type, row) => {
                      if (data == 'borrador'){
                        return '<i class="fas fa-circle text-orange-500 mr-2"></i> ' + data.toUpperCase();
                      }else if (data == 'facturada'){
                        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + data.toUpperCase();
                      } else {
                        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + data.toUpperCase();
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
                      const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
                      if (rol === "admin") {
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
                      }
                      if (row.estatus.toUpperCase() != 'FACTURADA'){
                        const editBtn = `<button class="btn-edit px-2 py-1 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>`;
                        const invoiceBtn = `<button class="btn-invoice px-1 py-1 mx-0 text-green-600" data-id="${row.id}" data-correlativo_interno="${row.correlativo_interno}"><i class="fa-solid fa-file-invoice fa-lg"></i></button>`;
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${editBtn}${invoiceBtn}</div>`;
                      }else{
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
                      }
                    }
                  },
                ]}
                options={{
                  columnDefs:[{
                    targets: [3, 4, 5, 7, 8, 9], // índices de columnas a ocultar (ej: RIF, Zona)
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

                            return String(value).toLowerCase().includes(searchValue.toUpperCase());
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
                          title: "Lista de Pre-Facturas"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de Pre-Facturas",  // título dentro del archivo
                          filename: "Lista_pre_facturas",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de Pre-Facturas",
                          filename: "Lista_pre_facturas",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de Pre-Facturas",
                          filename: "Lista_pre_facturas",
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
                          title: "Lista de Pre-Facturas",
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
                                Fecha: item.timestamp.replace("T", " ").slice(0, 19),
                                Servicio: item.endpoint,
                                Acción:
                                  item.method === "GET"
                                    ? "CONSULTA"
                                    : item.method === "POST"
                                    ? (item.endpoint === "/api/login" ? "INICIO DE SESIÓN" : "CREACIÓN")
                                    : item.method === "PUT"
                                    ? "ACTUALIZACIÓN"
                                    : "DESACTIVACIÓN/ACTIVACIÓN",
                                Origen: item.request_ip,
                                Respuesta: item.response_status_code,
                                "Duración (ms)": item.duration_ms,
                                Usuario: item.usuario?.email || "",
                              })));

                              utils.book_append_sheet(wb, ws, "Auditoría");

                              const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                              const blob = new Blob([wbout], { type: "application/octet-stream" });
                              const link = document.createElement("a");
                              link.href = URL.createObjectURL(blob);
                              link.download = "Pre-Facturas.xlsx";
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
                message={`¿Estás seguro de que deseas eliminar la Pre-Factura de ${preInvoicesIdToDeactivate?.nombre_empresa || ""}?`}
              />

              <ModalPreinvoices
                isOpen={modalOpenPreinvoices}
                onClose={handleCloseModalPreinvoices}
                message={preInvoicesIdToDeactivate}
              />

              <ModalConfirmation
                isOpen={modalOpenInInvoices}
                onClose={handleCloseModalInInvoices}
                onConfirm={handleConfirmInInvoices}
                message={`¿Convertir en factura la Pre-Factura ${preInvoicesIdInInvoices?.correlativo_interno || ""}?`}
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

export default ListPreInvoices;