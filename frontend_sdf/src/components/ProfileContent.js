import React, { useState, useEffect } from "react";
import { editClient } from '../services/api_clients';
import { getTypeTaxpayer } from '../services/api_type_taxpayer';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfileContent({ client: initialClient }) {
  const [client, setClient] = useState(initialClient);
  const [typeTaxpayer, setTypeTaxpayer] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Traer lista de tipos de contribuyente
  useEffect(() => {
    const fetchTypeTaxpayer = async () => {
      try {
        const data = await getTypeTaxpayer();
        setTypeTaxpayer(data);
      } catch (err) {
        console.error("Error al cargar tipos de contribuyente", err);
      }
    };
    fetchTypeTaxpayer();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedClient = await editClient(client.id, client);
      setClient(updatedClient);
      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err) {
      toast.error("Error al actualizar el perfil");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <ToastContainer />
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
          {isEditing ? (
            <>
              <input
                type="text"
                value={client.nombre_empresa}
                onChange={(e) => setClient({ ...client, nombre_empresa: e.target.value })}
                className="border px-2 py-1 rounded text-center text-xl font-semibold"
              />
              <input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className="border px-2 py-1 rounded text-center text-gray-500 mt-2"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800">{client.nombre_empresa}</h2>
              <p className="text-gray-500">{client.email}</p>
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {["rif", "telefono", "direccion", "zona", "estado", "region"].map((field) => (
            <div key={field}>
              <h3 className="text-sm text-gray-500">{field.toUpperCase()}</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={client[field] || ""}
                  onChange={(e) => setClient({ ...client, [field]: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <p className="text-base text-gray-800">{client[field]}</p>
              )}
            </div>
          ))}

          {/* Select tipo de contribuyente */}
          <div>
            <h3 className="text-sm text-gray-500">Tipo de Contribuyente</h3>
            {isEditing ? (
              <select
                value={client.tipo_contribuyente_id || ""}
                onChange={(e) =>
                  setClient({ ...client, tipo_contribuyente_id: parseInt(e.target.value) })
                }
                className="border px-2 py-1 rounded w-full"
              >
                <option value="">Seleccione...</option>
                {typeTaxpayer.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {tt.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base text-gray-800">{client.tipo_contribuyente?.nombre}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Fecha de Registro</h3>
            <p className="text-base text-gray-800">
              {new Date(client.created_at).toLocaleDateString("es-VE")}
            </p>
          </div>
        </div>

        {/* Botones Editar / Guardar */}
        <div className="mt-6 flex justify-center gap-4">
          {isEditing ? (
            <>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <button
              className="bg-sky-500 text-white px-4 py-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
