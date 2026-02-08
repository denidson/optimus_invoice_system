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

  /* =========================
     🔹 CONFIG VISUAL
  ========================== */
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

  const columnWidths = {
    rif: 140,
    nombre_empresa: 280,
    telefono: 170,
    email: 260,
    tipo_contribuyente_id: 220,
    region: 180,
    estado: 220,
    zona: 180,
    direccion: 340,
  };

  const headerLabels = {
    rif: "RIF",
    nombre_empresa: "Empresa",
    telefono: "Teléfono",
    email: "Email",
    tipo_contribuyente_id: "Tipo Contribuyente",
    region: "Región",
    estado: "Estado",
    zona: "Zona",
    direccion: "Dirección",
  };

  /* =========================
     🔹 REGIONES / ESTADOS
  ========================== */
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

  /* =========================
     🔹 CARGAR SELECTS
  ========================== */
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

  /* =========================
     🔹 INICIALIZAR DATA
  ========================== */
  useEffect(() => {
    if (!isOpen || !data.length) return;

    if (!selectOptions.tipo_contribuyente_id?.length) {
      setTableData(data);
      return;
    }

    const tipos = selectOptions.tipo_contribuyente_id;

    const initialized = data.map((row) => {
      const tipoTexto = (
        row.tipo_contribuyente_id ||
        row.tipo_contribuyente ||
        ""
      ).toString().toLowerCase().trim();

      let tipoMatch = tipos.find(
        (t) => t.nombre.toLowerCase() === tipoTexto
      );

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

    setTableData(initialized);
    setCurrentPage(1);
  }, [isOpen, data, selectOptions.tipo_contribuyente_id]);

  if (!isOpen || rol !== "admin") return null;

  /* =========================
     🔹 PAGINACIÓN
  ========================== */
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    if (field === "region") updated[index].estado = "#";
    setTableData(updated);
  };

  const handleDeleteRow = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
    toast.info("Fila eliminada");
  };

  const validateData = () => {
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      for (const field in validationRules) {
        const { valid, message } = validationRules[field](row[field], row);
        if (!valid) {
          toast.error(`Fila ${i + 1}: ${message}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateData()) return;
    onConfirm(tableData);
    toast.success("Datos listos para importar");
    onClose();
  };

  /* =========================
     🔹 RENDER
  ========================== */
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] xl:w-[85%] max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Previsualización de Importación</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] px-6 py-4">
          <table className="table-fixed border text-sm w-max min-w-full">
            <colgroup>
              {headers.map((h) => (
                <col key={h} style={{ width: `${columnWidths[h]}px` }} />
              ))}
              <col style={{ width: "80px" }} />
            </colgroup>

            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="border px-3 py-2 text-left whitespace-nowrap"
                  >
                    {headerLabels[h]}
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
                    {headers.map((field) => (
                      <td key={field} className="border px-2 py-1">
                        {field === "tipo_contribuyente_id" ? (
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={row[field]}
                            onChange={(e) => handleInputChange(idx, field, e.target.value)}
                          >
                            <option value="">Seleccione...</option>
                            {selectOptions.tipo_contribuyente_id?.map((o) => (
                              <option key={o.id} value={o.id}>{o.nombre}</option>
                            ))}
                          </select>
                        ) : field === "region" ? (
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={row.region}
                            onChange={(e) => handleInputChange(idx, "region", e.target.value)}
                          >
                            <option value="#">Seleccione...</option>
                            {regiones.map((r) => (
                              <option key={r.id} value={r.nombre}>{r.nombre}</option>
                            ))}
                          </select>
                        ) : field === "estado" ? (
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={row.estado}
                            onChange={(e) => handleInputChange(idx, "estado", e.target.value)}
                          >
                            <option value="#">Seleccione...</option>
                            {(estadosPorRegion[row.region] || []).map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={row[field] ?? ""}
                            onChange={(e) => handleInputChange(idx, field, e.target.value)}
                          />
                        )}
                      </td>
                    ))}

                    <td className="border text-center">
                      <button onClick={() => handleDeleteRow(idx)} className="text-red-500">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Importación</button>
        </div>
      </div>
    </div>
  );
};

export default ModalImportPreviewClients;
