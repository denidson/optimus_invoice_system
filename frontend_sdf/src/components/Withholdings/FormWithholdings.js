import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { Autocomplete, TextField, Button } from "@mui/material";
import { esES } from "@mui/x-data-grid/locales";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getInvoices, showInvoice } from "../../services/api_invoices";
import { getWithholdings } from "../../services/apiConfig";
import { createWithholding, showWithholding } from "../../services/apiWithholdings";
import { showProfileClient } from "../../services/apiProfile";
import { decryptText } from "../../services/api";

// ******************************************************************
// COMPONENTE EDITOR DE RETENCIÓN EN DATAGRID
// ******************************************************************
function WithholdingEditCell({ params, withholdings, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Autocomplete
      options={withholdings || []}
      fullWidth
      size="small"
      getOptionLabel={(option) =>
        option.descripcion && option.porcentaje
          ? `${option.descripcion} (${option.porcentaje}%)`
          : option.descripcion || ""
      }
      value={withholdings.find((w) => w.id === params.row.retencion_id) || null}
      onChange={(e, newValue) => onChange(params.row.id, newValue)}
      renderInput={(paramsInput) => (
        <TextField
          {...paramsInput}
          inputRef={inputRef}
          variant="standard"
          placeholder="Seleccione..."
          fullWidth
        />
      )}
    />
  );
}

