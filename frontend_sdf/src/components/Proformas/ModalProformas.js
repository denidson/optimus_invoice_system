import React from "react";
import { formatDecimal, formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";

function ModalProformas({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">

      {/* MODAL */}
      <div className="bg-white w-[70%] h-[90%] rounded-lg shadow-xl overflow-hidden relative flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-6 border-b bg-white">
          <h6 className="text-twilight-indigo-600 font-bold text-center">
            Detalles de la Proformas
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
                    <label className="text-blueGray-700 font-bold me-3">Fecha de Proformas:</label>
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
                        <div>{formatMoney(message.factura_afectada_rel.total_neto)}</div>
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
                      <span className="lg:w-4/12 text-center">{formatDecimal(item.cantidad)}</span>
                      <span className="lg:w-2/12 text-center">{item.iva_categoria_id ? formatDecimal(item.iva_categoria.tasa_porcentaje) : '0,00'}</span>
                      <span className="lg:w-4/12 text-right">{formatDecimal(item.precio_unitario)}</span>
                      <span className="lg:w-2/12 text-center">{formatDecimal(item.descuento_porcentaje) || '0,00'}</span>
                      <span className="lg:w-4/12 text-right">{formatDecimal(item.cantidad * (item.precio_unitario - (item.precio_unitario * (item.descuento_porcentaje || 0)/100)))}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 text-center border-b py-2">
                    No hay líneas asociadas
                  </div>
                )}
                <div className="flex flex-wrap">
                  <div className="flex w-full lg:w-8/12 px-2 ml-0 lg:ml-0 mt-3 pb-3 flex-1 min-w-0 border border-gray-200 rounded-lg shadow-sm">
                    <div className="w-full lg:w-9/12 px-1 mt-3 pl-0">
                      <div className="relative w-full mb-3 text-end">
                        <div className="px-5 flex justify-between border-4 border-double p-2 mb-2">
                          <span className="lg:w-4/12 text-center font-bold">Medio de pago</span>
                          <span className="lg:w-4/12 text-center font-bold">Banco</span>
                          <span className="lg:w-4/12 text-center font-bold">Monto</span>
                        </div>

                        {message.pagos && message.pagos.length > 0 ? (
                          message.pagos.map(pago => (
                            <div key={pago.id} className="px-5 flex justify-between border-b py-1">
                              <span className="lg:w-4/12 text-start">{pago.metodo_pago_nombre ? formatText(pago.metodo_pago_nombre) : ''}</span>
                              <span className="lg:w-4/12 text-center">{pago.banco && pago.aplica_igtf == false ? formatText(pago.banco) : 'N/A'}</span>
                              <span className="lg:w-4/12 text-right">{formatDecimal(pago.monto)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-5 text-center border-b py-2">
                            No se encontraron pagos asociadas
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full lg:w-3/12 px-1 pr-0 pt-1 pb-1 mt-0">
                      {(message.monto_pagado_divisas > 0.0) ?
                        (<div className="mt-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50">

                          <div className="p-4 pb-2 border-b border-gray-200">
                            <label className="block text-blueGray-600 text-xs font-bold mb-2">
                              Total pagado en divisas
                            </label>
                          </div>

                          <div className="p-4 pt-0 text-right border-b border-gray-200">
                            <label className="border-0 px-3 text-blueGray-600 rounded text-lg font-bold">
                              {formatMoney(message.monto_pagado_divisas)}
                            </label>
                          </div>

                          <div className="p-4 pb-2 border-b border-gray-200">
                            <label className="block text-blueGray-600 text-xs font-bold mb-2">
                              {'IGTF ' + formatDecimal(message.igtf_porcentaje) + '%' }
                            </label>
                          </div>

                          <div className="p-4 pt-0 text-right">
                            <label className="border-0 px-3 text-blueGray-600 rounded text-lg font-bold">
                              {formatMoney(message.igtf_monto)}
                            </label>
                          </div>
                        </div>)
                        :
                        (<div className="apply_igtf mt-3 rounded-lg shadow-sm bg-gray-50">
                        </div>)
                      }
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-0 mt-3">
                    <div className="flex w-full mb-1">
                      <div className="w-full lg:w-5/12 px-4 mt-3">
                        <label className="block text-blueGray-600 font-bold text-lg">Base imponible</label>
                      </div>
                      <div className="w-full lg:w-7/12 px-4 mt-3 text-right pr-0">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold pr-1">
                        {formatMoney(message.total_base)}
                        </label>
                      </div>
                    </div>
                    <div className="flex w-full mb-1">
                      <div className="w-full lg:w-4/12 px-4">
                        <label className="block text-blueGray-600 font-bold text-lg">I.V.A.</label>
                      </div>
                      <div className="w-full lg:w-8/12 px-4 text-right pr-0">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold pr-1">
                        {formatMoney(message.total_impuestos)}
                        </label>
                      </div>
                    </div>
                    <div className="flex w-full mb-3">
                      <div className="w-full lg:w-4/12 px-4">
                        <label className="block text-blueGray-600 font-bold text-lg">Total</label>
                      </div>
                      <div className="w-full lg:w-8/12 px-4 text-right pr-0">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold pr-1">
                        {formatMoney(message.total - message.igtf_monto)}
                        </label>
                      </div>
                    </div>
                    {(message.monto_pagado_divisas > 0.0) ?
                    (<div className="flex w-full mb-3">
                        <div className="w-full lg:w-4/12 px-4">
                          <label className="block text-blueGray-600 font-bold text-lg">Total + IGTF</label>
                        </div>
                        <div className="w-full lg:w-8/12 px-4 text-right pr-0">
                          <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold pr-1 ">
                          {formatMoney(message.total)}
                          </label>
                        </div>
                      </div>)
                      :
                      (<div className="hidden flex w-full mb-3">
                        <div className="w-full lg:w-3/12 px-4">
                        </div>
                        <div className="w-full lg:w-9/12 px-4 text-right">
                        </div>
                      </div>)
                    }
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

export default ModalProformas;