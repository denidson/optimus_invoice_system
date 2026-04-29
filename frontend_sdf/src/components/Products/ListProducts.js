import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, showProduct, createProduct, activateProduct } from '../../services/apiProducts';
import { getTaxCategories } from "../../services/apiConfig";
import { getClients } from "../../services/api_clients";
import { showProfileClient } from "../../services/apiProfile";
import { AuthContext } from "../../context/AuthContext";
import { encryptText } from '../../services/api';
import ModalConfirmation from "../Modals/ModalConfirmation";
import ModalProducts from "./ModalProducts";
import ModalImportPreview from "../Modals/ModalImportPreviewProducts";
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
import * as XLSX from "xlsx";
const { read, utils } = XLSX;
import Papa from 'papaparse';
import { formatDecimal, formatText, formatDecimalSpecial } from "../../utils/formatters";
import { generateExcelDemo } from "../../utils/excelDemoGenerator";
window.JSZip = JSZip;
DataTable.use(DT);

function ListProducts() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const cliente_id = user?.cliente_id;
  const rol = user?.rol;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenProducts, setModalOpenProducts] = useState(false);
  const [productIdToAction, setProductIdToAction] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [clienteAsignado, setClienteAsignado] = useState(null);

  const downloadExcelDemoProducts = () => {
    const demoData = [
      {
        sku: "PROD-001",
        nombre: "Producto Demo",
        descripcion: "Descripción de ejemplo",
        precio_base: 100,
        peso_kg: 1.5,
        volumen_m3: 0.02,
        iva_categoria: 16,
        cliente_id: "J-12345678-9"
      }
    ];

    const notes = [
      "NOTAS IMPORTANTES:",
      "",
      "IVA:",
      "- Puede ser: 16, 8, 0",
      '- También: "16%" o "IVA 16%"',
      "",
      "CLIENTE:",
      "- Puede ser:",
      "  • RIF (ej: J-12345678-9)",
      "PESO Y VOLUMEN:",
      "- peso_kg: obligatorio",
      "- volumen_m3: obligatorio",
      "",
      "El sistema intentará encontrar coincidencias automáticamente."
    ];

    generateExcelDemo(demoData, "Demo Productos", "Demo_Importacion_Productos.xlsx", notes);
  };

  useEffect(() => {
    const fetchCliente = async () => {
      if (rol === "operador" && cliente_id) {
        try {
          const cliente = await showProfileClient(cliente_id);
          setClienteAsignado(cliente);
        } catch (err) {
          console.error("Error al obtener el cliente asignado:", err);
        }
      }
    };
    fetchCliente();
  }, [rol, cliente_id]);

  useEffect(() => {
    const table = $("#ListProductDt").DataTable();

    $("#ListProductDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    $("#ListProductDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      const action = $(this).data("action");
      handleOpenModal(id, nombre, action);
    });

    $("#ListProductDt tbody").on("click", "button.btn-view", function () {
      const id = $(this).data("id");
      handleOpenModalProducts(id);
    });

    return () => {
      $("#ListProductDt tbody").off("click", "button.btn-edit");
      $("#ListProductDt tbody").off("click", "button.btn-delete");
      $("#ListProductDt tbody").off("click", "button.btn-view");
    };
  }, []);

  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString());
    navigate(`/products/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => navigate(`/products/create`);

  const handleAction = async (id, action) => {
    try {
      let data;
      if (action === 'delete') data = await deleteProduct(id);
      else data = await activateProduct(id);

      toast.success(data.mensaje || 'Acción realizada con éxito', { onClose: refreshProducts });
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el producto");
    }
  };

  const refreshProducts = async () => {
    try {
      const data = await getProducts();
      const table = $('#ListProductDt').DataTable();
      table.clear();
      table.rows.add(data);
      table.draw();
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al recargar la lista de productos");
    }
  };

  const handleConfirm = () => {
    if (productIdToAction) {
      handleAction(productIdToAction.id, productIdToAction.action);
      setModalOpen(false);
    }
  };

  const handleOpenModal = (id, nombre, action) => {
    setProductIdToAction({ id, nombre, action });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    const processData = (data) => {
      if (!data.length) return toast.warn("El archivo está vacío o no tiene formato válido.");
      setPreviewData(data);
      setPreviewOpen(true);
    };

    if (ext === "csv") {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => processData(res.data) });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const workbook = read(bstr, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        processData(utils.sheet_to_json(sheet));
      };
      reader.readAsBinaryString(file);
    } else toast.error("Archivo no soportado. Solo CSV o Excel.");
    e.target.value = "";
  };

  const mapProductToApi = (product, ivaList, clientList) => {
    let clienteFinal = product.cliente_id;

    // Buscar cliente por RIF o nombre
    if (typeof clienteFinal === "string") {
      const match = clientList.find(c => {
        const rif = String(c.rif || "").toLowerCase();
        const nombre = String(c.nombre_empresa || c.nombre || "").toLowerCase();
        return rif === clienteFinal.toLowerCase().trim() || nombre === clienteFinal.toLowerCase().trim();
      });
      clienteFinal = match?.id || clienteFinal;
    }

    // Buscar IVA por tasa
    const ivaId = ivaList.find(i => 
      Number(i.tasa_porcentaje) === Number(product.iva_categoria)
    )?.id || null;
    
    return {
      nombre: product.nombre,
      sku: product.sku,
      precio_base: Number(product.precio_base) || 0,
      descripcion: product.descripcion || "",
      iva_categoria_id: ivaId,
      aplica_iva: true,
      peso_kg: Number(product.peso_kg) || 0,
      volumen_m3: Number(product.volumen_m3) || 0,
      cliente_id: clienteFinal
    };
  };

  const handleConfirmImport = async (cleanedData) => {
    try {
      const ivaList = await getTaxCategories();
      const clientList = rol === "admin" ? await getClients() : clienteAsignado ? [clienteAsignado] : [];
      
      const results = await Promise.allSettled(
        cleanedData.map((product, index) => {
          // Asignar cliente si operador
          if (!product.cliente_id && rol === "operador" && clienteAsignado) {
            product.cliente_id = clienteAsignado.id;
          }
          const body = mapProductToApi(product, ivaList, clientList);
          return createProduct(body);
        })
      );

      const success = results.filter(r => r.status === "fulfilled");
      const failed = results
        .map((r, i) => ({ ...r, index: i }))
        .filter(r => r.status === "rejected");

      if (success.length > 0) {
        toast.success(`Se importaron ${success.length} producto(s) correctamente`);
      }

      if (failed.length > 0) {
        const errorMsg = failed
          .map(f => {
            const err = f.reason;
            const msg =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Error desconocido";
            return `Fila ${f.index + 1}: ${msg}`;
          })
          .join("\n");
        toast.error(errorMsg, { autoClose: 5000, style: { whiteSpace: "pre-line" } });
      }
      await refreshProducts();
    } catch (err) {
      console.error("Error general en importación:", err);
      toast.error("Error general al importar productos");
    }
  };

  const handleOpenModalProducts = async (id) => {
    try {
      const data = await showProduct(id);
      setProductIdToAction(data);
      setModalOpenProducts(true);
    } catch {
      toast.error("Error al obtener detalles del producto.");
    }
  };

  const handleCloseModalProducts = () => setModalOpenProducts(false);

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">

            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Producto/Servicio</h6>
              <div className="flex items-center space-x-3">
                {rol != "visor" && (
                  <>
                    <button className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded" onClick={redirectToCreate}>
                      Crear Producto/Servicio
                    </button>
                    <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                      Importar Producto/Servicio Excel/CSV
                      <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <div className="relative group inline-block">
                      <button
                        onClick={downloadExcelDemoProducts}
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

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListProductDt"
                className="table-auto w-full text-left items-center bg-transparent border-collapse"
                columns={[
                  { title: "SKU", data: "sku", className: "dt-center", render: (data) => formatText(data) },
                  { title: "Nombre", data: "nombre" },
                  { title: "Descripción", data: "descripcion" },
                  { title: "IVA (%)", data: "iva_categoria", className: "dt-center", render: (data) => data ? formatDecimal(data.tasa_porcentaje) : '' },
                  { title: "Precio Base (Bs.)", data: "precio_base", render: (data) => formatDecimal(data) },
                  { title: "Peso (Kg)", data: "peso_kg", render: (data) => formatDecimalSpecial(data, 3) },
                  { title: "Volumen (M³)", data: "volumen_m3", render: (data) => formatDecimalSpecial(data, 4) },
                  { title: "Condición", data: "activo", className: "dt-center", render: (data) => data ? '<i class="fas fa-circle text-emerald-500 mr-2"></i> Activo' : '<i class="fas fa-circle text-red-500 mr-2"></i> Inactivo' },
                  {
                    title: "Acciones",
                    data: "activo",
                    orderable: false,
                    searchable: false,
                    className: 'no-export',
                    render: (data, type, row) => {
                      const viewBtn = `<button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>`;
                      const editBtn = `<button class="btn-edit px-2 py-1 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>`;
                      const toggleBtn = data
                        ? `<button class="btn-delete px-2 py-1 text-red-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="delete"><i class="fa-regular fa-rectangle-xmark fa-lg"></i></button>`
                        : `<button class="btn-delete px-2 py-1 text-green-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="active"><i class="fa-regular fa-square-check fa-lg"></i></button>`;
                      if (rol == 'visor'){
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}</div>`;
                      }else{
                        return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${editBtn}${toggleBtn}</div>`;
                      }
                    }
                  }
                ]}
                options={{
                  serverSide: false,
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    const response = await getProducts();
                    callback({ draw: dataTablesParams.draw, recordsTotal: response.length, recordsFiltered: response.length, data: response });
                  },
                  dom: "<'row'<'col-sm-12 text-start'B>><'row'<'col-sm-6 text-end'l><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",
                  paging: true,
                  searching: true,
                  ordering: true,
                  info: true,
                  responsive: true,
                  pageLength: 20
                }}
              />

              {/* Modales */}
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={`¿Estás seguro de que deseas ${productIdToAction?.action === 'delete' ? 'desactivar' : 'activar'} al producto ${productIdToAction?.nombre || ''}?`}
              />

              <ModalProducts
                isOpen={modalOpenProducts}
                onClose={handleCloseModalProducts}
                product={productIdToAction}
              />

              <ModalImportPreview
                isOpen={previewOpen}
                onClose={() => {
                  setPreviewOpen(false);
                  setPreviewData([]);
                }}
                data={previewData}
                onConfirm={handleConfirmImport}
                cliente_id={cliente_id}
                rol={rol}
                clienteAsignado={clienteAsignado}
                apiSelects={{
                  iva_categoria: getTaxCategories,
                  cliente_id: rol === "admin" ? getClients : async () => clienteAsignado ? [clienteAsignado] : []
                }}
                validationRules={{
                  nombre: v => ({ valid: !!v, message:"Debe ingresar un nombre de producto" }),
                  sku: v => ({ valid: !!v, message:"Debe ingresar un SKU" }),
                  precio_base: v => ({ valid: !isNaN(v) && v !== "", message:"Precio Base inválido" }),
                  iva_categoria: v => ({ valid: !!v, message:"Debe seleccionar una categoría de IVA" }),
                  cliente_id: v => ({ valid: !!v, message:"Debe seleccionar un cliente" }),
                  descripcion: v => ({ valid: !!v, message:"Debe ingresar descripción" }),
                  peso_kg: v => ({ valid: !isNaN(v) && v !== "", message:"Peso inválido" }),
                  volumen_m3: v => ({ valid: !isNaN(v) && v !== "", message:"Volumen inválido" })
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListProducts;