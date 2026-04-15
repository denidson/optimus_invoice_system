import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // =========================
  // AUTH (OPTIMIZADO)
  // =========================
  const authClientId = useMemo(() => {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData)?.cliente_id : null;
  }, []);

  // =========================
  // IGTF CALC
  // =========================
  const calcIGTF = (monto, porcentaje) =>
    parseFloat(((monto * porcentaje) / 100).toFixed(2));

  // =========================
  // CLIENTE SEARCH
  // =========================
  const findClientByRif = useCallback(async (rif) => {
    if (!rif) return null;
    try {
      const res = await searchEndClient(rif.toUpperCase());
      return res || null;
    } catch (e) {
      console.error("Error buscando cliente:", e);
      return null;
    }
  }, []);

  // =========================
  // PROCESAR EXCEL
  // =========================
  useEffect(() => {
    if (!isOpen || !data.length) return;

    const process = async () => {
      const processedData = await Promise.all(
        data.map(async (d) => {
          const p = d.prefactura || {};

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

          if (pref.cliente_final_rif) {
            const apiClient = await findClientByRif(pref.cliente_final_rif);

            if (apiClient) {
              pref = {
                ...pref,
                cliente_final_id: apiClient.id,
                cliente_final_nombre: pref.cliente_final_nombre || apiClient.nombre,
                cliente_final_telefono: pref.cliente_final_telefono || apiClient.telefono,
                cliente_final_email: pref.cliente_final_email || apiClient.email,
                cliente_final_direccion: pref.cliente_final_direccion || apiClient.direccion,
                zona: pref.zona || apiClient.zona,
              };
            }
          }

          return pref;
        })
      );

      setTableData(processedData);
      setSelectedPrefIndex(null);
    };

    process();
  }, [isOpen, data, authClientId, findClientByRif]);

  if (!isOpen) return null;

  // =========================
  // VALIDACIÓN (FIX CRÍTICO)
  // =========================
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

  // =========================
  // DELETE
  // =========================
  const handleDeletePreInvoice = (index) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
    toast.info("Prefactura/factura eliminada");
  };

  // =========================
  // UPDATE FIELD
  // =========================
  const handlePrefacturaChange = (index, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleItemChangeFromModal = (items) => {
    if (selectedPrefIndex === null) return;

    setTableData((prev) => {
      const updated = [...prev];
      updated[selectedPrefIndex].items = items;
      return updated;
    });
  };

  // =========================
  // NUMERIC IGTF SAFE
  // =========================
  const handlePrefacturaNumericChange = (index, field, rawValue) => {
    const value = parseFloat(rawValue) || 0;

    setTableData((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;

      updated[index][field] = value;

      if (updated[index].aplica_igtf) {
        updated[index].igtf_monto = calcIGTF(
          updated[index].monto_pagado_divisas,
          updated[index].igtf_porcentaje
        );
      }

      return updated;
    });
  };

  // =========================
  // CONFIRM
  // =========================
  const handleConfirm = async () => {
    if (!validateData()) return;

    const updated = await Promise.all(
      tableData.map(async (pref) => {
        const apiClient = await findClientByRif(pref.cliente_final_rif);

        const merged = apiClient
          ? {
              ...pref,
              cliente_final_id: apiClient.id,
              cliente_final_nombre: pref.cliente_final_nombre || apiClient.nombre,
              cliente_final_telefono: pref.cliente_final_telefono || apiClient.telefono,
              cliente_final_email: pref.cliente_final_email || apiClient.email,
              cliente_final_direccion: pref.cliente_final_direccion || apiClient.direccion,
              zona: pref.zona || apiClient.zona,
            }
          : { ...pref, cliente_final_id: null };

        merged.cliente_id = authClientId;

        if (!merged.aplica_igtf) {
          merged.monto_pagado_divisas = 0;
          merged.igtf_porcentaje = 0;
          merged.igtf_monto = 0;
        } else {
          merged.igtf_monto = calcIGTF(
            merged.monto_pagado_divisas,
            merged.igtf_porcentaje
          );
        }

        return merged;
      })
    );

    onConfirm(updated);
    toast.success("Prefacturas/Facturas listas para importar");
    onClose();
  };

  // =========================
  // RENDER (SIN CAMBIOS VISUALES)
  // =========================
  return (
    <>
      {/* === Modal Principal === */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-h-[90vh] overflow-auto">

          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">
              Previsualización de Prefacturas
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">
              ×
            </button>
          </div>

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
                    <td className="border px-2 py-1">
                      <input
                        value={pref.correlativo_interno}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "correlativo_interno", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_nombre}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_nombre", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_rif}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_rif", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_telefono}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_telefono", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_email}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_email", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

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

                    <td className="border px-2 py-1">
                      <select
                        value={pref.tipo_documento}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "tipo_documento", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      >
                        <option value="FC">Factura</option>
                        <option value="NC">Nota crédito</option>
                        <option value="ND">Nota débito</option>
                      </select>
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.serial}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "serial", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.cliente_final_direccion}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "cliente_final_direccion", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        value={pref.zona}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "zona", e.target.value)
                        }
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={pref.aplica_igtf}
                        onChange={(e) =>
                          handlePrefacturaChange(idx, "aplica_igtf", e.target.checked)
                        }
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.monto_pagado_divisas}
                        onChange={(e) =>
                          handlePrefacturaNumericChange(idx, "monto_pagado_divisas", e.target.value)
                        }
                        disabled={!pref.aplica_igtf}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.igtf_porcentaje}
                        onChange={(e) =>
                          handlePrefacturaNumericChange(idx, "igtf_porcentaje", e.target.value)
                        }
                        disabled={!pref.aplica_igtf}
                        className="w-full border rounded px-1 py-0.5"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={pref.igtf_monto}
                        readOnly
                        className="w-full border rounded px-1 py-0.5 bg-gray-100"
                      />
                    </td>

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

          <div className="flex justify-end space-x-3 px-6 py-4 border-t">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
              Cancelar
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Guardar Importación
            </button>
          </div>
        </div>
      </div>

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