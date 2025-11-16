import React, { useState, useEffect } from "react"; 
import { editClient } from '../../services/api_clients';
import { changePassword } from "../../services/apiProfile"; 
import { getTypeTaxpayer } from '../../services/api_type_taxpayer';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfileContent({ client: initialClient, profile: initialProfile }) {

  const isClient = !!initialClient;
  const [data, setData] = useState(initialClient || initialProfile);

  const [typeTaxpayer, setTypeTaxpayer] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados Modal Cambio de Contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Cargar tipos de contribuyente solo si es cliente
  useEffect(() => {
    if (!isClient) return;

    const fetchTypeTaxpayer = async () => {
      try {
        const data = await getTypeTaxpayer();
        setTypeTaxpayer(data);
      } catch (err) {
        console.error("Error al cargar tipos de contribuyente", err);
      }
    };
    fetchTypeTaxpayer();
  }, [isClient]);

  // Guardar cambios del perfil cliente
  const handleSave = async () => {
    if (!isClient) return;

    setLoading(true);
    try {
      const updatedClient = await editClient(data.id, data);
      setData(updatedClient);
      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err) {
      toast.error("Error al actualizar el perfil");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    try {
      setLoading(true);

      await changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });

      toast.success("Contraseña cambiada con éxito");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <ToastContainer />

      {/* --- ENCABEZADO --- */}
      <div className="relative w-full max-w-3xl">
        <div className="bg-[#4551f7] h-32 rounded-t-2xl shadow" />
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-semibold text-blue-600 shadow-lg">
            {data.nombre_empresa?.[0] || data.nombre?.[0] || "?"}
          </div>
        </div>
      </div>

      {/* --- TARJETA PRINCIPAL --- */}
      <div className="w-full max-w-3xl mt-16 bg-white rounded-b-2xl shadow-md p-6">

        {/* NOMBRE + EMAIL */}
        <div className="text-center mb-6">
          {isEditing && isClient ? (
            <>
              <input
                type="text"
                value={data.nombre_empresa}
                onChange={(e) => setData({ ...data, nombre_empresa: e.target.value })}
                className="border px-2 py-1 rounded text-center text-xl font-semibold"
              />
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="border px-2 py-1 rounded text-center text-gray-500 mt-2"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800">
                {data.nombre_empresa || data.nombre}
              </h2>
              <p className="text-gray-500">{data.email}</p>

              {!isClient && (
                <p className="text-gray-500 mt-1 font-semibold">
                  Rol: {data.rol}
                </p>
              )}
            </>
          )}
        </div>

        {/* --- CAMPOS SOLO CLIENTES --- */}
        {isClient && (
          <div className="grid sm:grid-cols-2 gap-4">

            {["rif", "telefono", "direccion", "zona", "estado", "region"].map((field) => (
              <div key={field}>
                <h3 className="text-sm text-gray-500">{field.toUpperCase()}</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={data[field] || ""}
                    onChange={(e) => setData({ ...data, [field]: e.target.value })}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  <p className="text-base text-gray-800">{data[field] || "—"}</p>
                )}
              </div>
            ))}

            {/* Tipo contribuyente */}
            <div>
              <h3 className="text-sm text-gray-500">Tipo de Contribuyente</h3>
              {isEditing ? (
                <select
                  value={data.tipo_contribuyente_id || ""}
                  onChange={(e) =>
                    setData({ ...data, tipo_contribuyente_id: parseInt(e.target.value) })
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
                <p className="text-base text-gray-800">
                  {data.tipo_contribuyente?.nombre || "—"}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Fecha de Registro</h3>
              <p className="text-base text-gray-800">
                {new Date(data.created_at).toLocaleDateString("es-VE")}
              </p>
            </div>
          </div>
        )}

        {/* --- BOTONES --- */}
        <div className="mt-6 flex justify-center gap-4">

          {/* Edición solo si es cliente */}
          {isClient ? (
            isEditing ? (
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
            )
          ) : (
            <p className="text-gray-500 text-sm italic">
              Este perfil no es editable.
            </p>
          )}

          {/* Cambiar contraseña solo si NO es cliente */}
          {(
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowPasswordModal(true)}
            >
              Cambiar Contraseña
            </button>
          )}
        </div>
      </div>

      {/* --- MODAL CAMBIO DE CONTRASEÑA --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4 text-center">Cambiar Contraseña</h3>

            <label className="text-sm">Contraseña Actual</label>
            <input
              type="password"
              className="border w-full px-2 py-1 rounded mb-3"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <label className="text-sm">Nueva Contraseña</label>
            <input
              type="password"
              className="border w-full px-2 py-1 rounded mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="text-sm">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="border w-full px-2 py-1 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex justify-end mt-4 gap-2">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Cambiar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
