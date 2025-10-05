import React, { useState } from "react";

function ModalPreinvoices({ isOpen, onClose, message }) {
  if (!isOpen) return null; // Si la modal no está abierta, no renderiza nada

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} class="z-50">
        <div className="flex flex-wrap h-full">
          <div className="w-full lg:w-12/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">
              <div class="rounded-t bg-white mb-0 px-6 py-6">
                <div class="text-center flex justify-center pb-4">
                  <h6 class="text-blueGray-700 text-xl font-bold">Detalles de la Pre-Factura</h6>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Fecha de Pre-Factura:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.fecha_factura ? message.fecha_factura.replace('T',' ').substr(0, 19) : ''}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Número de control:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.numero_control}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Correlativo:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.correlativo_interno}</label>
                  </div>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">RIF:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.cliente_final_rif}</label>
                  </div>
                  <div className="lg:w-8/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Razón Social:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.cliente_final_nombre}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Tipo de documento:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.tipo_documento}</label>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Estado:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.estatus}</label>
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
                          <label className="text-blueGray-700">{item.descripcion}</label>
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
                    <div className="lg:w-6/12 text-start">
                      {/*<label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Zona:</label>
                      <label class="text-blueGray-700 lg:w-8/12">{message.zona}</label>*/}
                    </div>
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
                    <div className="lg:w-6/12 text-start">
                      {/*<label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Zona:</label>
                      <label class="text-blueGray-700 lg:w-8/12">{message.zona}</label>*/}
                    </div>
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
                          }).format(message.total_neto)}
                        </label>
                      </div>
                    </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          <div style={buttonStyle}>
            <button className="bg-slate-800 text-white px-4 py-2 rounded " onClick={onClose}>Cancelar</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Estilos para la modal
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  width: "70%",
  height: "90%",
};

const buttonStyle = {
  position: "fixed",
  justifyContent: "center",
  alignItems: "center",
  bottom: "9%",
  left: "47%",
  textAlign: "center",
};

export default ModalPreinvoices;