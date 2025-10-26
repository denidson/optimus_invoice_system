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
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenPreinvoices, setModalOpenPreinvoices] = useState(false);
  const [modalOpenInInvoices, setModalOpenInInvoices] = useState(false);
  const [preInvoicesIdToDeactivate, setPreInvoicesIdToDeactivate] = useState(null);
  const [preInvoicesIdInInvoices, setPreInvoicesIdInInvoices] = useState(null);

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
      $("#ListPreInvoicesDt tbody").off();
    };
  }, []);

  // ----------------------
  // Redirecciones
  // ----------------------
  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/preinvoices/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => navigate(`/preinvoices/create`);

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
              <DataTable
                id="ListPreInvoicesDt"
                className="table-auto w-full text-left"
                columns={[
                  { title: "Fecha", data: "fecha_factura" },
                  { title: "RIF", data: "cliente_final_rif" },
                  { title: "Razón Social", data: "cliente_final_nombre" },
                  { title: "Correlativo", data: "correlativo_interno" },
                  { title: "Total", data: "total_neto" },
                  {
                    title: "Acciones",
                    data: null,
                    render: (data, type, row) => {
                      if (rol === "admin") {
                        return `<button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                          <i class="fa-solid fa-lg fa-expand"></i>
                        </button>`;
                      }
                      if (row.estatus?.toUpperCase() !== "FACTURADA") {
                        return `
                          <button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                            <i class="fa-solid fa-lg fa-expand"></i>
                          </button>
                          <button class="btn-invoice px-1 py-1 mx-0 text-green-600" 
                            data-id="${row.id}" 
                            data-correlativo_interno="${row.correlativo_interno}">
                            <i class="fa-solid fa-file-invoice fa-lg"></i>
                          </button>`;
                      }
                      return `<button class="btn-view px-1 py-1 mx-0" data-id="${row.id}">
                        <i class="fa-solid fa-lg fa-expand"></i>
                      </button>`;
                    },
                  },
                ]}
                options={{
                  ajax: async (params, callback) => {
                    try {
                      const res = await getPreInvoices();
                      callback({
                        draw: params.draw,
                        recordsTotal: res.length,
                        recordsFiltered: res.length,
                        data: res,
                      });
                    } catch (err) {
                      console.error(err);
                    }
                  },
                  paging: true,
                  searching: true,
                  ordering: true,
                  pageLength: 10,
                  language: { search: "Buscar:" },
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
