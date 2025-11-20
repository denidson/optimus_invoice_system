import React, { useState, useEffect } from "react"; 
import Modal from "react-modal";
import Select from "react-select";
import { toast } from "react-toastify";
import { getProducts } from "../../services/apiProducts";
import { getTaxCategories } from "../../services/apiConfig";

Modal.setAppElement("#root");

export default function ModalPreInvoiceItems({
  isOpen,
  onClose,
  preInvoice,
  onSave,
  validationRules = {},
}) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxCategories, setTaxCategories] = useState([]);

  // ----------------------------
  // 🔹 Traer productos
  // ----------------------------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getProducts();
        setProducts(
          res.map((p) => ({
            value: p.id,
            label: `${p.sku} - ${p.nombre}`,
            sku: p.sku,
            iva_categoria_id: p.iva_categoria_id,
            precio_base: parseFloat(p.precio_base) || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  // ----------------------------
  // 🔹 Traer categorías de IVA
  // ----------------------------
  useEffect(() => {
    async function fetchTaxCategories() {
      try {
        const res = await getTaxCategories();
        setTaxCategories(res);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTaxCategories();
  }, []);

  // ----------------------------
  // 🔹 Inicializar items al abrir preInvoice
  // ----------------------------
  useEffect(() => {
    if (preInvoice?.items && products.length && taxCategories.length) {
      const mappedItems = preInvoice.items.map((item) => {
        const productMatch = products.find((p) => p.sku === item.producto_sku);

        return {
          ...item,
          producto_id: productMatch?.value || null, // <-- ID real
          productOption: productMatch || null,      // <-- Para mostrar en Select
          iva_categoria_id: productMatch?.iva_categoria_id || null,
          precio_unitario: parseFloat(item.precio_unitario) || productMatch?.precio_base || 0,
        };
      });

      setItems(mappedItems);
    }
  }, [preInvoice, products, taxCategories]);

  // ----------------------------
  // 🔹 Cambios en los items
  // ----------------------------
  const handleChange = (idx, field, value) => {
    const newItems = [...items];

    if (field === "productOption") {
      newItems[idx].productOption = value;
      newItems[idx].producto_sku = value?.sku || "";
      newItems[idx].producto_id = value?.value || null;
      newItems[idx].precio_unitario = value?.precio_base || 0;
      newItems[idx].iva_categoria_id = value?.iva_categoria_id || null;
    } else {
      newItems[idx][field] = value;
    }

    setItems(newItems);
  };

  // ----------------------------
  // 🔹 Agregar item
  // ----------------------------
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        producto_sku: "",
        producto_id: null,
        cantidad: 1,
        precio_unitario: 0,
        descuento_porcentaje: 0,
        iva_categoria_id: null,
        productOption: null,
      },
    ]);
  };

  // ----------------------------
  // 🔹 Eliminar item
  // ----------------------------
  const handleDeleteItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
    toast.info("Item eliminado");
  };

  // ----------------------------
  // 🔹 Validación antes de guardar
  // ----------------------------
  const validateItems = () => {
    if (!validationRules.items) return true;
    const { valid, message } = validationRules.items(items);
    if (!valid) toast.error(message);
    return valid;
  };

  // ----------------------------
  // 🔹 Guardar
  // ----------------------------
  const handleSave = () => {
    if (!validateItems()) return;

    // Asegurarse de enviar solo los campos necesarios al backend
    const cleanedItems = items.map((item) => ({
      id: item.id || null,
      producto_id: item.producto_id,
      nombre: item.productOption?.label || item.nombre || "",
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      aplica_iva: true, // o según tu lógica
      iva_categoria_id: item.iva_categoria_id,
      activo: true,
      descuento_porcentaje: item.descuento_porcentaje || 0,
    }));

    onSave(cleanedItems);
    onClose();
  };

  return isOpen ? (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Detalle de Items"
      className="bg-white p-6 rounded-2xl max-w-6xl mx-auto mt-10 shadow-2xl overflow-visible"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto"
    >
      <h2 className="text-xl font-bold mb-4">
        Items de Pre-Factura {preInvoice?.correlativo_interno}
      </h2>

      <div className="overflow-x-auto max-h-[75vh]">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border px-2 py-1 text-left">Producto</th>
              <th className="border px-2 py-1 text-center">Cantidad</th>
              <th className="border px-2 py-1 text-right">Precio Unitario</th>
              <th className="border px-2 py-1 text-center">Descuento %</th>
              <th className="border px-2 py-1 text-center">IVA</th>
              <th className="border px-2 py-1 text-center w-16">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const ivaLabel =
                taxCategories.find((t) => t.id === item.iva_categoria_id)
                  ?.tasa_porcentaje || "0.00";

              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">
                    <Select
                      options={products}
                      value={item.productOption}
                      onChange={(option) =>
                        handleChange(idx, "productOption", option)
                      }
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-center"
                      value={item.cantidad || 1}
                      onChange={(e) =>
                        handleChange(idx, "cantidad", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="border px-2 py-1 text-right">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-right"
                      value={item.precio_unitario || 0}
                      onChange={(e) =>
                        handleChange(idx, "precio_unitario", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-center"
                      value={item.descuento_porcentaje || 0}
                      onChange={(e) =>
                        handleChange(idx, "descuento_porcentaje", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-center bg-gray-100 cursor-not-allowed"
                      value={ivaLabel}
                      readOnly
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fa-regular fa-rectangle-xmark fa-lg"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleAddItem}
        >
          Agregar Item
        </button>

        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          Guardar
        </button>
      </div>
    </Modal>
  ) : null;
}
