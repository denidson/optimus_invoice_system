import React from "react";

export default function ProfileContent({ client }) {
  return (
    <div className="flex flex-col items-center mt-10 px-4">
      {/* Encabezado */}
      <div className="relative w-full max-w-3xl">
        <div className="bg-[#4551f7] h-32 rounded-t-2xl shadow" />
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-semibold text-blue-600 shadow-lg">
            {client.nombre_empresa?.[0] || "?"}
          </div>
        </div>
      </div>

      {/* Tarjeta de información */}
      <div className="w-full max-w-3xl mt-16 bg-white rounded-b-2xl shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {client.nombre_empresa}
          </h2>
          <p className="text-gray-500">{client.email}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-500">RIF</h3>
            <p className="text-base text-gray-800">{client.rif}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Teléfono</h3>
            <p className="text-base text-gray-800">{client.telefono}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Dirección</h3>
            <p className="text-base text-gray-800">{client.direccion}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Zona</h3>
            <p className="text-base text-gray-800">{client.zona}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Estado</h3>
            <p className="text-base text-gray-800">{client.estado}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Región</h3>
            <p className="text-base text-gray-800">{client.region}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Tipo de Contribuyente</h3>
            <p className="text-base text-gray-800">
              {client.tipo_contribuyente?.nombre}
            </p>
            <p className="text-sm text-gray-500 italic">
              {client.tipo_contribuyente?.descripcion}
            </p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Fecha de Registro</h3>
            <p className="text-base text-gray-800">
              {new Date(client.created_at).toLocaleDateString("es-VE")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
