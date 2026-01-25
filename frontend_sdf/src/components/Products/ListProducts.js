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
const { read, utils } = XLSX;3
import Papa from 'papaparse';
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";

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

  const handleConfirmImport = async (cleanedData) => {
    try {
      const ivaList = await getTaxCategories();
      const clientList = rol === "admin" ? await getClients() : clienteAsignado ? [clienteAsignado] : [];

      for (let product of cleanedData) {
        const ivaCategoria = product.iva_categoria
          ? ivaList.find(
              i => i.nombre.toLowerCase() === String(product.iva_categoria).toLowerCase() ||
              i.tasa_porcentaje === Number(product.iva_categoria)
            )
          : null;

        let clienteFinal = product.cliente_id;
        if (!clienteFinal && rol === "operador" && clienteAsignado) clienteFinal = clienteAsignado.id;

        await createProduct({ ...product, iva_categoria_id: ivaCategoria?.id || null, cliente_id: clienteFinal });
      }

      const count = cleanedData.length;
      toast.success(`Se importó ${count} ${count > 1 ? "productos" : "producto"} exitosamente`);
      await refreshProducts();
    } catch (err) {
        console.error("Error al importar productos:", err);
        let backendMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Error desconocido al importar productos";

        if (Array.isArray(err?.response?.data)) {
          backendMsg = err.response.data
            .map((e, i) => `Fila ${i + 1}: ${e.message || e.error || JSON.stringify(e)}`)
            .join("\n");
        }

        toast.error(backendMsg, {
          autoClose: 3000,
          style: { whiteSpace: "pre-line" },
        });
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
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Productos</h6>
              <div className="flex items-center space-x-3">
                <button className="bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold py-2 px-4 rounded" onClick={redirectToCreate}>
                  Crear Producto
                </button>
                <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                  Importar Productos Excel/CSV
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListProductDt"
                className="table-auto w-full text-left items-center bg-transparent border-collapse"
                columns={[
                  { title: "SKU", data: "sku", className: "dt-center", render: (data, type, row) => {
                      return formatText(data);
                    }
                  },
                  { title: "Nombre", data: "nombre" },
                  { title: "Descripción", data: "descripcion" },
                  { title: "IVA (%)", data: "iva_categoria", className: "dt-center", render: (data, type, row) => {
                      return data ? formatMoney(data.tasa_porcentaje) : '';
                    }
                  },
                  { title: "Precio Base (Bs.)", data: "precio_base", render: (data, type, row) => {
                      return formatMoney(data);
                    }
                  },
                  { title: "Condición", data: "activo", className: "dt-center", render: (data, type, row) => {
                      if (!data){
                        return '<i class="fas fa-circle text-red-500 mr-2"></i> ' + formatText('Inactivo');
                      }else{
                        return '<i class="fas fa-circle text-emerald-500 mr-2"></i> ' + formatText('Activo');
                      }
                    }
                  },
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
                      return `<div style="display:flex;justify-content:center;align-items:center;gap:0.25rem;white-space:nowrap;">${viewBtn}${editBtn}${toggleBtn}</div>`;
                    }
                  }
                ]}
                options={{
                  dom: //B = Buttons, l = LengthMenu (mostrar X registros), f = Filtro (search), t = Tabla, i = Info (mostrando de X a Y de Z), p = Paginación
                    "<'row'<'col-sm-12 text-start'B>>" +                // Fila 2: botones ocupando todo el ancho
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +    // Fila 1: lengthMenu izquierda, filtro derecha
                    "<'row'<'col-sm-12'tr>>" +               // Fila 3: tabla
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",     // Fila 4: info izquierda, paginación derecha
                  serverSide: false,
                  processing: true,
                  ajax: async (dataTablesParams, callback) => {
                    try {
                      const response = await getProducts();
                      callback({
                        draw: dataTablesParams.draw,
                        recordsTotal: response.length,
                        recordsFiltered: response.length,
                        data: response
                      });
                    } catch (err) { console.error(err); }
                  },
                  createdRow: function (row) {
                    // Reducir tamaño de fuente y forzar nowrap en todas las celdas
                    $(row).find("td").css({
                      "font-size": "0.85rem",
                      "white-space": "nowrap",
                      "overflow": "hidden",
                      "text-overflow": "ellipsis"
                    });
                  },
                  headerCallback: function(thead) {
                    $(thead).find("th").css({
                      "font-size": "0.85rem", 
                      "text-align": "center",
                      "font-weight": "bold"
                    });
                  },
                  paging: true,
                  searching: true,
                  ordering: true,
                  info: true,
                  responsive: true,
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
                          title: "Lista de productos"   // nombre del documento en el portapapeles
                        },
                        {
                          extend: "excelHtml5",
                          text: "Excel",
                          title: "Lista de productos",  // título dentro del archivo
                          filename: "Lista_productos",   // nombre del archivo generado (sin extensión)
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "csvHtml5",
                          text: "CSV",
                          title: "Lista de productos",
                          filename: "Lista_productos",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
                        {
                          extend: "pdfHtml5",
                          text: "PDF",
                          title: "Lista de productos",
                          filename: "Lista_productos",
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
                          title: "Lista de productos",
                          exportOptions: {
                            columns: ':not(.no-export)'
                          }
                        },
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
                  cliente_id: v => ({ valid: !!v, message:"Debe seleccionar un cliente" })
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
