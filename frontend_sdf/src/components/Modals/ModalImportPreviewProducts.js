import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const ModalImportPreviewProducts = ({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  rol,
  cliente_id,
  apiSelects = {},
  validationRules = {},
  clienteAsignado
}) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectOptions, setSelectOptions] = useState({});
  const rowsPerPage = 10;
  const { user } = useContext(AuthContext);
  const cliente = user?.cliente_id;
  const cliente_nombre = user?.cliente_nombre;

  /* =========================
     🔹 CARGA SELECTS
  ========================== */
  useEffect(() => {
    const fetchSelects = async () => {
      const results = {};

      for (const key in apiSelects) {
        try {
          const res = await apiSelects[key]();
          results[key] = Array.isArray(res) ? res : res?.data || [];
        } catch {
          results[key] = [];
        }
      }

      setSelectOptions(results);
    };

    if (isOpen) fetchSelects();
  }, [isOpen, apiSelects]);

  /* =========================
     🔹 INICIALIZAR DATA
  ========================== */
  useEffect(() => {
    if (!isOpen || !data.length) return;

    const isOperador = ["operador", "operador_admin"].includes(rol);
    const isAdmin = rol === "admin";

    const initialized = data.map(row => {
      /* ================= IVA ================= */
      let ivaNum = 0;

      if (row.iva_categoria) {
        const match = String(row.iva_categoria).match(/(\d+(\.\d+)?)/);
        ivaNum = match ? Number(match[1]) : 0;
      }

      const ivaOpt = selectOptions.iva_categoria?.find(
        o => Number(o.tasa_porcentaje) === ivaNum
      );

      const ivaId = ivaOpt?.id || null;

      /* ================= CLIENTE ================= */
      let clienteId = "";
      let clienteNombre = "";

      // 👷 OPERADOR / OPERADOR_ADMIN
      if (isOperador) {
        clienteId = cliente|| "";

        // 1. intentar desde clienteAsignado
        clienteNombre = cliente_nombre || clienteAsignado || "";

        // 2. fallback: buscar en selectOptions (MUY IMPORTANTE)
        if (!clienteNombre && cliente_id && selectOptions.cliente_id?.length) {
          const match = selectOptions.cliente_id.find(c =>
            String(c.id) === String(cliente_id)
          );

          if (match) {
            clienteNombre = match.nombre_empresa || match.nombre;
          }
        }
      }

      // 👑 ADMIN
      if (isAdmin) {
        const valor = String(row.cliente_id || "").toLowerCase().trim();

        if (valor) {
          const match = selectOptions.cliente_id?.find(c => {
            const nombre = String(c.nombre_empresa || "").toLowerCase();
            const rif = String(c.rif || "").toLowerCase();

            return nombre.includes(valor) || rif.includes(valor);
          });

          if (match) {
            clienteId = match.id;
            clienteNombre = match.nombre_empresa || match.nombre;
          }
        }
      }

      return {
        ...row,
        iva_categoria: ivaNum,
        iva_categoria_id: ivaId,
        cliente_id: clienteId,
        cliente_nombre: clienteNombre
      };
    });

    setTableData(initialized);
    setCurrentPage(1);

  }, [isOpen, data, rol, cliente_id, clienteAsignado, selectOptions]);

  if (!isOpen) return null;

  /* =========================
     🔹 HEADERS DINÁMICOS
  ========================== */
  const headers = [
    "sku",
    "nombre",
    "descripcion",
    "precio_base",
    "peso_kg",
    "volumen_m3",
    "iva_categoria",
    "iva_categoria_id",
  ];

  if (["operador", "operador_admin"].includes(rol)) {
    headers.push("cliente_nombre");
  }

  if (rol === "admin") {
    headers.push("cliente_id");
  }

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

  /* =========================
     🔹 HANDLE INPUT
  ========================== */
  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];

    if (field === "iva_categoria") {
      const opt = selectOptions.iva_categoria?.find(
        o => String(o.id) === String(value)
      );

      updated[index].iva_categoria_id = value;
      updated[index].iva_categoria = opt?.tasa_porcentaje || 0;
    }

    else if (field === "cliente_id") {
      const match = selectOptions.cliente_id?.find(
        c => String(c.id) === String(value)
      );

      updated[index].cliente_id = match?.id || value;
      updated[index].cliente_nombre =
        match?.nombre_empresa || match?.nombre || "";
    }

    else {
      updated[index][field] = value;
    }

    setTableData(updated);
  };

  const handleDeleteRow = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
    toast.info("Fila eliminada");
  };

  const validateData = () => {
    let valid = true;

    tableData.forEach((row, i) => {
      for (const field in validationRules) {
        const { valid: ok, message } = validationRules[field](row[field], row);

        if (!ok) {
          toast.error(`Fila ${i + 1}: ${message}`);
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
    toast.success("Datos listos para importar");
    onClose();
  };

  /* =========================
     🔹 UI
  ========================== */
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] xl:w-[85%] max-h-[95vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold">
            Previsualización de Importación
          </h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] px-6 py-4">
          <table className="table-fixed border text-sm w-max min-w-full">

            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {headers.map(h => (
                  <th key={h} className="border px-3 py-2 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="border px-3 py-2 text-center">Acción</th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, i) => {
                const idx = startIndex + i;

                return (
                  <tr key={idx} className="hover:bg-gray-50">

                    {headers.map(field => (
                      <td key={field} className="border px-2 py-1">

                        {field === "iva_categoria" ? (
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={row.iva_categoria_id || ""}
                            onChange={(e) =>
                              handleInputChange(idx, field, e.target.value)
                            }
                          >
                            <option value="">Seleccione</option>
                            {selectOptions.iva_categoria?.map(opt => (
                              <option key={opt.id} value={opt.id}>
                                {opt.nombre} ({opt.tasa_porcentaje}%)
                              </option>
                            ))}
                          </select>

                        ) : field === "cliente_id" && rol === "admin" ? (
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={row.cliente_id || ""}
                            onChange={(e) =>
                              handleInputChange(idx, field, e.target.value)
                            }
                          >
                            <option value="">Seleccione cliente</option>
                            {selectOptions.cliente_id?.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.nombre_empresa} ({c.rif})
                              </option>
                            ))}
                          </select>

                        ) : field === "cliente_nombre" ? (
                          <div className="text-gray-700">
                            {row.cliente_nombre}
                          </div>

                        ) : (
                          <input
                            className="w-full border rounded px-2 py-1"
                            value={row[field] || ""}
                            onChange={(e) =>
                              handleInputChange(idx, field, e.target.value)
                            }
                          />
                        )}
                      </td>
                    ))}

                    <td className="border text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar Importación
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalImportPreviewProducts;