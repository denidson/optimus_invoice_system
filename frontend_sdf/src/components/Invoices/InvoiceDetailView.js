import React from "react";
import { formatDecimal, formatMoney, formatDateTime, formatText, formatDate } from "../../utils/formatters";

const InvoiceDetailView = ({ message }) => {
  const hasNotaDebitoItems =
    message?.tipo_documento === "ND" &&
    message?.nota_debito_detalle?.items?.length > 0 &&
    !message?.nota_debito_detalle?.items[0].producto;

  let itemsList;
  if (message.tipo_documento === 'ND' && message.nota_debito_detalle?.items?.length > 0) {
    itemsList = message.nota_debito_detalle.items;
  } else if (message.tipo_documento === 'NC' && message.nota_credito_detalle?.items?.length > 0) {
    itemsList = message.nota_credito_detalle.items;
  } else {
    itemsList = message.items;
  }

  return (
    <>
      {/* Información general */}
      <div className="flex flex-wrap justify-between px-2 mb-4">
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Fecha de {(message.tipo_documento == 'FC' ? 'Factura' : (message.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') )}:</label>
          <div>{message.fecha_factura ? formatDate(message.fecha_factura):''}</div>
        </div>
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Número de control:</label>
          <div>{message.numero_control}</div>
        </div>
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Número de factura:</label>
          <div>{message.numero_factura ? message.numero_factura.toUpperCase() : ''}</div>
        </div>
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Correlativo:</label>
          <div>{message.correlativo_interno}</div>
        </div>
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Serial:</label>
          <div>{message.serial ? message.serial.toUpperCase() : ''}</div>
        </div>
      </div>

      <hr className="my-4 border-b border-blueGray-300"/>

      {/* Cliente */}
      <div className="flex flex-wrap justify-between px-2 mb-4">
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">RIF:</label>
          <div>{message.cliente_final_rif}</div>
        </div>
        <div className="w-2/5 text-start">
          <label className="font-bold text-blueGray-700">Razón Social:</label>
          <div>{message.cliente_final_nombre}</div>
        </div>
        <div className="w-2/5 text-start">
          <label className="font-bold text-blueGray-700">Dirección:</label>
          <div>{message.cliente_final_direccion ? message.cliente_final_direccion.toUpperCase() : ''}</div>
        </div>
        <div className="w-1/5 text-start">
          <label className="font-bold text-blueGray-700">Teléfono:</label>
          <div>{message.cliente_final_telefono || ''}</div>
        </div>
      </div>

      <hr className="my-4 border-b border-blueGray-300"/>

      {/* Documento y Estado */}
      <div className="flex flex-wrap justify-between px-2 mb-4">
        <div className="w-1/2 text-start">
          <label className="font-bold text-blueGray-700">Tipo de documento:</label>
          <div>
            {message.tipo_documento === 'FC'
              ? 'FACTURA'
              : message.tipo_documento === 'NC'
              ? 'NOTA DE CREDITO'
              : 'NOTA DE DEBITO'}
          </div>
        </div>
        <div className="w-1/2 text-start">
          <label className="font-bold text-blueGray-700">Estado:</label>
          <div>{message.estatus.toUpperCase()}</div>
        </div>
      </div>

      {(message.tipo_documento === 'ND' || message.tipo_documento === 'NC') && message.factura_afectada_rel && (
        <hr className="my-4 border-b border-blueGray-300"/>
      )}

      {(message.tipo_documento === 'ND' || message.tipo_documento === 'NC') && message.factura_afectada_rel && (
        <div className="mb-4 px-2">
          {/* Título principal */}
          <label className="font-bold text-blueGray-700 mb-2">Factura afectada:</label>

          {/* Datos de la factura afectada */}
          <div className="flex flex-wrap justify-between mt-3">
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

      <hr className="my-4 border-b border-blueGray-300"/>

      {/* Tabla de Items */}
      {!hasNotaDebitoItems && (
      <div className="overflow-x-auto mb-4">

          <div className="flex bg-gray-100 border-b-2 border-gray-300 font-bold text-center">
            <div className="w-1/4 px-2 py-1">Producto</div>
            <div className="w-1/6 px-2 py-1">Cantidad</div>
            <div className="w-1/12 px-2 py-1">Impuesto</div>
            <div className="w-1/6 px-2 py-1">Precio Unitario</div>
            <div className="w-1/12 px-2 py-1">Desc %</div>
            <div className="w-1/4 px-2 py-1">Total</div>
          </div>
        {!hasNotaDebitoItems && itemsList && itemsList.length > 0 ? (
          itemsList.map((item) => (
            <div key={item.id} className="flex border-b border-gray-300 text-center">
              <div className="w-1/4 px-2 py-1 text-left">{item.producto ? item.producto.sku + '-' + item.producto.nombre : 'N/A'}</div>
              <div className="w-1/6 px-2 py-1">{formatDecimal(item.cantidad)}</div>
              <div className="w-1/12 px-2 py-1">{item.iva_categoria_id ? formatDecimal(item.iva_categoria.tasa_porcentaje) : '0,00'}</div>
              <div className="w-1/6 px-2 py-1 text-right">{formatDecimal(message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario)}</div>
              <div className="w-1/12 px-2 py-1">{item.descuento_porcentaje ? formatDecimal(item.descuento_porcentaje) : '0,00'}</div>
              <div className="w-1/4 px-2 py-1 text-right">
                {formatDecimal(item.cantidad * ((message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario) - ((message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario) * (item.descuento_porcentaje || 0)/100)))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex text-center border-b border-gray-300" >
            <div className="w-full px-2 py-2">No hay líneas asociadas</div>
          </div>
        )}
      </div>
      )}
      {hasNotaDebitoItems && (
        <div className="px-5 flex justify-between border-4 border-double p-2 mb-2">
          <span className="lg:w-8/12 text-center font-bold">Concepto</span>
          <span className="lg:w-4/12 text-center font-bold">Monto</span>
        </div>
      )}
      {hasNotaDebitoItems && (
        itemsList.map(item => (
          <div key={item.id} className="px-5 flex justify-between border-b py-1">
            <span className="lg:w-8/12 text-start">
              {formatText(item.concepto)}
            </span>
            <span className="lg:w-4/12 text-right">
              {formatDecimal(item.monto)}
            </span>
          </div>
        ))
      )}

      <div className="flex flex-wrap">
                  <div className="flex w-full lg:w-8/12 px-2 ml-0 lg:ml-0 mt-0 pb-3 flex-1 min-w-0 border border-gray-200 rounded-lg shadow-sm">
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
                  <div className="w-full lg:w-4/12 px-0 mt-0">
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
                        {formatMoney(message.total_neto - message.igtf_monto)}
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
                          {formatMoney(message.total_neto)}
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

    </>
  );
};

export default InvoiceDetailView;