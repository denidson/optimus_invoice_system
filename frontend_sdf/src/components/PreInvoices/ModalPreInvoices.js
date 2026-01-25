import React from "react";
import { formatMoney, formatDate, formatText } from "../../utils/formatters";

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
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Fecha de Pre-Factura:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{formatDate(message.fecha_factura) ? formatDate(message.fecha_factura) : ''}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Correlativo:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.correlativo_interno}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Serial:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{(message.serial ? message.serial.toUpperCase():'')}</label>
                  </div>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-2/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">RIF:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.cliente_final_rif}</label>
                  </div>
                  <div className="lg:w-5/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Razón Social:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.cliente_final_nombre}</label>
                  </div>
                  <div className="lg:w-5/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Dirección:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{(message.zona ? message.zona.toUpperCase():'')}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Tipo de documento:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.tipo_documento == 'FC' ?
                        ('FACTURA')
                        :
                        (message.tipo_documento == 'NC'?
                          ('NOTA DE CREDITO')
                          :
                          ('NOTA DE DEBITO')
                        )
                      }</label>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Estado:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.estatus.toUpperCase()}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between border-4 p-2 border-double mb-2"> {/*border-b-4*/}
                  <div className="lg:w-4/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Producto</label>
                  </div>
                  <div className="lg:w-4/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Cantidad</label>
                  </div>
                  <div className="lg:w-2/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Impuesto</label>
                  </div>
                  <div className="lg:w-4/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Precio Unitario</label>
                  </div>
                  <div className="lg:w-2/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Desc %</label>
                  </div>
                  <div className="lg:w-4/12 text-center">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Total</label>
                  </div>
                </div>
                  {message.items && message.items.length > 0 ? (
                    message.items.map((item) => (
                      <div key={item.id} class="px-5 text-center flex justify-between border-b py-1 border-solid">
                        <div className="lg:w-4/12 text-start">
                          <label className="text-blueGray-700 ">{item.producto ? item.producto.sku + '-' + item.producto.nombre : 'N/A' }</label>
                        </div>
                        <div className="lg:w-4/12 text-center">
                          <label className="text-blueGray-700">
                          {new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(item.cantidad)}
                          </label>
                        </div>
                        <div className="lg:w-2/12 text-center">
                          <label className="text-blueGray-700">
                          {new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(item.iva_categoria_id ? item.iva_categoria.tasa_porcentaje : 0)}
                          </label>
                        </div>
                        <div className="lg:w-4/12 text-right">
                          <label className="text-blueGray-700">
                            {new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(item.precio_unitario)}
                          </label>
                        </div>
                        <div className="lg:w-2/12 text-center">
                          <label className="text-blueGray-700">
                          {new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(item.descuento_porcentaje ? item.descuento_porcentaje : 0)}
                          </label>
                        </div>
                        <div className="lg:w-4/12 text-right">
                          <label className="text-blueGray-700">
                            {new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(item.cantidad * (item.precio_unitario - (item.precio_unitario * (item.descuento_porcentaje ? item.descuento_porcentaje : 0)/100)))}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div class="px-5 text-center flex justify-between border-b p-2 border-solid">
                      <div className="lg:w-12/12 text-center">No hay líneas asociadas</div>
                    </div>
                  )}
                  <div class="px-5 text-center flex justify-between mt-4">
                    {(message.monto_pagado_divisas > 0) ?
                      (<div className="lg:w-6/12 text-start pr-10">
                      <div class="px-0 text-center flex justify-between mt-0">
                        <div className="lg:w-4/12 text-left font-bold me-3 text-nowrap">Monto pagado en divisas:</div>
                        <div className="lg:w-8/12 text-right">
                          <label className="text-blueGray-700">
                            {'Bs. ' + new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(message.monto_pagado_divisas)}
                          </label>
                        </div>
                      </div>
                    </div>
                    ):(<div className="lg:w-6/12 text-start pr-10">
                      <div class="px-0 text-center flex justify-between mt-0">
                      </div>
                    </div>)}
                    <div className="lg:w-6/12 text-right">
                      <div class="px-0 text-center flex justify-between mt-0">
                        <div className="lg:w-4/12 text-left font-bold me-3">Base imponible:</div>
                        <div className="lg:w-8/12 text-right">
                          <label className="text-blueGray-700">
                            {'Bs. ' + new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(message.total_base)}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="px-5 text-center flex justify-between mt-0">
                    {(message.igtf_monto > 0) ?
                      (<div className="lg:w-6/12 text-start pr-10">
                      <div class="px-0 text-center flex justify-between mt-0">
                        <div className="lg:w-4/12 text-left font-bold me-3">{'IGTF (' + new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(message.igtf_porcentaje) + '%):'}</div>
                        <div className="lg:w-8/12 text-right">
                          <label className="text-blueGray-700">
                            {'Bs. ' + new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(message.igtf_monto)}
                          </label>
                        </div>
                      </div>
                    </div>
                    ):(<div className="lg:w-6/12 text-start pr-10">
                      <div class="px-0 text-center flex justify-between mt-0">
                      </div>
                    </div>)}
                    <div className="lg:w-6/12 text-right">
                      <div class="px-0 text-center flex justify-between mt-0">
                        <div className="lg:w-4/12 text-left font-bold me-3">I.V.A:</div>
                        <div className="lg:w-8/12 text-right">
                          <label className="text-blueGray-700">
                            {'Bs. ' + new Intl.NumberFormat("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(message.total_impuestos)}
                          </label>
                        </div>
                      </div>
                  </div>
                </div>
                <div class="px-5 text-center flex justify-between mt-0">
                  <div className="lg:w-6/12 text-start">
                    {/*<label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Zona:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.zona}</label>*/}
                  </div>
                  <div className="lg:w-6/12 text-right">
                    <div class="px-0 text-center flex justify-between mt-0">
                      <div className="lg:w-4/12 text-left font-bold me-3">Total:</div>
                      <div className="lg:w-8/12 text-right">
                        <label className="text-blueGray-700">
                          {'Bs. ' + new Intl.NumberFormat("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(message.total_neto ? (message.total_neto - message.igtf_monto) : (message.total - message.igtf_monto))}
                        </label>
                      </div>
                    </div>
                </div>
              </div>
              {(message.monto_pagado_divisas > 0) ?
                (<div class="px-5 text-center flex justify-between mt-0">
                  <div className="lg:w-6/12 text-start">
                    {/*<label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Zona:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.zona}</label>*/}
                  </div>
                  <div className="lg:w-6/12 text-right">
                    <div class="px-0 text-center flex justify-between mt-0">
                      <div className="lg:w-4/12 text-left font-bold me-3">Total + IGTF:</div>
                      <div className="lg:w-8/12 text-right">
                        <label className="text-blueGray-700">
                          {'Bs. ' + new Intl.NumberFormat("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(message.total_neto ? message.total_neto : message.total)}
                        </label>
                      </div>
                    </div>
                </div>
              </div>
              ):(
                <div class="px-5 text-center flex justify-between mt-0">
                  <div className="lg:w-6/12 text-start">
                  </div>
                  <div className="lg:w-6/12 text-right">
                </div>
              </div>)}
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
