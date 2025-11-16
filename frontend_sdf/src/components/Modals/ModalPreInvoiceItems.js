import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { toast } from "react-toastify";
import { getProducts } from "../../services/apiProducts";

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

  // 🔹 Traer productos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getProducts();
        setProducts(
          res.map((p) => ({
            value: p.id,
            label: `${p.sku} - ${p.nombre}`,
            sku: p.sku,
            tasa_iva: p.iva_categoria?.tasa_porcentaje || "0.00",
            precio_base: parseFloat(p.precio_base) || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  // 🔹 Inicializar items
  useEffect(() => {
    if (preInvoice?.items && products.length) {
      const mappedItems = preInvoice.items.map((item) => {
        const selectedProduct = products.find((p) => p.sku === item.producto_sku);
        return {
          ...item,
          productOption: selectedProduct || null,
          iva_categoria: selectedProduct?.tasa_iva || item.iva_categoria_id,
        };
      });
      setItems(mappedItems);
    }
  }, [preInvoice, products]);

  const handleChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;

    if (field === "productOption") {
      newItems[idx].producto_sku = value?.sku || "";
      newItems[idx].precio_unitario = value?.precio_base || 0;
      newItems[idx].iva_categoria = value?.tasa_iva || "0.00";
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        producto_sku: "",
        cantidad: 1,
        precio_unitario: 0,
        descuento_porcentaje: 0,
        iva_categoria: "0.00",
        productOption: null,
      },
    ]);
  };

  const handleDeleteItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
    toast.info("Item eliminado");
  };

  // 🔹 Validación externa
  const validateItems = () => {
    if (!validationRules.items) return true;
    const { valid, message } = validationRules.items(items);
    if (!valid) toast.error(message);
    return valid;
  };

  const handleSave = () => {
    if (!validateItems()) return;
    onSave(items);
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
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">
                  <Select
                    options={products}
                    value={item.productOption}
                    onChange={(option) => handleChange(idx, "productOption", option)}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-400"
                    value={item.cantidad || 1}
                    onChange={(e) => handleChange(idx, "cantidad", Number(e.target.value))}
                  />
                </td>
                <td className="border px-2 py-1 text-right">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-400"
                    value={item.precio_unitario || 0}
                    onChange={(e) => handleChange(idx, "precio_unitario", Number(e.target.value))}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-400"
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
                    value={item.iva_categoria || "0.00"}
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
            ))}
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
