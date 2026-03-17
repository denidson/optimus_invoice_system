import React, { useState, useEffect, useMemo, useRef } from "react";
import { generateWithholdingPDF } from "../../utils/pdf/WithholdingPDF/generateWithholdingPDF";
import { formatDecimal, formatMoney, formatFiscalPeriod, formatDate, formatText } from "../../utils/formatters";

const ModalWithholding = ({ data, onClose }) => {
  const [viewMode, setViewMode] = useState("detalle");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    if (!data) {
      setViewMode("detalle");
      setPdfUrl(null);
    }
  }, [data]);

  const handleViewPDF = async () => {
    try {
      setLoadingPdf(true);

      let url;
      url = await generateWithholdingPDF(data.id, "view");
      setPdfUrl(url);
      setViewMode("pdf");

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPdf(false);
    }
  };

  if (!data) return null;
  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h6 className="text-xl font-bold">
              Retención Nº {data.numero_comprobante}
            </h6>

            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={handleViewPDF}
              >
                Ver PDF
              </button>

              {viewMode === "pdf" && (
                <button
                  className="bg-gray-500 text-white px-4 py-1 rounded"
                  onClick={() => setViewMode("detalle")}
                >
                  Volver
                </button>
              )}
            </div>
          </div>
          <hr className="my-4 border-b border-blueGray-300"/>
        </div>
        {viewMode === "detalle" && (
          <>
            {/* contenido scroll */}
            <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">
              {rol == 'admin' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-2">Información de empresa afiliada</h4>
                    <p><b>R.I.F:</b> {formatText(data.cliente.rif)}</p>
                    <p><b>Razón social:</b> {formatText(data.cliente.nombre_empresa)}</p>
                  </div>
                  <div></div>
                </div>
              )}
              {rol == 'admin' && (
                <hr className="my-6" />
              )}
              {/* secciones */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Datos del Sujeto Retenido</h4>
                  <p><b>Nombre:</b> {formatText(data.sujeto_retenido?.nombre)}</p>
                  <p><b>RIF:</b> {formatText(data.sujeto_retenido?.rif)}</p>
                </div>

                <div class="capitalize">
                  <h4 className="font-bold mb-2">Información</h4>
                  <p><b>Período Fiscal:</b> {formatFiscalPeriod(data.periodo_fiscal)}</p>
                  <p><b>Fecha Emisión:</b> {formatDate(data.fecha_emision)}</p>
                  <p><b>Fecha Entrega:</b> {data.fecha_entrega ? formatDate(data.fecha_entrega) : ""}</p>
                  <p><b>Estatus:</b> {data.estatus}</p>
                  <p><b>Estatus Seniat:</b> {data.estatus_seniat}</p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Montos</h4>
                  <p><b>Base Imponible Total:</b> {formatMoney(data.monto_base_total)}</p>
                  <p><b>Monto Retenido Total:</b> {formatMoney(data.monto_retenido_total)}</p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Usuario</h4>
                  <p><b>Operador:</b> {data.usuario?.nombre}</p>
                  <p><b>Email:</b> {data.usuario?.email}</p>
                </div>
              </div>

              <hr className="my-6" />

              {/* tabla de items */}
              <h4 className="font-bold mb-3">Documentos Afectados</h4>

              <table className="w-full border border-twilight-indigo-700 text-sm">
                <thead>
                  <tr className="bg-twilight-indigo-100 border border-twilight-indigo-700">
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Número</th>
                    <th className="p-2">Número Control</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Base Imponible</th>
                    <th className="p-2">Alicuota</th>
                    <th className="p-2">Retención %</th>
                    <th className="p-2">Monto Retenido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.length ? (
                    data.items.map((i) => {
                      let tipoDoc = "FACTURA";
                      switch (i.tipo_documento_afectado) {
                        case "FC":
                          tipoDoc = "FACTURA";
                          break;
                        case "FD":
                          tipoDoc = "NOTA DE DÉBITO";
                          break;
                        case "NC":
                          tipoDoc = "NOTA DE CRÉDITO";
                          break;
                        default:
                          tipoDoc = "FACTURA";
                      }

                      return (
                        <tr key={i.id}>
                          <td className="p-2 text-center">{tipoDoc}</td>
                          <td className="p-2 text-center">{i.factura_afectada_numero}</td>
                          <td className="p-2 text-center">{i.factura_afectada_control}</td>
                          <td className="p-2 text-center">{formatDate(i.factura_afectada_fecha)}</td>
                          <td className="p-2 text-end">{formatDecimal(i.monto_base_imponible)}</td>
                          <td className="p-2 text-center">{(i.alicuota_iva != null ? formatDecimal(i.alicuota_iva) : '')}</td>
                          <td className="p-2 text-center">{i.tipo_retencion.descripcion}</td>
                          <td className="p-2 text-end">{formatDecimal(i.monto_retenido)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-3">
                        No hay documentos asociados
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          </>
        )}

        {viewMode === "pdf" && (
          <div className="w-full h-[80vh]">
            {loadingPdf ? (
              <div className="text-center mt-10">Generando PDF...</div>
            ) : (
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="PDF Viewer"
              />
            )}
          </div>
        )}
        {/* botón de cierre */}
        <div className="absolute bottom-4 w-full flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-twilight-indigo-600 hover:bg-twilight-indigo-500 text-white font-bold rounded shadow"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalWithholding;
