import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ModalImportPreviewClients = ({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  rol,
  apiSelects = {},
  validationRules = {},
}) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectOptions, setSelectOptions] = useState({});
  const rowsPerPage = 10;

  // 🔹 Cargar selects (tipo_contribuyente)
  useEffect(() => {
    const fetchSelects = async () => {
      const results = {};
      for (const key in apiSelects) {
        try {
          results[key] = await apiSelects[key]();
        } catch {
          results[key] = [];
        }
      }
      setSelectOptions(results);
    };
    if (isOpen) fetchSelects();
  }, [isOpen, apiSelects]);

  // 🔹 Inicializar datos importados y asignar tipo_contribuyente automáticamente
  useEffect(() => {
    if (!isOpen || !data.length) return;

    // Esperar a que se carguen los tipos desde la API
    if (!selectOptions.tipo_contribuyente_id?.length) {
      setTableData(data);
      return;
    }

    const tipos = selectOptions.tipo_contribuyente_id; // [{ id, nombre }]

    const initializedData = data.map((row) => {
      const tipoTexto = (
        row.tipo_contribuyente_id ||
        row.tipo_contribuyente ||
        ""
      )
        .toString()
        .toLowerCase()
        .trim();

      // Buscar coincidencia exacta por texto ("ordinario" / "especial")
      let tipoMatch = tipos.find(
        (t) => t.nombre.toLowerCase() === tipoTexto
      );

      // Si no hay coincidencia, usar “Ordinario” por defecto
      if (!tipoMatch) {
        tipoMatch = tipos.find(
          (t) => t.nombre.toLowerCase() === "ordinario"
        );
      }

      return {
        ...row,
        tipo_contribuyente_id: tipoMatch ? tipoMatch.id : "",
        region: row.region || "#",
        estado: row.estado || "#",
        zona: row.zona || "",
        direccion: row.direccion || "",
        telefono: row.telefono || "",
        email: row.email || "",
      };
    });

    setTableData(initializedData);
    setCurrentPage(1);
  }, [isOpen, data, selectOptions.tipo_contribuyente_id]);

  if (!isOpen || rol !== "admin") return null;

  // 🔹 Columnas visibles
  const headers = [
    "rif",
    "nombre_empresa",
    "telefono",
    "email",
    "tipo_contribuyente_id",
    "region",
    "estado",
    "zona",
    "direccion",
  ];

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

  // 🔹 Manejo de cambios
  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;

    if (field === "region") {
      updated[index].estado = "#";
    }

    setTableData(updated);
  };

  // 🔹 Eliminar fila
  const handleDeleteRow = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
    toast.info("Fila eliminada");
  };

  // 🔹 Validación
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

  // 🔹 Confirmar importación
  const handleConfirm = () => {
    if (!validateData()) return;
    onConfirm(tableData);
    toast.success("Datos listos para importar");
    onClose();
  };

  // 🔹 Regiones y estados
  const regiones = [
    { id: 1, nombre: "Central" },
    { id: 2, nombre: "Capital" },
    { id: 3, nombre: "Occidental" },
    { id: 4, nombre: "Guayana" },
    { id: 5, nombre: "Insular" },
    { id: 6, nombre: "Los Andes" },
    { id: 7, nombre: "Los Llanos" },
    { id: 8, nombre: "Oriental" },
    { id: 9, nombre: "Zuliana" },
  ];

  const estadosPorRegion = {
    Central: ["Aragua", "Carabobo", "Cojedes"],
    Capital: ["Distrito Capital", "Miranda", "La Guaira"],
    Occidental: ["Falcón", "Lara", "Portuguesa", "Yaracuy"],
    Guayana: ["Amazonas", "Bolívar", "Delta Amacuro", "Guayana Esequiba"],
    Insular: ["Dependencias Federales", "Nueva Esparta"],
    "Los Andes": ["Barinas", "Mérida", "Táchira", "Trujillo", "Apure - Municipio Páez"],
    "Los Llanos": ["Apure - Sin el Municipio Páez", "Guárico"],
    Oriental: ["Anzoátegui", "Monagas", "Sucre"],
    Zuliana: ["Zulia"],
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Previsualización de Importación de Clientes</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] px-6 py-4">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="border px-3 py-2 text-left text-gray-600 font-semibold">
                    {h}
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
                        {field === "tipo_contribuyente_id" ? (
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                            value={row[field] || ""}
                            onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                          >
                            <option value="">Seleccione...</option>
                            {selectOptions.tipo_contribuyente_id?.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
                            ))}
                          </select>
                        ) : field === "region" ? (
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                            value={row.region}
                            onChange={(e) => handleInputChange(actualIndex, "region", e.target.value)}
                          >
                            <option value="#">Seleccione...</option>
                            {regiones.map((r) => (
                              <option key={r.id} value={r.nombre}>{r.nombre}</option>
                            ))}
                          </select>
                        ) : field === "estado" ? (
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                            value={row.estado}
                            onChange={(e) => handleInputChange(actualIndex, "estado", e.target.value)}
                          >
                            <option value="#">Seleccione...</option>
                            {(estadosPorRegion[row.region] || []).map((estado) => (
                              <option key={estado} value={estado}>{estado}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400"
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
            <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">«</button>
            <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">‹</button>
            <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">»</button>
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

export default ModalImportPreviewClients;
