import React from "react";
import { formatMoney, formatDateTime, formatText } from "../../utils/formatters";

function ModalPreinvoices({ isOpen, onClose, message }) {
  if (!isOpen) return null;
  const hasNotaDebitoItems =
    message?.tipo_documento === "ND" &&
    message?.nota_debito_detalle?.items?.length > 0 && !message?.nota_debito_detalle?.items[0].producto;
  //console.log('hasNotaDebitoItems: ', hasNotaDebitoItems);
  var itemsList;
  if (message.tipo_documento == 'ND' && message.nota_debito_detalle?.items?.length > 0){
    itemsList = message.nota_debito_detalle?.items;
  }else if (message.tipo_documento == 'NC' && message.nota_credito_detalle?.items?.length > 0){
    itemsList = message.nota_credito_detalle?.items;
  }else{
    itemsList = message.items;
  }
  //console.log('itemsList: ', itemsList);
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[1200px] max-h-[90vh] overflow-y-auto relative p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h6 className="text-xl font-bold text-blueGray-700">Detalles de la {(message.tipo_documento == 'FC' ? 'Factura' : (message.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') )}</h6>
          <hr className="my-4 border-b border-blueGray-300"/>
        </div>

        {/* Información general */}
        <div className="flex flex-wrap justify-between px-2 mb-4">
          <div className="w-1/5 text-start">
            <label className="font-bold text-blueGray-700">Fecha de {(message.tipo_documento == 'FC' ? 'Factura' : (message.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') )}:</label>
            <div>{message.fecha_factura ? message.fecha_factura.replace('T',' ').substr(0,19) : ''}</div>
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
                <div>{'Bs. ' + formatMoney(message.factura_afectada_rel.total_neto)}</div>
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
                <div className="w-1/6 px-2 py-1">{item.cantidad.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="w-1/12 px-2 py-1">{item.iva_categoria_id ? item.iva_categoria.tasa_porcentaje.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}</div>
                <div className="w-1/6 px-2 py-1 text-right">{(message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="w-1/12 px-2 py-1">{item.descuento_porcentaje ? item.descuento_porcentaje.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}</div>
                <div className="w-1/4 px-2 py-1 text-right">
                  {(item.cantidad * ((message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario) - ((message.tipo_documento == 'FC' ? item.precio_unitario : item.monto_unitario) * (item.descuento_porcentaje || 0)/100))).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {formatMoney(item.monto)}
              </span>
            </div>
          ))
        )}

        {/* Totales */}
        <div className="flex flex-wrap justify-between px-2 text-right font-bold mb-4">
          {message.monto_pagado_divisas > 0 && (
            <div className="w-1/2 text-left">
              Monto pagado en divisas: Bs. {message.monto_pagado_divisas.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
          {message.monto_pagado_divisas == 0 && (
            <div className="w-1/2 text-left">

            </div>
          )}
          <div className="w-1/2">
            Base imponible: Bs. {message.total_base.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex flex-wrap justify-between px-2 text-right font-bold mb-4">
          {message.igtf_monto > 0 && (
            <div className="w-1/2 text-left">
              IGTF ({message.igtf_porcentaje.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%): Bs. {message.igtf_monto.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
          {message.igtf_monto == 0 && (
            <div className="w-1/2 text-left">

            </div>
          )}
          <div className="w-1/2">
            I.V.A: Bs. {message.total_impuestos.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex flex-wrap justify-between px-2 text-right font-bold mb-4">
          <div className="w-1/2"></div>
          <div className="w-1/2">
            Total: Bs. {(message.total_neto ? message.total_neto - message.igtf_monto : message.total - message.igtf_monto).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Botón Cancelar */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreinvoices;
