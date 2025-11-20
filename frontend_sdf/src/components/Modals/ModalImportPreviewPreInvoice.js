import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ModalPreInvoiceItems from "./ModalPreInvoiceItems";
import { searchEndClient } from "../../services/api_end_clients";

const ModalImportPreviewPreInvoice = ({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  validationRules = {},
}) => {
  const [tableData, setTableData] = useState([]);
  const [selectedPrefIndex, setSelectedPrefIndex] = useState(null);

  const authData = localStorage.getItem("authData");
  const authClientId = authData ? JSON.parse(authData)?.cliente_id : null;

  // =====================================================
  // Procesar entradas del Excel
  // =====================================================
  useEffect(() => {
    if (!isOpen || !data.length) return;

    const process = async () => {
      const processedData = [];

      for (const d of data) {
        const p = d.prefactura || {};

        // Datos base desde Excel
        let pref = {
          id: p.id || null,
          correlativo_interno: p.correlativo_interno || "",
          cliente_final_id: p.cliente_final_id || null,
          cliente_final_nombre: p.cliente_final_nombre || "",
          cliente_final_rif: p.cliente_final_rif || "",
          cliente_final_telefono: p.cliente_final_telefono || "",
          cliente_final_email: p.cliente_final_email || "",
          cliente_final_direccion: p.cliente_final_direccion || "",
          cliente_id: authClientId,
          zona: p.zona || p.direccion || "",
          aplica_igtf:
            p.aplica_igtf === "Si" ||
            p.aplica_igtf === "SI" ||
            p.aplica_igtf === true,
          fecha_factura: p.fecha_factura || "",
          tipo_documento: p.tipo_documento || "FC",
          serial: p.serial || "",
          monto_pagado_divisas: Number(p.monto_pagado_divisas) || 0,
          igtf_porcentaje: Number(p.igtf_porcentaje) || 0,
          igtf_monto: Number(p.igtf_monto) || 0,
          items: d.items || [],
        };

        // Buscar cliente por RIF — solo si existe un RIF en los datos
        if (pref.cliente_final_rif) {
          const apiClient = await findClientByRif(pref.cliente_final_rif);

          if (apiClient) {
            pref = {
              ...pref,
              cliente_final_id: apiClient.id,
              // Solo completar los campos que el Excel NO trae
              cliente_final_nombre:
                pref.cliente_final_nombre || apiClient.nombre,
              cliente_final_telefono:
                pref.cliente_final_telefono || apiClient.telefono,
              cliente_final_email:
                pref.cliente_final_email || apiClient.email,
              cliente_final_direccion:
                pref.cliente_final_direccion || apiClient.direccion,
              zona: pref.zona || apiClient.zona,
            };
          }
        }

        processedData.push(pref);
      }

      setTableData(processedData);
      setSelectedPrefIndex(null);
    };

    process();
  }, [isOpen, data, authClientId]);


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
  
  // =====================================================
  // Buscar cliente por RIF
  // =====================================================
  const findClientByRif = async (rif) => {
    if (!rif) return null;
    try {
      const cleanRif = rif.toUpperCase();
      const res = await searchEndClient(cleanRif);
      return res || null;
    } catch (e) {
      console.error("Error buscando cliente:", e);
      return null;
    }
  };

  // =====================================================
  // Manejo seguro de inputs numéricos + cálculo IGTF
  // =====================================================
  const handlePrefacturaNumericChange = (index, field, rawValue) => {
    const value = parseFloat(rawValue) || 0;

    // Evita error si el índice no existe
    setTableData((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;

      updated[index][field] = value;

      // Recalcular IGTF si aplica
      if (updated[index].aplica_igtf) {
        const monto = parseFloat(updated[index].monto_pagado_divisas) || 0;
        const porcentaje = parseFloat(updated[index].igtf_porcentaje) || 0;
        updated[index].igtf_monto = parseFloat(((monto * porcentaje) / 100).toFixed(2));
      }

      return updated;
    });
  };


  // =====================================================
  // Función para fusionar datos Excel vs API (OPCIÓN B)
  // =====================================================
  const mergeClientData = (prefData, apiData) => {
    if (!apiData) return prefData;

    return {
      ...prefData,
      cliente_final_id: apiData.id,

      cliente_final_nombre: prefData.cliente_final_nombre || apiData.nombre,
      cliente_final_telefono: prefData.cliente_final_telefono || apiData.telefono,
      cliente_final_email: prefData.cliente_final_email || apiData.email,
      cliente_final_direccion: prefData.cliente_final_direccion || apiData.direccion,
      zona: prefData.zona || apiData.zona,
    };
  };

  // =====================================================
  // Confirmar importación
  // =====================================================
  const handleConfirm = async () => {
    if (!validateData()) return;

    const updated = [...tableData];

    for (let i = 0; i < updated.length; i++) {
      const pref = updated[i];

      // Buscar cliente por RIF
      const apiClient = await findClientByRif(pref.cliente_final_rif);

      if (apiClient) {
        updated[i] = mergeClientData(pref, apiClient);
      } else {
        updated[i].cliente_final_id = null;
      }

      updated[i].cliente_id = authClientId;

      // IGTF
      if (!updated[i].aplica_igtf) {
        updated[i].monto_pagado_divisas = 0;
        updated[i].igtf_porcentaje = 0;
        updated[i].igtf_monto = 0;
      } else {
        updated[i].igtf_monto = parseFloat(
          ((updated[i].monto_pagado_divisas * updated[i].igtf_porcentaje) / 100).toFixed(2)
        );
      }
    }

    console.log("Final pre-invoices to import:", updated);

    onConfirm(updated);
    toast.success("Prefacturas listas para importar");
    onClose();
  };

  // =====================================================
  // Validación
  // =====================================================
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

  // =====================================================
  // Render
  // =====================================================
  return (
    <>
      {/* === Modal Principal === */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-h-[90vh] overflow-auto">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Previsualización de Prefacturas</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] px-6 py-4">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-2 py-1">Correlativo</th>
                  <th className="border px-2 py-1">Cliente</th>
                  <th className="border px-2 py-1">RIF</th>
                  <th className="border px-2 py-1">Telefono</th>
                  <th className="border px-2 py-1">Correo electronico</th>
                  <th className="border px-2 py-1">Fecha</th>
                  <th className="border px-2 py-1">Tipo Doc.</th>
                  <th className="border px-2 py-1">Serial</th>
                  <th className="border px-2 py-1">Dirección</th>
                  <th className="border px-2 py-1">Zona</th>
                  <th className="border px-2 py-1">IGTF</th>
                  <th className="border px-2 py-1">Monto Divisas</th>
                  <th className="border px-2 py-1">IGTF %</th>
                  <th className="border px-2 py-1">Monto IGTF</th>
                  <th className="border px-2 py-1 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((pref, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">

                    {/* --- Correlativo */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.correlativo_interno}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "correlativo_interno", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- Cliente */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_nombre}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_nombre", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- RIF */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_rif}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_rif", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    {/* --- Telefono */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_telefono}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_telefono", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    {/* --- Correo electronico */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_email}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_email", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>
                    {/* --- Fecha */}
                    <td className="border px-2 py-1">
                      <input
                        type="date"
                        value={pref.fecha_factura || ""}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "fecha_factura", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- Tipo Doc */}
                    <td className="border px-2 py-1">
                      <select
                        value={pref.tipo_documento}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "tipo_documento", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      >
                        <option value="FC">Factura</option>
                        <option value="NC">Nota de crédito</option>
                        <option value="ND">Nota de débito</option>
                      </select>
                    </td>

                    {/* --- Serial */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.serial}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "serial", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- Dirección */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_direccion}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_direccion", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- Zona */}
                    <td className="border px-2 py-1">
                      <input
                        value={pref.zona}
                        onChange={(e) => handlePrefacturaChange(idx, "zona", e.target.value)}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- IGTF */}
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={pref.aplica_igtf}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "aplica_igtf", e.target.checked)
                        }
                      />
                    </td>

                    {/* --- Monto pagado en divisas */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.monto_pagado_divisas}
                        onChange={(e) =>
                          handlePrefacturaNumericChange(
                            idx,
                            "monto_pagado_divisas",
                            e.target.value
                          )
                        }
                        disabled={!pref.aplica_igtf}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- IGTF % */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.igtf_porcentaje}
                        onChange={(e) =>
                          handlePrefacturaNumericChange(
                            idx,
                            "igtf_porcentaje",
                            e.target.value
                          )
                        }
                        disabled={!pref.aplica_igtf}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    {/* --- IGTF monto */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.igtf_monto}
                        readOnly
                        className="w-full border rounded px-1 py-0.5 bg-gray-100"
                      />
                    </td>

                    {/* --- Acciones */}
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => setSelectedPrefIndex(idx)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="fa-solid fa-list fa-lg"></i>
                      </button>

                      <button
                        onClick={() => handleDeletePreInvoice(idx)}
                        className="text-red-500 hover:text-red-700 ml-2"
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
          <div className="flex justify-end space-x-3 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar Importación
            </button>
          </div>
        </div>
      </div>

      {/* Modal Items */}
      {selectedPrefIndex !== null && tableData[selectedPrefIndex] && (
        <ModalPreInvoiceItems
          isOpen={true}
          onClose={() => setSelectedPrefIndex(null)}
          preInvoice={tableData[selectedPrefIndex]}
          onSave={(items) => handleItemChangeFromModal(items)}
          validationRules={validationRules}
        />
      )}
    </>
  );
};

export default ModalImportPreviewPreInvoice;