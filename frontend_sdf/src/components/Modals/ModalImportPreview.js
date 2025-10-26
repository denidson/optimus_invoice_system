// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// const ModalImportPreview = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   data = [],
//   rol,
//   cliente_id,
//   apiSelects = {},
//   validationRules = {},
//   clienteAsignado
// }) => {
//   const [tableData, setTableData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectOptions, setSelectOptions] = useState({});
//   const rowsPerPage = 10;

//   // Cargar selects desde API
//   useEffect(() => {
//     const fetchSelects = async () => {
//       const results = {};
//       for (const key in apiSelects) {
//         try { results[key] = await apiSelects[key](); }
//         catch { results[key] = []; }
//       }
//       setSelectOptions(results);
//     };

//     if (isOpen) fetchSelects();
//   }, [isOpen, apiSelects]);

//   // Inicializar datos con cliente e IVA
//   useEffect(() => {
//     if (!isOpen || !data.length) return;

//     const initializedData = data.map(row => {
//       const ivaClean = row.iva_categoria ? String(row.iva_categoria).replace("%","").trim() : "";

//       // Asignar id de IVA si ya tenemos opciones cargadas
//       let ivaId = null;
//       if (selectOptions.iva_categoria?.length) {
//         const opt = selectOptions.iva_categoria.find(o => o.nombre === ivaClean);
//         ivaId = opt?.id || null;
//       }

//       // Cliente fijo para operador
//       const cliId = rol === "operador" ? cliente_id || "" : row.cliente_id || "";
//       const cliNombre = rol === "operador"
//         ? clienteAsignado?.nombre_empresa || clienteAsignado?.nombre || ""
//         : row.cliente_nombre || "";

//       return {
//         ...row,
//         iva_categoria: ivaClean,
//         iva_categoria_id: ivaId,
//         cliente_id: cliId,
//         cliente_nombre: cliNombre
//       };
//     });

//     setTableData(initializedData);
//     setCurrentPage(1);
//   }, [isOpen, data, rol, cliente_id, clienteAsignado, selectOptions.iva_categoria]);

//   // Actualizar cliente admin si coincide con Excel
//   useEffect(() => {
//     if (!isOpen || rol !== "admin" || !selectOptions.cliente_id?.length) return;

//     setTableData(prev =>
//       prev.map(row => {
//         if (!row.cliente_id) return row;
//         const match = selectOptions.cliente_id.find(
//           c => String(c.id) === String(row.cliente_id)
//             || c.rif?.trim().toLowerCase() === row.cliente_id?.trim().toLowerCase()
//             || c.nombre_empresa?.trim().toLowerCase() === row.cliente_id?.trim().toLowerCase()
//         );
//         return match
//           ? { ...row, cliente_id: match.id, cliente_nombre: match.nombre_empresa || match.nombre }
//           : row;
//       })
//     );
//   }, [isOpen, rol, selectOptions.cliente_id]);

//   if (!isOpen) return null;

//   // Columnas visibles según rol
//   const headers = ["sku", "nombre", "descripcion", "precio_base", "iva_categoria"];
//   if (rol === "operador") headers.push("cliente_nombre");
//   if (rol === "admin") headers.push("cliente_id");

//   const totalPages = Math.ceil(tableData.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

//   // Manejo de cambios en inputs/selects
//   const handleInputChange = (index, field, value) => {
//     const updated = [...tableData];
//     updated[index][field] = value;

//     // Actualizar id de IVA siempre que se cambie
//     if (selectOptions.iva_categoria?.length) {
//       const ivaOpt = selectOptions.iva_categoria.find(o => o.nombre === updated[index].iva_categoria);
//       updated[index].iva_categoria_id = ivaOpt?.id || null;
//     }

//     // Actualizar nombre de cliente si admin cambia cliente_id
//     if (field === "cliente_id" && selectOptions.cliente_id?.length) {
//       const cliOpt = selectOptions.cliente_id.find(o => o.id === Number(value));
//       updated[index].cliente_nombre = cliOpt?.nombre_empresa || cliOpt?.nombre || "";
//     }

//     setTableData(updated);
//   };

//   const handleDeleteRow = (index) => {
//     const updated = [...tableData];
//     updated.splice(index, 1);
//     setTableData(updated);
//     toast.info("Fila eliminada");
//   };

//   const validateData = () => {
//     let valid = true;
//     tableData.forEach((row, i) => {
//       for (const field in validationRules) {
//         const rule = validationRules[field];
//         const { valid: fieldValid, message } = rule(row[field], row);
//         if (!fieldValid) { toast.error(`Fila ${i + 1}: ${message}`); valid = false; break; }
//       }
//     });
//     return valid;
//   };

