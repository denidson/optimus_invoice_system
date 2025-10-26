import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ModalPreInvoiceItems from "./ModalPreInvoiceItems";

const ModalImportPreviewPreInvoice = ({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  validationRules = {},
}) => {
  const [tableData, setTableData] = useState([]);
  const [selectedPrefIndex, setSelectedPrefIndex] = useState(null);

  // =====================================================
  // DETECTAR Y PROCESAR LOS DATOS
  // =====================================================
  useEffect(() => {
    if (!isOpen || !data.length) return;

    console.log("📦 Datos originales del Excel:", data);

    let processedData = [];

    if (data[0]?.prefactura && Array.isArray(data[0]?.items)) {
      // Formato con { prefactura, items }
      processedData = data.map((d) => {
        const p = d.prefactura || {};
        return {
          correlativo_interno: p.correlativo_interno || "",
          cliente_final_nombre: p.cliente_final_nombre || "",
          cliente_final_rif: p.cliente_final_rif || "",
          fecha_factura: p.fecha_factura || "",
          tipo_documento: p.tipo_documento || "FC",
          serial: p.serial || "",
          zona: p.zona || "",
          items: d.items || [],
        };
      });
    } else {
      // Formato plano (una fila por item)
      const grouped = Object.values(
        data.reduce((acc, row) => {
          const key = row.correlativo_interno;

          if (!acc[key]) {
            acc[key] = {
              correlativo_interno: row.correlativo_interno || "",
              cliente_final_nombre: row.cliente_final_nombre || "",
              cliente_final_rif: row.cliente_final_rif || "",
              fecha_factura: row.fecha_factura || "",
              tipo_documento: row.tipo_documento || "FC",
              serial: row.serial || "",
              direccion: row.direccion || "",
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

      processedData = grouped;
    }

    console.log("✅ Prefacturas procesadas:", processedData);
    setTableData(processedData);
    setSelectedPrefIndex(null);
  }, [isOpen, data]);

  if (!isOpen) return null;

  // =====================================================
  // FUNCIONES DE EDICIÓN
  // =====================================================
  const handleDeletePreInvoice = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
    toast.info("Prefactura eliminada");
  };

  const handlePrefacturaChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  const handleItemChangeFromModal = (items) => {
    if (selectedPrefIndex === null) return;
    const updated = [...tableData];
    updated[selectedPrefIndex].items = items;
    setTableData(updated);
  };

  const validateData = () => {
    let valid = true;
    tableData.forEach((pref, i) => {
      for (const field in validationRules) {
        const rule = validationRules[field];
        const value = field === "items" ? pref.items : pref[field];
        const { valid: fieldValid, message } = rule(value);
        if (!fieldValid) {
          toast.error(`Prefactura ${i + 1}: ${message}`);
          valid = false;
          break;
        }
      }
    });
    return valid;
  };

  const handleConfirm = () => {
    if (!validateData()) return;
    onConfirm(tableData);
    toast.success("Prefacturas listas para importar");
    onClose();
  };

  // =====================================================
  // RENDER DE LA TABLA
  // =====================================================
  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Previsualización de Prefacturas</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">
              ×
            </button>
          </div>

          {/* Tabla Prefacturas */}
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] px-6 py-4">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-2 py-1">Correlativo</th>
                  <th className="border px-2 py-1">Cliente</th>
                  <th className="border px-2 py-1">RIF</th>
                  <th className="border px-2 py-1">Fecha</th>
                  <th className="border px-2 py-1">Tipo Doc.</th>
                  <th className="border px-2 py-1">Serial</th>
                  <th className="border px-2 py-1">Dirección</th>
                  <th className="border px-2 py-1 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((pref, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">
                      <input
                        value={pref.correlativo_interno}
                        onChange={(e) => handlePrefacturaChange(idx, "correlativo_interno", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_nombre}
                        onChange={(e) => handlePrefacturaChange(idx, "cliente_final_nombre", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_rif}
                        onChange={(e) => handlePrefacturaChange(idx, "cliente_final_rif", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="date"
                        value={pref.fecha_factura || ""}
                        onChange={(e) => handlePrefacturaChange(idx, "fecha_factura", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        value={pref.tipo_documento || "FC"}
                        onChange={(e) => handlePrefacturaChange(idx, "tipo_documento", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      >
                        <option value="FC">FACTURA</option>
                        <option value="NC">NOTA DE CRÉDITO</option>
                        <option value="ND">NOTA DE DÉBITO</option>
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={pref.serial}
                        onChange={(e) => handlePrefacturaChange(idx, "serial", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={pref.direccion}
                        onChange={(e) => handlePrefacturaChange(idx, "direccion", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center space-x-2">
                      <button
                        onClick={() => setSelectedPrefIndex(idx)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver/Editar Items"
                      >
                        <i className="fa-solid fa-list fa-lg"></i>
                      </button>
                      <button
                        onClick={() => handleDeletePreInvoice(idx)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar Prefactura"
                      >
                        <i className="fa-regular fa-rectangle-xmark fa-lg"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Guardar Importación
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Items */}
      {selectedPrefIndex !== null && tableData[selectedPrefIndex] && (
        <ModalPreInvoiceItems
          isOpen={true}
          onClose={() => setSelectedPrefIndex(null)}
          preInvoice={tableData[selectedPrefIndex]}
          onSave={handleItemChangeFromModal}
          validationRules={validationRules}
        />
      )}
    </>
  );
};

export default ModalImportPreviewPreInvoice;
