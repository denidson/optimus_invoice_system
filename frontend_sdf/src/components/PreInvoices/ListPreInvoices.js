import React, { useState, useEffect } from "react";
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

  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";

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
    $("#ListPreInvoicesDt").DataTable().ajax.reload();
  };

  const handleAction = async (id) => {
  // ----------------------
  // Acciones de pre-facturas
  // ----------------------
  const refreshPreInvoices = async () => {
    try {
      location.reload(true);
    } catch (error) {
      console.error("Error al recargar las Pre-Facturas:", error);
    }
  };

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
                correlativo_interno: row.correlativo_interno || "",
                cliente_final_rif: row.cliente_final_rif || "",
                cliente_final_nombre: row.cliente_final_nombre || "",
                fecha_factura: row.fecha_factura || "",
                tipo_documento: row.tipo_documento || "FC",
                serial: row.serial || "",
                zona: row.direccion || row.zona || "",
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
      let cliente_id = null;
      if (authData) {
        cliente_id = JSON.parse(authData)["cliente_id"];
      }

      let errores = 0;

      for (let pre of prefacturasEditadas) {
        const payload = {
          prefactura: {
            ...pre,
            cliente_id, // ✅ agrega el cliente del usuario autenticado
          },
          items: pre.items.map((item) => ({
            producto_sku: item.producto_sku,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento_porcentaje: item.descuento_porcentaje,
            iva_categoria_id: item.iva_categoria_id,
            descripcion: item.descripcion,
          })),
        };

        try {
          await createPreInvoice(payload);
        } catch (error) {
          console.error("❌ Error en pre-factura:", pre.correlativo_interno, error);
          errores++;
        }
      }

      if (errores === 0) {
        toast.success("✅ Pre-facturas importadas correctamente", {
          autoClose: 2000,
          onClose: () => {
            setModalImportOpen(false);
            setPreInvoicesToImport([]);
            setTimeout(() => refreshPreInvoices(), 500);
          },
        });
      } else {
        toast.warn(`⚠️ ${errores} pre-factura(s) no se pudieron guardar. Revisa la consola.`, {
          autoClose: 4000,
        });
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
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">
                Lista de Pre-Facturas
              </h6>
              {rol === "operador" && (
                <div className="flex items-center space-x-3">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded"
                  onClick={actionSearch}>
                  Buscar
                </button>
              </div>
              <DataTable
                id="ListPreInvoicesDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "Fecha", data: "fecha_factura" },
                  { title: "RIF", data: "cliente_final_rif" },
                  { title: "Razón Social", data: "cliente_final_nombre" },
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
                    searchable: true,
                    render: (data, type, row) => {
                      return data ? data.toUpperCase():'';
                    }
                  },
                  {
                    title: "Acciones",
                    data: null,
                    render: (data, type, row) => {
                      if (rol === "admin") {
                        return `<button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                          <i class="fa-solid fa-lg fa-expand"></i>
                        </button>`;
                      }
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
                    },
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
                      const response = await getPreInvoices(query);

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
                  searching: false,
                  ordering: true,
                  info: true,
                  scrollx: true,
                  responsive: true,
                  pageLength: 20,         // cantidad inicial por página
                  lengthMenu: [20, 50, 100], // opciones en el desplegable, false para oculta el selector
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
                    },
                    {
                      text: "Exportar todo (Excel)",
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