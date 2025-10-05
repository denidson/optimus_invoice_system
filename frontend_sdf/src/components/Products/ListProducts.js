import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, showProduct, createProduct, activateProduct } from '../../services/apiProducts';
import { encryptText } from '../../services/api';
import ModalConfirmation from "../Modals/ModalConfirmation";
import ModalProducts from "./ModalProducts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Import DataTables styles
import "datatables.net-dt/css/dataTables.dataTables.css";
// Export extensions
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { read, utils } from 'xlsx';
import Papa from 'papaparse';

window.JSZip = JSZip;
DataTable.use(DT);

function ListProducts() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenProducts, setModalOpenProducts] = useState(false);
  const [productIdToAction, setProductIdToAction] = useState(null); // Estado para almacenar ID y acción del producto

  useEffect(() => {
    const table = $("#ListProductDt").DataTable();

    // Edit button
    $("#ListProductDt tbody").on("click", "button.btn-edit", function () {
      const id = $(this).data("id");
      redirectToEdit(id);
    });

    // Delete or activate button
    $("#ListProductDt tbody").on("click", "button.btn-delete", function () {
      const id = $(this).data("id");
      const nombre = $(this).data("nombre");
      const action = $(this).data("action");
      handleOpenModal(id, nombre, action);
    });

    // View button
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

  const redirectToCreate = () => {
    navigate(`/products/create`);
  };

  const handleAction = async (id, action) => {
    try {
      let data;
      if (action === 'delete') {
        data = await deleteProduct(id);
      } else {
        data = await activateProduct(id);
      }

      toast.success(data.mensaje || 'Acción realizada con éxito', {
        onClose: () => {
          // 🔹 Recarga el DataTable directamente:
          $('#ListProductDt').DataTable().ajax.reload(null, false);
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el producto");
    }
  };


  const refreshProducts = async () => {
    try {
      const data = await getProducts();
      // Aquí podrías actualizar un estado si tu tabla dependiera de él
      console.log("Productos recargados:", data);
    } catch (error) {
      console.error("Error loading products:", error);
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

  // 🔹 Manejo de carga de archivos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await uploadProducts(results.data);
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
        await uploadProducts(data);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Archivo no soportado. Solo CSV o Excel.');
    }
  };

  // 🔹 Subida de productos
  const uploadProducts = async (productsArray) => {
    try {
      for (let product of productsArray) {
        await createProduct(product);
      }
      toast.success('Productos importados exitosamente');
      refreshProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error importando productos');
    }
  };

  const handleOpenModalProducts = async (id) => {
    try {
      const data = await showProduct(id);
      setProductIdToAction(data);
      setModalOpenProducts(true);
    } catch (err) {
      toast.error("Error al obtener detalles del producto.");
    }
  };

  const handleCloseModalProducts = () => {
    setModalOpenProducts(false);
  };

  return (
    <div className="md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header Card */}
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between items-center border-b">
              <h6 className="text-blueGray-700 text-xl font-bold">Lista de Productos</h6>
              <div className="flex items-center space-x-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={redirectToCreate}>
                  Crear Producto
                </button>
              </div>
            </div>

            {/* DataTable */}
            <div className="block w-full overflow-x-auto px-4 py-4">
              <DataTable
                id="ListProductDt"
                className="table-auto w-full text-left items-center w-full bg-transparent border-collapse"
                columns={[
                  { title: "SKU", data: "sku" },
                  { title: "Nombre", data: "nombre" },
                  { title: "Descripción", data: "descripcion" },
                  { title: "Precio Base", data: "precio_base" },
                  {
                    title: "IVA",
                    data: "iva_categoria",
                    render: (data) => data ? `${data.tasa_porcentaje}%` : "N/A"
                  },
                  {
                    title: "Condición",
                    data: "activo",
                    render: (data) => {
                      return data
                        ? '<label class="bg-emerald-400 text-white py-1 px-3 rounded-full text-center">Activo</label>'
                        : '<label class="bg-red-400 text-white py-1 px-3 rounded-full text-center">Inactivo</label>';
                    }
                  },
                  // {
                  //   title: "Acciones",
                  //   data: 'activo',
                  //   orderable: false,
                  //   searchable: false,
                  //   render: (data, type, row) => {
                  //     if (data) {
                  //       return `
                  //         <button class="btn-view px-3 py-1 ml-2 mr-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                  //         <button class="btn-edit px-3 py-1 mx-0 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>
                  //         <button class="btn-delete px-3 py-1 ml-0 mr-2 text-red-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="delete"><i class="fa-regular fa-rectangle-xmark fa-lg"></i></button>`;
                  //     } else {
                  //       return `
                  //         <button class="btn-view px-3 py-1 ml-2 mr-0" data-id="${row.id}"><i class="fa-solid fa-lg fa-expand"></i></button>
                  //         <button class="btn-edit px-3 py-1 mx-0 text-blue-600" data-id="${row.id}"><i class="fa-solid fa-lg fa-pen-to-square"></i></button>
                  //         <button class="btn-delete px-3 py-1 ml-0 mr-2 text-green-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="active"><i class="fa-regular fa-square-check fa-lg"></i></button>`;
                  //     }
                  //   }
                  // }
                  {
                    title: "Acciones",
                    data: 'activo',
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                      const viewBtn = `
                        <button class="btn-view px-2 py-1 text-gray-700" data-id="${row.id}">
                          <i class="fa-solid fa-lg fa-expand"></i>
                        </button>`;
                      const editBtn = `
                        <button class="btn-edit px-2 py-1 text-blue-600" data-id="${row.id}">
                          <i class="fa-solid fa-lg fa-pen-to-square"></i>
                        </button>`;
                      const toggleBtn = data
                        ? `<button class="btn-delete px-2 py-1 text-red-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="delete">
                            <i class="fa-regular fa-rectangle-xmark fa-lg"></i>
                          </button>`
                        : `<button class="btn-delete px-2 py-1 text-green-600" data-id="${row.id}" data-nombre="${row.nombre}" data-action="active">
                            <i class="fa-regular fa-square-check fa-lg"></i>
                          </button>`;

                      // 🔹 Contenedor flex y nowrap para mantener todo alineado horizontalmente
                      return `
                        <div style="display: flex; justify-content: center; align-items: center; gap: 0.25rem; white-space: nowrap;">
                          ${viewBtn}
                          ${editBtn}
                          ${toggleBtn}
                        </div>`;
                    }
                  }

                ]}
                options={{
                  dom:
                    "<'row'<'col-sm-12 text-center'B>>" +
                    "<'row'<'col-sm-6 text-end'l><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5 text-start'i><'col-sm-7 text-end'p>>",
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
                    } catch (err) {
                      console.error(err);
                    }
                  },
                  paging: true,
                  searching: true,
                  ordering: true,
                  info: true,
                  responsive: true,
                  pageLength: 10,
                  lengthMenu: [5, 10, 25, 50, 100],
                  buttons: [
                    { extend: "copyHtml5", text: "Copiar", title: "Lista de productos" },
                    { extend: "excelHtml5", text: "Excel", title: "Lista de productos", filename: "Lista_productos" },
                    { extend: "csvHtml5", text: "CSV", title: "Lista de productos", filename: "Lista_productos" },
                    { extend: "pdfHtml5", text: "PDF", title: "Lista de productos", filename: "Lista_productos" },
                    { extend: "print", text: "Imprimir", title: "Lista de productos" }
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

              {/* Modal de confirmación */}
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={
                  `¿Estás seguro de que deseas ${
                    productIdToAction && productIdToAction.action === 'delete'
                      ? 'desactivar'
                      : 'activar'
                  } al producto ${
                    productIdToAction ? productIdToAction.nombre : ''
                  }?`
                }
              />

              {/* Modal de vista de producto */}
              <ModalProducts
                isOpen={modalOpenProducts}
                onClose={handleCloseModalProducts}
                product={productIdToAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListProducts;
