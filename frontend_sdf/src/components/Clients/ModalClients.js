import React, { useState } from "react";

function ModalClients({ isOpen, onClose, message }) {
  if (!isOpen) return null; // Si la modal no está abierta, no renderiza nada

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} class="z-50">
        <div className="flex flex-wrap h-full">
          <div className="w-full lg:w-12/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">
              <div class="rounded-t bg-white mb-0 px-6 py-6">
                <div class="text-center flex justify-center pb-4">
                  <h6 class="text-blueGray-700 text-xl font-bold">Detalles del cliente</h6>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">RIF:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.rif}</label>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Razón Social:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.nombre_empresa}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Telefóno:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.telefono}</label>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Dirección:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.direccion}</label>
                  </div>
                </div>
                <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
                <div class="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Tipo de contribuyente:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.tipo_contribuyente_id}</label>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    {/*<label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Dirección:</label>
                    <label class="text-blueGray-700 lg:w-8/12">{message.direccion}</label>*/}
                  </div>
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
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

export default ModalClients;