//   const handleConfirm = () => {
//     if (!validateData()) return;
//     onConfirm(tableData.map(r => ({ ...r, iva_categoria_id: r.iva_categoria_id, cliente_id: r.cliente_id })));
//     toast.success("Datos listos para importar");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
//       <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 max-h-[95vh] overflow-hidden">

//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 border-b">
//           <h2 className="text-lg font-bold text-gray-800">Previsualización de Importación</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
//         </div>

//         {/* Tabla */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[75vh] px-4 py-3">
//           <table className="min-w-full border border-gray-200 text-sm">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 {headers.map(h => <th key={h} className="border px-3 py-2 text-left text-gray-600 font-semibold">{h}</th>)}
//                 <th className="border px-3 py-2 text-center text-gray-600 font-semibold w-16">Acción</th>
//               </tr>
//             </thead>
//             <tbody>
//               {visibleRows.map((row, rowIndex) => {
//                 const actualIndex = startIndex + rowIndex;
//                 return (
//                   <tr key={actualIndex} className="hover:bg-gray-50">
//                     {headers.map(field => (
//                       <td key={field} className="border px-2 py-1">
//                         {field === "iva_categoria" ? (
//                           <select
//                             className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
//                             value={row[field] || ""}
//                             onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
//                           >
//                             {selectOptions.iva_categoria?.map(opt => (
//                               <option key={opt.id} value={opt.nombre}>
//                                 {opt.nombre} ({opt.tasa_porcentaje}%)
//                               </option>
//                             ))}
//                           </select>
//                         ) : field === "cliente_nombre" && rol === "operador" ? (
//                           <div>{row.cliente_nombre}</div>
//                         ) : field === "cliente_id" && rol === "admin" ? (
//                           <select
//                             className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
//                             value={row.cliente_id || ""}
//                             onChange={(e) => handleInputChange(actualIndex, "cliente_id", e.target.value)}
//                           >
//                             <option value="">Seleccione un cliente</option>
//                             {selectOptions.cliente_id?.map(c => (
//                               <option key={c.id} value={c.id}>
//                                 {c.nombre_empresa || c.nombre} {c.rif ? `(${c.rif})` : ""}
//                               </option>
//                             ))}
//                           </select>
//                         ) : (
//                           <input
//                             type="text"
//                             className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
//                             value={row[field] ?? ""}
//                             onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
//                           />
//                         )}
//                       </td>
//                     ))}
//                     <td className="border text-center">
//                       <button onClick={() => handleDeleteRow(actualIndex)} className="text-red-500 hover:text-red-700" title="Eliminar fila">
//                         <i className="fa-regular fa-rectangle-xmark fa-lg"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Paginación */}
//         <div className="flex justify-between items-center px-6 py-3 border-t bg-gray-50 text-sm">
//           <span>Página {currentPage} de {totalPages}</span>
//           <div className="flex space-x-1">
//             <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">«</button>
//             <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">‹</button>
//             <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">›</button>
//             <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">»</button>
//           </div>
//         </div>

