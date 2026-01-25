import React, { useState } from "react";

function ModalClients({ isOpen, onClose, message }) {
  if (!isOpen) return null; // Si la modal no está abierta, no renderiza nada

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <h3 className=" font-bold text-center">
            Datos del Cliente
          </h3>
        </div>

        {/* contenido scroll */}
        <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">
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
              <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Correo electrónico:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.email}</label>
            </div>
          </div>
          <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
          <div class="px-5 text-center flex justify-between">
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Dirección:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.direccion}</label>
            </div>
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Zona:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.zona}</label>
            </div>
          </div>
          <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
          <div class="px-5 text-center flex justify-between">
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Estado:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.estado}</label>
            </div>
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Región:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.region}</label>
            </div>
          </div>
          <hr class="mx-3 my-6 border-b-1 border-blueGray-300"/>
          <div class="px-5 text-center flex justify-between">
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-4/12 font-bold me-3">Tipo de contribuyente:</label>
              <label class="text-blueGray-700 lg:w-8/12">{message.tipo_contribuyente.nombre + ' - ' + message.tipo_contribuyente.descripcion}</label>
            </div>
            <div className="lg:w-6/12 text-start">
              <label class="text-blueGray-700 lg:w-6/12 font-bold me-3">Condición:</label>
              {(message.activo == true) ? (
                  <label class="bg-emerald-400 text-white py-1 px-3 rounded-full text-center">Activo</label>
                ):(
                  <label class="bg-red-400 text-white py-1 px-3 rounded-full text-center">Inactivo</label>
                )}
            </div>
          </div>
          <hr class="my-6 border-b-1 border-blueGray-300"/>
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
    </div>
  );
}

export default ModalClients;