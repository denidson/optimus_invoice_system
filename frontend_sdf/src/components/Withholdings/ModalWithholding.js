import React from "react";
import { formatMoney, formatFiscalPeriod, formatDate, formatText } from "../../utils/formatters";

const ModalWithholding = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <h3 className="text-2xl text-twilight-indigo-600 font-bold text-center">
            Retención Nº {data.numero_comprobante}
          </h3>
        </div>

        {/* contenido scroll */}
        <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">

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
              <p><b>Estatus:</b> {data.estatus}</p>
              <p><b>Estatus Seniat:</b> {data.estatus_seniat}</p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Montos</h4>
              <p><b>Base Imponible Total:</b> Bs. {formatMoney(data.monto_base_total)}</p>
              <p><b>Monto Retenido Total:</b> Bs. {formatMoney(data.monto_retenido_total)}</p>
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
                      <td className="p-2 text-end">{formatMoney(i.monto_base_imponible)}</td>
                      <td className="p-2 text-center">{i.tipo_retencion.porcentaje} %</td>
                      <td className="p-2 text-end">{formatMoney(i.monto_retenido)}</td>
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