//         {/* Botones */}
//         <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-white">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">Cancelar</button>
//           <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Guardar Importación</button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ModalImportPreview;
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
  validationRules = {},
  clienteAsignado
}) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectOptions, setSelectOptions] = useState({});
  const rowsPerPage = 10;

  // 🔹 Detectar si el Excel es de productos o clientes
  const esImportClientes = data.length && data[0].rif !== undefined;

  // 🔹 Cargar selects desde API
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

  // 🔹 Inicializar datos
  useEffect(() => {
    if (!isOpen || !data.length) return;

    const initializedData = data.map((row) => {
      // Si es productos
      if (!esImportClientes) {
        const ivaClean = row.iva_categoria ? String(row.iva_categoria).replace("%", "").trim() : "";

        // Asignar id de IVA si hay opciones
        let ivaId = null;
        if (selectOptions.iva_categoria?.length) {
          const opt = selectOptions.iva_categoria.find((o) => o.nombre === ivaClean);
          ivaId = opt?.id || null;
        }

        // Cliente fijo para operador
        const cliId = rol === "operador" ? cliente_id || "" : row.cliente_id || "";
        const cliNombre =
          rol === "operador"
            ? clienteAsignado?.nombre_empresa || clienteAsignado?.nombre || ""
            : row.cliente_nombre || "";

        return {
          ...row,
          iva_categoria: ivaClean,
          iva_categoria_id: ivaId,
          cliente_id: cliId,
          cliente_nombre: cliNombre,
        };
      }

      // Si es clientes → solo devolver igual por ahora
      return { ...row };
    });

    setTableData(initializedData);
    setCurrentPage(1);
  }, [isOpen, data, rol, cliente_id, clienteAsignado, selectOptions.iva_categoria, esImportClientes]);

  // 🔹 Coincidencia automática de cliente (solo admin)
  useEffect(() => {
    if (!isOpen || rol !== "admin" || !selectOptions.cliente_id?.length || esImportClientes) return;

    setTableData((prev) =>
      prev.map((row) => {
        if (!row.cliente_id) return row;
        const match = selectOptions.cliente_id.find(
          (c) =>
            String(c.id) === String(row.cliente_id) ||
            c.rif?.trim().toLowerCase() === row.cliente_id?.trim().toLowerCase() ||
            c.nombre_empresa?.trim().toLowerCase() === row.cliente_id?.trim().toLowerCase()
        );
        return match
          ? { ...row, cliente_id: match.id, cliente_nombre: match.nombre_empresa || match.nombre }
          : row;
      })
    );
  }, [isOpen, rol, selectOptions.cliente_id, esImportClientes]);

  if (!isOpen) return null;

  // 🔹 Columnas dinámicas
  let headers = [];
  if (esImportClientes) {
    headers = ["nombre", "rif", "correo", "telefono", "direccion", "zona", "tipo_cliente"];
  } else {
    headers = ["sku", "nombre", "descripcion", "precio_base", "iva_categoria"];
    if (rol === "operador") headers.push("cliente_nombre");
    if (rol === "admin") headers.push("cliente_id");
  }

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = tableData.slice(startIndex, startIndex + rowsPerPage);

  // 🔹 Manejo de cambios
  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;

    // Productos
    if (!esImportClientes) {
      if (selectOptions.iva_categoria?.length) {
        const ivaOpt = selectOptions.iva_categoria.find((o) => o.nombre === updated[index].iva_categoria);
        updated[index].iva_categoria_id = ivaOpt?.id || null;
      }

      if (field === "cliente_id" && selectOptions.cliente_id?.length) {
        const cliOpt = selectOptions.cliente_id.find((o) => o.id === Number(value));
        updated[index].cliente_nombre = cliOpt?.nombre_empresa || cliOpt?.nombre || "";
      }
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
    onConfirm(
      tableData.map((r) => ({
        ...r,
        iva_categoria_id: r.iva_categoria_id,
        cliente_id: r.cliente_id,
      }))
    );
    toast.success("Datos listos para importar");
    onClose();
  };

  // 🔹 Solo admin puede importar clientes
  if (esImportClientes && rol !== "admin") {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-lg p-6 w-96 text-center">
          <h2 className="text-lg font-semibold mb-3">Acceso restringido</h2>
          <p className="text-gray-600">Solo los administradores pueden importar clientes.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            Previsualización de Importación {esImportClientes ? "de Clientes" : "de Productos"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">
            ×
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] px-4 py-3">
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
                        {/* Productos */}
                        {!esImportClientes ? (
                          field === "iva_categoria" ? (
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={row[field] || ""}
                              onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                            >
                              {selectOptions.iva_categoria?.map((opt) => (
                                <option key={opt.id} value={opt.nombre}>
                                  {opt.nombre} ({opt.tasa_porcentaje}%)
                                </option>
                              ))}
                            </select>
                          ) : field === "cliente_nombre" && rol === "operador" ? (
                            <div>{row.cliente_nombre}</div>
                          ) : field === "cliente_id" && rol === "admin" ? (
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={row.cliente_id || ""}
                              onChange={(e) => handleInputChange(actualIndex, "cliente_id", e.target.value)}
                            >
                              <option value="">Seleccione un cliente</option>
                              {selectOptions.cliente_id?.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nombre_empresa || c.nombre} {c.rif ? `(${c.rif})` : ""}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row[field] ?? ""}
                              onChange={(e) => handleInputChange(actualIndex, field, e.target.value)}
                            />
                          )
                        ) : (
                          // Clientes
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
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

        {/* Paginación y botones */}
        <div className="flex justify-between items-center px-6 py-3 border-t bg-gray-50 text-sm">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">«</button>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">‹</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">»</button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-white">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">Cancelar</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Guardar Importación</button>
        </div>
      </div>
    </div>
  );
};

export default ModalImportPreview;

