import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ModalImportPreview = ({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  rol,
  cliente_id,
  apiSelects = {},
  validationRules = {}
}) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectOptions, setSelectOptions] = useState({});
  const rowsPerPage = 10;

  // Inicializar datos base del Excel
  useEffect(() => {
    if (isOpen && data.length) {
      const initializedData = data.map((row) => {
        const processedRow = { ...row };

        processedRow.cliente_id =
          rol === "operador" ? parseInt(cliente_id, 10) : row.cliente_id || "";

        processedRow.iva_categoria =
          row.iva_categoria !== undefined && row.iva_categoria !== null
            ? String(row.iva_categoria).replace("%", "").trim()
            : "";

        return processedRow;
      });

      setTableData(initializedData);
      setCurrentPage(1);
    }
  }, [isOpen, data, rol, cliente_id]);

  // Cargar selects dinámicos y emparejar IDs
  useEffect(() => {
    const fetchSelects = async () => {
      const results = {};
      for (const key in apiSelects) {
        try {
          results[key] = await apiSelects[key]();
        } catch (err) {
          console.error(`Error cargando select ${key}`, err);
          results[key] = [];
        }
      }
      setSelectOptions(results);

      // Asignar IVA por coincidencia
      if (results.iva_categoria) {
        setTableData((prev) =>
          prev.map((row) => {
            if (row.iva_categoria) {
              const excelIva = Number(String(row.iva_categoria).replace("%", "").trim());
              const match = results.iva_categoria.find(
                (opt) =>
                  Number(opt.tasa_porcentaje) === excelIva ||
                  opt.nombre?.includes(`${excelIva}`)
              );
              if (match) {
                return {
                  ...row,
                  iva_categoria_id: match.id,
                  iva_categoria: match.nombre
                };
              }
            }
            return row;
          })
        );
      }

      // Emparejar cliente si es admin
      if (rol === "admin" && results.cliente_id?.length) {
        setTableData((prev) =>
          prev.map((row) => {
            if (row.cliente_id && isNaN(row.cliente_id)) {
              const match = results.cliente_id.find(
                (c) =>
                  c.rif?.trim().toLowerCase() === row.cliente_id.trim().toLowerCase() ||
                  c.nombre_empresa?.trim().toLowerCase() === row.cliente_id.trim().toLowerCase()
              );
              if (match) {
                return {
                  ...row,
                  cliente_id: match.id,
                  cliente_nombre: match.nombre_empresa || match.nombre
                };
              }
            }
            return row;
          })
        );
      }

      // Operador: asignar cliente fijo
      if (rol === "operador" && results.cliente_id?.length) {
        setTableData((prev) =>
          prev.map((row) => ({
            ...row,
            cliente_id: results.cliente_id[0].id,
            cliente_nombre: results.cliente_id[0].nombre_empresa || results.cliente_id[0].nombre
          }))
        );
      }
    };

    if (isOpen) fetchSelects();
  }, [isOpen, apiSelects, rol, cliente_id]);

  if (!isOpen) return null;

  // Filtrar headers visibles
  const headers = Object.keys(tableData[0] || {}).filter(
    (h) => !["iva_categoria_id", "cliente_id"].includes(h)
  );

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;

    if (field === "iva_categoria" && selectOptions.iva_categoria) {
      const opt = selectOptions.iva_categoria.find((o) => o.nombre === value);
      if (opt) updated[index].iva_categoria_id = opt.id;
    }

    if (field === "cliente_nombre" && selectOptions.cliente_id) {
      const opt = selectOptions.cliente_id.find((o) => (o.nombre_empresa || o.nombre) === value);
      if (opt) updated[index].cliente_id = opt.id;
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
        const rule = validationRules[field];
        const { valid: fieldValid, message } = rule(row[field], row);
        if (!fieldValid) {
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

    const cleanedData = tableData.map((r) => ({
      ...r,
      iva_categoria_id: r.iva_categoria_id,
      cliente_id: r.cliente_id
    }));

    onConfirm(cleanedData);
    toast.success("Datos listos para importar");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Previsualización de Importación</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] px-4 py-3">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="border px-3 py-2 text-left text-gray-600 font-semibold">
                    {header}
                  </th>
                ))}
                <th className="border px-3 py-2 text-center text-gray-600 font-semibold w-16">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, rowIndex) => {
                const actualIndex = startIndex + rowIndex;
                return (
                  <tr key={actualIndex} className="hover:bg-gray-50">
                    {headers.map((field) => (
                      <td key={field} className="border px-2 py-1">
                        {field === "iva_categoria" ? (
                          <select
                            className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
                            value={row[field]}
                            onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                            disabled={rol === "operador" && !selectOptions.iva_categoria}
                          >
                            {selectOptions.iva_categoria?.map((opt) => (
                              <option key={opt.id} value={opt.nombre}>
                                {opt.nombre} ({opt.tasa_porcentaje}%)
                              </option>
                            ))}
                          </select>
                        ) : field === "cliente_nombre" ? (
                          rol === "admin" ? (
                            <select
                              className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
                              value={row[field]}
                              onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                            >
                              {selectOptions.cliente_id?.map((c) => (
                                <option key={c.id} value={c.nombre_empresa || c.nombre}>
                                  {c.nombre_empresa || c.nombre} {c.rif ? `(${c.rif})` : ""}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>{row[field]}</div>
                          )
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
                            value={row[field] ?? ""}
                            onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                          />
                        )}
                      </td>
                    ))}
                    <td className="border text-center">
                      <button
                        onClick={() => handleDeleteRow(actualIndex)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar fila"
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

        {/* Paginación */}
        <div className="flex justify-between items-center px-6 py-3 border-t bg-gray-50 text-sm">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">«</button>
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">‹</button>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">»</button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-white">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">Cancelar</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Guardar Importación</button>
        </div>
      </div>
    </div>
  );
};

export default ModalImportPreview;