// ******************************************************************
// FORM PRINCIPAL
// ******************************************************************
function FormWithholdings() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const withholding_id = queryParams.get("id");

  const apiRef = useGridApiRef();

  const [withholdings, setWithholdings] = useState([]);
  const [filterResults, setFilterResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [searchControl, setSearchControl] = useState("");

  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const authclientId = authData.cliente_id;

  const [withholding, setWithholding] = useState({
    id: null,
    sujeto_retenido_rif: "",
    sujeto_retenido_nombre: "",
    numero_comprobante: "",
    periodo_fiscal: "",
    fecha_emision: "",
    items: [],
  });

  const today = new Date().toISOString().split("T")[0];

  // **********************************************************
  // CARGAR DATOS CLIENTE
  // **********************************************************
  useEffect(() => {
    if (!authclientId) return;

    showProfileClient(authclientId)
      .then((client) => {
        setWithholding((prev) => ({
          ...prev,
          sujeto_retenido_rif: client.rif || "",
          sujeto_retenido_nombre: client.nombre_empresa || "",
        }));
      })
      .catch((err) => console.error(err));
  }, [authclientId]);

  // **********************************************************
  // CARGAR RETENCIONES + RETENCIÓN EXISTENTE
  // **********************************************************
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWithholdings();
        setWithholdings(data);

        if (withholding_id) {
          const dataWithholding = await showWithholding(
            decryptText(withholding_id)
          );
          setWithholding(dataWithholding);
        }
      } catch {
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [withholding_id]);

  // **********************************************************
  // FECHA EMISIÓN
  // **********************************************************
  const handleFechaEmisionChange = (value) => {
    const periodo = value.slice(0, 7);
    setWithholding((prev) => ({
      ...prev,
      fecha_emision: value,
      periodo_fiscal: periodo,
    }));
  };

  // **********************************************************
  // BUSCAR FACTURAS
  // **********************************************************
  const handleSearchChange = async (value) => {
    setSearchControl(value);
    if (value.length < 3) return;

    try {
      const response = await getInvoices({
        tipo_documento: "FC",
        numero_control: value,
      });
      setFilterResults(Array.isArray(response.data) ? response.data : []);
    } catch {
      setFilterResults([]);
    }
  };

  // **********************************************************
  // SELECCIONAR FACTURA
  // **********************************************************
  const handleInvoiceSelect = async (invoice) => {
    if (!invoice?.id) return;

    try {
      const fullInvoice = await showInvoice(invoice.id);
      const items = Array.isArray(fullInvoice.items) ? fullInvoice.items : [];

      // Agrupar items por categoría de IVA
      const groupedByIva = items.reduce((acc, item) => {
        const ivaKey = item.iva_categoria?.tasa_porcentaje || "0";
        if (!acc[ivaKey]) acc[ivaKey] = [];
        acc[ivaKey].push(item);
        return acc;
      }, {});

      // Crear una línea por cada categoría de IVA
      const newItems = Object.entries(groupedByIva).map(([iva, itemsGroup]) => {
        const baseImponible = itemsGroup.reduce((sum, item) => {
          const precio = parseFloat((item.precio_unitario || 0).toString().replace(",", "."));
          const cantidad = parseFloat((item.cantidad || 0).toString().replace(",", "."));
          return sum + precio * cantidad;
        }, 0);

        return {
          id: Date.now() + Math.random(), // id único
          comprobante_id: fullInvoice.id,
          tipo_documento_afectado: fullInvoice.tipo_documento || "FC",
          factura_afectada_numero: fullInvoice.numero_factura || "",
          factura_afectada_control: fullInvoice.numero_control || "",
          factura_afectada_fecha: fullInvoice.fecha_emision || "",
          monto_documento: parseFloat((fullInvoice.total_neto || 0).toString().replace(",", ".")) || 0,
          monto_base_imponible: parseFloat(baseImponible.toFixed(2)) || 0,
          iva: parseFloat(iva),
          retencion_id: null,
          tipo_retencion: null,
          monto_retenido: 0,
        };
      });

      setWithholding((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
      }));

      setSearchControl("");
      setFilterResults([]);
    } catch {
      toast.error("Error al cargar la factura");
    }
  };

  // **********************************************************
  // CAMBIO DE RETENCIÓN
  // **********************************************************
  let monto_retenido = 0;

  const handleRetencionChange = (itemId, retencion) => {
    if (!retencion) return;

    // Buscar el item correspondiente
    const item = withholding.items.find((i) => i.id === itemId);
    if (!item) return;

    let monto_retenido = 0;

    const isIvaRetention =
      retencion.codigo_seniat === "IVA_100" ||
      retencion.codigo_seniat === "IVA_75";

    if (isIvaRetention) {
      // calcular el IVA real del item
      const ivaCalculado =
        item.monto_base_imponible * (parseFloat(item.iva) / 100);

      monto_retenido = parseFloat(
        ((ivaCalculado * parseFloat(retencion.porcentaje)) / 100).toFixed(2)
      );
    } else {
      // retención sobre base imponible
      monto_retenido = parseFloat(
        ((item.monto_base_imponible * parseFloat(retencion.porcentaje)) / 100).toFixed(2)
      );
    }

    // actualizar el item
    setWithholding((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              retencion_id: retencion.id,
              tipo_retencion: retencion,
              monto_retenido: monto_retenido,
            }
          : i
      ),
    }));
  };


  // **********************************************************
  // ELIMINAR FILA
  // **********************************************************
  const handleDeleteRow = (id) => {
    setWithholding((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // **********************************************************
  // COLUMNAS DATAGRID
  // **********************************************************
  const columns = [
    { field: "factura_afectada_numero", headerName: "Nro. Factura", flex: 1 },
    { field: "factura_afectada_control", headerName: "Nro. Control", flex: 1 },
    {
      field: "factura_afectada_fecha",
      headerName: "Fecha",
      flex: 1,
      renderCell: (params) =>
        params.row.factura_afectada_fecha?.includes("T")
          ? params.row.factura_afectada_fecha.split("T")[0]
          : params.row.factura_afectada_fecha,
    },
    {
      field: "monto_documento",
      headerName: "Total Neto",
      flex: 1,
      renderCell: (params) =>
        Number(params.row.monto_documento ?? 0).toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      field: "monto_base_imponible",
      headerName: "Base Imponible",
      flex: 1,
      renderCell: (params) =>
        Number(params.row.monto_base_imponible ?? 0).toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      field: "iva",
      headerName: "IVA %",
      flex: 1,
      renderCell: (params) => `${params.row.iva || 0}`,
    },
    {
      field: "retencion_id",
      headerName: "Tipo Retención",
      width: 250,
      editable: true,
      renderCell: (params) => params.row.tipo_retencion?.descripcion || "—",
      renderEditCell: (params) => (
        <WithholdingEditCell
          params={params}
          withholdings={withholdings}
          onChange={handleRetencionChange}
        />
      ),
    },
    {
      field: "monto_retenido",
      headerName: "Monto Retenido",
      flex: 1,
      renderCell: (params) =>
        Number(params.row.monto_retenido ?? 0).toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      field: "acciones",
      headerName: "",
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button color="error" size="small" onClick={() => handleDeleteRow(params.row.id)}>
          <i className="fa-solid fa-lg fa-trash"></i>
        </Button>
      ),
    },
  ];

  // **********************************************************
  // SUBMIT CON VALIDACIONES
  // **********************************************************
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);

    // Validaciones mínimas antes de enviar
    if (!withholding.fecha_emision) {
      toast.error("La fecha de emisión es obligatoria");
      setButtonDisabled(false);
      return;
    }

    if (!withholding.numero_comprobante) {
      toast.error("El número de comprobante es obligatorio");
      setButtonDisabled(false);
      return;
    }

    if (!withholding.items.length) {
      toast.error("Debe agregar al menos una factura");
      setButtonDisabled(false);
      return;
    }

    for (let item of withholding.items) {
      if (!item.retencion_id) {
        toast.error(`Debe seleccionar el tipo de retención para la factura ${item.factura_afectada_numero}`);
        setButtonDisabled(false);
        return;
      }
    }

    // ---------------------------------------------------------
    // Construir JSON final a enviar (payload)
    // ---------------------------------------------------------
    const payload = {
      sujeto_retenido_rif: withholding.sujeto_retenido_rif,
      sujeto_retenido_nombre: withholding.sujeto_retenido_nombre,
      numero_comprobante: withholding.numero_comprobante,
      periodo_fiscal: withholding.periodo_fiscal,
      fecha_emision: withholding.fecha_emision,
      items: withholding.items.map((item) => ({
        factura_afectada_numero: item.factura_afectada_numero,
        factura_afectada_control: item.factura_afectada_control,
        factura_afectada_fecha: item.factura_afectada_fecha?.split("T")[0] || "",
        tipo_documento_afectado: item.tipo_documento_afectado,
        monto_documento: item.monto_documento.toFixed(2),
        monto_base_imponible: item.monto_base_imponible.toFixed(2),
        retencion_id: item.retencion_id,
        monto_retenido: item.monto_retenido.toFixed(2),
      })),
    };

    console.log("Payload enviado al backend:");
    console.log(JSON.stringify(payload, null, 2));

    try {
      if (!withholding.id) {
        await createWithholding(payload);
        toast.success("Retención creada correctamente", {
          onClose: () => navigate("/withholdings"),
        });
      }
    } catch (err) {
      console.error("Error del servidor:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Error al guardar";

      toast.error(backendMessage);
    } finally {
      setButtonDisabled(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  // **********************************************************
  // RENDER
  // **********************************************************
  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold">
            {!withholding.id ? "Crear" : "Actualizar"} Retención
          </h6>
        </div>

        <div className="flex-auto px-4 lg:px-10 py-10 pt-0 bg-white">
          <form onSubmit={handleSubmit}>
            <h4 className="font-bold mb-2">Datos del Sujeto Retenido</h4>
            <hr className="my-6 border-b-1 border-blueGray-300" />

            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">RIF</label>
                <input 
                  disabled
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={withholding.sujeto_retenido_rif || ""} />
              </div>
              <div className="w-full lg:w-5/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Razón Social</label>
                <input 
                  disabled 
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={withholding.sujeto_retenido_nombre || ""} />
              </div>
              <div className="w-full lg:w-3/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Nro. Comprobante</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={withholding.numero_comprobante || ""}
                  onChange={(e) =>
                    setWithholding((prev) => ({ ...prev, numero_comprobante: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap mt-4">
              <div className="w-full lg:w-3/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Fecha Emisión</label>
                <input
                  type="date"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={withholding.fecha_emision || ""}
                  max={today}
                  onChange={(e) => handleFechaEmisionChange(e.target.value)}
                />
              </div>

              <div className="w-full lg:w-3/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Periodo Fiscal</label>
                <input
                  disabled
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={withholding.periodo_fiscal || ""}
                />
              </div>
            </div>

            <hr className="my-6 border-b-1 border-blueGray-300" />
            <h4 className="font-bold mb-2">Documentos Afectados</h4>

            <div className="flex flex-wrap mt-6">
              <div className="w-full lg:w-6/12 px-4">
                <Autocomplete
                  options={filterResults || []}
                  getOptionLabel={(option) =>
                    `Factura: ${option.numero_factura} - Nro. Control: ${option.numero_control}`
                  }
                  value={null}
                  onChange={(e, selectedInvoice) => handleInvoiceSelect(selectedInvoice)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar factura por Nro. Control"
                      value={searchControl}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-wrap mt-6">
              <DataGrid
                apiRef={apiRef}
                rows={withholding.items}
                columns={columns}
                getRowId={(row) => row.id}
                autoHeight
                pageSize={5}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              />
            </div>

            <hr className="my-6 border-b-1 border-blueGray-300" />

            <div className="text-right">
              <button
                className="bg-slate-800 text-white px-4 py-2 rounded me-3"
                disabled={buttonDisabled}
                style={{ opacity: buttonDisabled ? 0.5 : 1 }}
                onClick={() => navigate("/withholdings")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={buttonDisabled}
                style={{ opacity: buttonDisabled ? 0.5 : 1 }}
              >
                {buttonDisabled ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormWithholdings;
