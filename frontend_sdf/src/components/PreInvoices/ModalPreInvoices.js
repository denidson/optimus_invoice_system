import React from "react";
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";

function ModalPreinvoices({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">

      {/* MODAL */}
      <div className="bg-white w-[70%] h-[90%] rounded-lg shadow-xl overflow-hidden relative flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-6 border-b bg-white">
          <h6 className="text-twilight-indigo-600 font-bold text-center">
            Detalles de la Pre-Factura
          </h6>
        </div>

        {/* BODY CON SCROLL */}
        <div className="overflow-y-auto h-[calc(100%-120px)] px-4">
          <div className="flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">

                {/* Datos principales de la pre-factura */}
                <hr className="my-6 border-b border-blueGray-300"/>
                <div className="px-5 flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Fecha de Pre-Factura:</label>
                    <span className="text-blueGray-700">{message.fecha_factura ? formatDate(message.fecha_factura) : ''}</span>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Correlativo:</label>
                    <span className="text-blueGray-700">{message.correlativo_interno}</span>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Serial:</label>
                    <span className="text-blueGray-700">{message.serial?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Cliente */}
                <hr className="my-6 border-b border-blueGray-300"/>
                <div className="px-5 flex justify-between">
                  <div className="lg:w-2/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">RIF:</label>
                    <span className="text-blueGray-700">{message.cliente_final_rif}</span>
                  </div>
                  <div className="lg:w-5/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Razón Social:</label>
                    <span className="text-blueGray-700">{message.cliente_final_nombre}</span>
                  </div>
                  <div className="lg:w-5/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Dirección:</label>
                    <span className="text-blueGray-700">{message.zona?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Documento y Estado */}
                <hr className="my-6 border-b border-blueGray-300"/>
                <div className="px-5 flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Tipo de documento:</label>
                    <span className="text-blueGray-700">
                      {message.tipo_documento === 'FC' ? 'FACTURA' : message.tipo_documento === 'NC' ? 'NOTA DE CREDITO' : 'NOTA DE DEBITO'}
                    </span>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">Estado:</label>
                    <span className="text-blueGray-700">{message.estatus.toUpperCase()}</span>
                  </div>
                </div>
                {(message.tipo_documento === 'ND' || message.tipo_documento === 'NC') && message.factura_afectada_rel && (
                  <hr className="my-4 border-b border-blueGray-300"/>
                )}
                {/* Factura afectada */}
                {(message.tipo_documento === 'ND' || message.tipo_documento === 'NC') && message.factura_afectada_rel && (
                  <div className="mb-4 px-2 mt-0">
                    <h6 className="text-lg font-bold text-blueGray-700 mb-2">Factura afectada</h6>
                    <div className="flex flex-wrap justify-between">
                      <div className="w-1/5 text-start">
                        <label className="font-bold text-blueGray-700">Número de control:</label>
                        <div>{formatText(message.factura_afectada_rel.numero_control)}</div>
                      </div>
                      <div className="w-1/5 text-center">
                        <label className="font-bold text-blueGray-700">Fecha de emisión:</label>
                        <div>{formatDateTime(message.factura_afectada_rel.fecha_emision)}</div>
                      </div>
                      <div className="w-1/5 text-end">
                        <label className="font-bold text-blueGray-700">Total:</label>
                        <div>{'Bs. ' + formatMoney(message.factura_afectada_rel.total_neto)}</div>
                      </div>
                    </div>
                    <hr className="my-4 border-b border-blueGray-300"/>
                  </div>
                )}

                {/* Tabla de items */}
                <hr className="my-6 border-b border-blueGray-300"/>
                <div className="px-5 flex justify-between border-4 border-double p-2 mb-2">
                  <span className="lg:w-4/12 text-center font-bold">Producto</span>
                  <span className="lg:w-4/12 text-center font-bold">Cantidad</span>
                  <span className="lg:w-2/12 text-center font-bold">Impuesto</span>
                  <span className="lg:w-4/12 text-center font-bold">Precio Unitario</span>
                  <span className="lg:w-2/12 text-center font-bold">Desc %</span>
                  <span className="lg:w-4/12 text-center font-bold">Total</span>
                </div>

                {message.items && message.items.length > 0 ? (
                  message.items.map(item => (
                    <div key={item.id} className="px-5 flex justify-between border-b py-1">
                      <span className="lg:w-4/12 text-start">{item.producto ? `${item.producto.sku}-${item.producto.nombre}` : item.tipo_documento !== 'ND' ? `${item.descripcion}`: 'N/A'}</span>
                      <span className="lg:w-4/12 text-center">{item.cantidad.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="lg:w-2/12 text-center">{item.iva_categoria_id ? item.iva_categoria.tasa_porcentaje.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}</span>
                      <span className="lg:w-4/12 text-right">{item.precio_unitario.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="lg:w-2/12 text-center">{item.descuento_porcentaje?.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</span>
                      <span className="lg:w-4/12 text-right">{(item.cantidad * (item.precio_unitario - (item.precio_unitario * (item.descuento_porcentaje || 0)/100))).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 text-center border-b py-2">
                    No hay líneas asociadas
                  </div>
                )}

                {/* Totales */}
                <div className="px-5 flex justify-between mt-4">
                  <div className="lg:w-6/12 text-start pr-10">
                    {message.monto_pagado_divisas > 0 && (
                      <div className="flex justify-between">
                        <span className="font-bold">Monto pagado en divisas:</span>
                        <span>{`Bs. ${message.monto_pagado_divisas.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                    )}
                    {message.monto_pagado_divisas == 0 && (
                      <div className="w-1/2 text-left">

                      </div>
                    )}
                  </div>
                  <div className="lg:w-6/12 text-right">
                    <div className="flex justify-between">
                      <span className="font-bold">Base imponible:</span>
                      <span>{`Bs. ${message.total_base.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 flex justify-between mt-0">
                  <div className="lg:w-6/12 text-start pr-10">
                    {message.igtf_monto > 0 && (
                      <div className="flex justify-between">
                        <span className="font-bold">{`IGTF (${message.igtf_porcentaje.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%):`}</span>
                        <span>{`Bs. ${message.igtf_monto.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                    )}
                    {message.igtf_monto == 0 && (
                      <div className="w-1/2 text-left">

                      </div>
                    )}
                  </div>
                  <div className="lg:w-6/12 text-right">
                    <div className="flex justify-between">
                      <span className="font-bold">I.V.A:</span>
                      <span>{`Bs. ${message.total_impuestos.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 flex justify-between mt-0">
                  <div className="lg:w-6/12 text-start"></div>
                  <div className="lg:w-6/12 text-right flex justify-between">
                    <span className="font-bold">Total:</span>
                    <span>{`Bs. ${(message.total_neto ? message.total_neto - message.igtf_monto : message.total - message.igtf_monto).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
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
}

export default ModalPreinvoices;
