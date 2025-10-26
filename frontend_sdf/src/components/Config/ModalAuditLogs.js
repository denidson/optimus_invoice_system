import React, { useState } from "react";

function ModalAuditLogs({ isOpen, onClose, message }) {
  if (!isOpen) return null; // Si la modal no está abierta, no renderiza nada

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} class="z-50">
        <div className="flex flex-wrap h-full">
          <div className="w-full lg:w-12/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">
              <div class="rounded-t bg-white mb-0 px-6 py-6">
                <div class="text-center flex justify-center pb-4">
                  <h6 class="text-blueGray-700 text-xl font-bold">Detalles del registro de auditoria</h6>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Fecha:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.timestamp ? message.timestamp.replace('T',' ').substr(0, 19) : ''}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Servicio:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.endpoint}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Acción:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.method == 'GET' ?
                        ('CONSULTA')
                        :
                        (message.method == 'POST'?
                          (message.endpoint == '/api/login'?
                            ('INICIO DE SESIÓN')
                            :
                            ('CREACIÓN')
                          )
                          :
                          (message.method == 'PUT'?
                            ('ACTUALIZACIÓN')
                            :
                            ('DESACTIVACIÓN/ACTIVACiÓN')
                          )
                        )
                      }</label>
                  </div>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Origen:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.request_ip}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Respuesta:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.response_status_code}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Duraciión (Ms):</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.duration_ms}</label>
                  </div>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Usuario:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{(message.usuario ? message.usuario.email.toUpperCase():'')}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Usuario (Nombre):</label>
                    <label class="text-blueGray-700 lg:w-8/12">{(message.usuario ? message.usuario.nombre.toUpperCase():'')}</label>
                  </div>
                  <div className="lg:w-4/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Usuario (rol):</label>
                    <label class="text-blueGray-700 lg:w-8/12">{(message.usuario ? message.usuario.rol.toUpperCase():'')}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-12/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Encabezado de la solicitud:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.request_headers}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-12/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Cuerpo de la solicitud:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.request_body}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
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
export default ModalAuditLogs;