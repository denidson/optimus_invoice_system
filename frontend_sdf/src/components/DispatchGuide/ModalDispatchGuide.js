import React from "react";
import { formatMoney, formatFiscalPeriod, formatDate, formatText } from "../../utils/formatters";

const ModalWithholding = ({ data, onClose }) => {
  if (!data) return null;
  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <h3 className="text-2xl text-twilight-indigo-600 font-bold text-center">
            Guía de despacho - Nº de control: {data.factura.numero_control}
          </h3>
        </div>

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
              <p><b>Fecha de salida:</b> {formatDate(data.fecha_salida)}</p>
              <p><b>Ubicación de origen:</b> {formatText(data.origen)}</p>
              <p><b>Estatus:</b> {formatText(data.estatus)}</p>
            </div>

            <div >
            </div>
          </div>
          <hr className="my-6" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Información de la factura</h4>
              <p><b>Fecha Emisión:</b> {formatDate(data.factura.fecha_emision)}</p>
              <p><b>Número de control:</b> {formatText(data.factura.numero_control)}</p>
            </div>

            <div >
              <p><b>R.I.F:</b> {formatText(data.cliente_final.rif)}</p>
              <p><b>Razón social:</b> {formatText(data.cliente_final.nombre)}</p>
              <p><b>Teléfono:</b> {formatText(data.cliente_final.telefono)}</p>
              <p><b>Correo electrónico:</b> {formatText(data.cliente_final.email)}</p>
            </div>
          </div>
          <hr className="my-6" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Información de despacho</h4>
              <p><b>Dirección de destino:</b> {formatText(data.destino)}</p>
              <p><b>Motivo del traslado:</b> {formatText(data.motivo_traslado)}</p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Información de la unidad de transporte</h4>
              <p><b>Transportista:</b> {formatText(data.transportista)}</p>
              <p><b>Chofer:</b> {formatText(data.chofer)}</p>
              <p><b>Placa:</b> {formatText(data.placa)}</p>
            </div>
          </div>

          <hr className="my-6" />
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
