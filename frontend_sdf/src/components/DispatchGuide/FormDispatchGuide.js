import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { Autocomplete, TextField, Button } from "@mui/material";
import { esES } from "@mui/x-data-grid/locales";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getInvoices, showInvoice } from "../../services/api_invoices";
import { createDispatchGuide, showDispatchGuide } from "../../services/apiDispatchGuide";
import { showProfileClient } from "../../services/apiProfile";
import { decryptText } from "../../services/api";

// ******************************************************************
// FORM PRINCIPAL
// ******************************************************************
function FormDispatchGuides() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatchGuide_id = queryParams.get("id");

  const apiRef = useGridApiRef();

  const [DispatchGuides, setDispatchGuides] = useState([]);
  const [filterResults, setFilterResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [searchControl, setSearchControl] = useState("");

  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const authclientId = authData.cliente_id;
  const today = new Date().toISOString().split("T")[0];

  const [dispatchGuide, setDispatchGuide] = useState({
    id: null,
    "factura_id": 0,
    "fecha_salida": today,
    "factura_cliente_final_rif": '',
    "factura_cliente_final_nombre": '',
    "factura_numero_factura": '',
    "factura_numero_control": '',
    "origen": "Almacén Principal",
    "destino": "",
    "motivo_traslado": "",
    "transportista": "",
    "chofer": "",
  });


  // **********************************************************
  // CARGAR DATOS CLIENTE
  // **********************************************************
  useEffect(() => {
    if (!authclientId) return;

    showProfileClient(authclientId)
      .then((client) => {
        setDispatchGuide((prev) => ({
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
        //const data = await getDispatchGuides();
        //setDispatchGuides(data);
        console.log('dispatchGuide_id: ', dispatchGuide_id);
        if (dispatchGuide_id) {
          const dataDispatchGuide = await showDispatchGuide(
            decryptText(dispatchGuide_id)
          );
          setDispatchGuide(dataDispatchGuide);
        }
      } catch {
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatchGuide_id]);

  // **********************************************************
  // FECHA EMISIÓN
  // **********************************************************
  const handleFechaEmisionChange = (value) => {
    const periodo = value.slice(0, 7);
    setDispatchGuide((prev) => ({
      ...prev,
      fecha_emision: value,
      periodo_fiscal: periodo,
    }));
  };
  const handleFechaEntregaChange = (value) => {
    setDispatchGuide((prev) => ({
      ...prev,
      fecha_salida: value,
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

      setDispatchGuide((prev) => ({ ...prev, factura_id: invoice.id, factura_cliente_final_rif: invoice.cliente_final_rif, factura_cliente_final_nombre: invoice.cliente_final_nombre, factura_numero_factura: invoice.numero_factura, factura_numero_control: invoice.numero_control, destino: invoice.cliente_final_direccion || '' }));

      setSearchControl("");
      setFilterResults([]);
    } catch {
      toast.error("Error al cargar la factura");
    }
  };

  // **********************************************************
  // SUBMIT CON VALIDACIONES
  // **********************************************************
  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);

    // Validaciones mínimas antes de enviar
    if (!dispatchGuide.factura_id) {
      toast.error("Debe especificar la factura asociada");
      setButtonDisabled(false);
      return;
    }

    if (!dispatchGuide.origen) {
      toast.error("Debe indicar el origen del despacho");
      setButtonDisabled(false);
      return;
    }

    if (!dispatchGuide.destino) {
      toast.error("Debe indicar el destino del despacho");
      setButtonDisabled(false);
      return;
    }

    // ---------------------------------------------------------
    // Construir JSON final a enviar (payload)
    // ---------------------------------------------------------
    /*const payload = {
      sujeto_retenido_rif: withholding.sujeto_retenido_rif,
      sujeto_retenido_nombre: withholding.sujeto_retenido_nombre,
      numero_comprobante: withholding.numero_comprobante,
      periodo_fiscal: withholding.periodo_fiscal,
      fecha_emision: withholding.fecha_emision,
      fecha_entrega: withholding.fecha_entrega,
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
    };*/

    console.log("DispatchGuide enviado al backend:");
    console.log(JSON.stringify(dispatchGuide, null, 2));

    try {
      if (!dispatchGuide.id) {
        await createDispatchGuide(dispatchGuide);
        toast.success("Guía de despacho creada correctamente", {
          onClose: () => navigate("/dispatch-guide"),
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
            {!dispatchGuide.id ? "Crear" : "Actualizar"} Guía de despacho
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
                  value={dispatchGuide.sujeto_retenido_rif || ""} />
              </div>
              <div className="w-full lg:w-5/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Razón Social</label>
                <input 
                  disabled 
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-gray-200 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.sujeto_retenido_nombre || ""} />
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Fecha Entrega</label>
                <input
                  type="date"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.fecha_salida || ""}
                  max={today}
                  onChange={(e) => handleFechaEntregaChange(e.target.value.toUpperCase())}
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
                      onChange={(e) => handleSearchChange(e.target.value.toUpperCase())}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </div>
              <div className="w-full lg:w-6/12 px-4"></div>
              <div className="w-full lg:w-3/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">R.I.F. (Cliente)</label>
                <input disabled
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.factura_cliente_final_rif || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, factura_cliente_final_rif: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-3/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Razón social (Cliente)</label>
                <input disabled
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.factura_cliente_final_nombre || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, factura_cliente_final_nombre: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-3/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Número de factura</label>
                <input disabled
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.factura_numero_factura || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, factura_numero_factura: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-3/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Número de control</label>
                <input disabled
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.factura_numero_control || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, factura_numero_control: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-6/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Origen</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.origen || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, origen: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-6/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Destino</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.destino || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, destino: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-4/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Motivo de traslado</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.motivo_traslado || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, motivo_traslado: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-4/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Transportista (Opcional)</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.transportista || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, transportista: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-2/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Chofer (Opcional)</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.chofer || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, chofer: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="w-full lg:w-2/12 px-4 mt-4">
                <label className="block text-blueGray-600 text-xs font-bold mb-2">Placa (Opcional)</label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={dispatchGuide.placa || ""}
                  onChange={(e) =>
                    setDispatchGuide((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>

            <hr className="my-6 border-b-1 border-blueGray-300" />

            <div className="text-right">
              <button
                className="bg-slate-800 text-white px-4 py-2 rounded me-3"
                disabled={buttonDisabled}
                style={{ opacity: buttonDisabled ? 0.5 : 1 }}
                onClick={() => navigate("/dispatch-guide")}
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

export default FormDispatchGuides;
