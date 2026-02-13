import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showCompanyUsers, editCompanyUsers, createCompanyUsers } from '../../services/apiCompanyUsers'; // Importa el servicio
import { useNavigate, useLocation } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import $ from "jquery";
import { validateFormatEmail } from "../../utils/formatters";

function FormCompanyUsers() {
  const navigate = useNavigate(); // Hook para redirección
  // Obtener los query parameters con `useLocation`
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyUserId = queryParams.get("id"); // Obtener el ID de la URL
  const [companyUser, setCompanyUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para errores de validación

  // Simulando la carga de datos del companyUser por el ID
  useEffect(() => {
    const fetchCompanyUser = async () => {
      try {
        if (companyUserId != null){
          const data = await showCompanyUsers(decryptText(companyUserId)); 
          setCompanyUser(data); 
        }else{
          setCompanyUser({
            id: "#",
            nombre: "",
            email: "",
            rol: "",
          })
        }
      } catch (err) {
        setError('Error al cargar el usuario de la empresa');
      } finally {
        setLoading(false); // Indicamos que la carga ha finalizado
      }
    };
    fetchCompanyUser();
  }, [companyUserId]); // Recarga si el `companyUserId` cambia

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const validate = () => {
    const newErrors = {};
    var errorToast = [];
    if (!companyUser.nombre){
      newErrors.nombre = "Nombre es obligatoria";
      errorToast.push("- Nombre es obligatoria");
    }
    if (!companyUser.email){
      newErrors.email = "Correo electrónico es obligatorio";
      errorToast.push("- Correo electrónico es obligatorio");
    }
    if (companyUser.email){
      if (!validateFormatEmail(companyUser.email)){
        newErrors.email = "Correo electrónico no presenta un formato válido";
        errorToast.push("- Correo electrónico no presenta un formato válido");
      }
    }
    if (!companyUser.rol || companyUser.rol == '#'){
      newErrors.rol = "Rol es obligatorio";
      errorToast.push("- Rol es obligatorio");
    }
    setErrors(newErrors);
    if (errorToast.length > 0){
      toast.error(<div>
        {errorToast.map(item => (
            <span className="text-start">{item}<br/></span>
          ))}
      </div>)
      setButtonDisabled(false);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí enviarías los datos de nuevo al backend para actualizar al companyUser
    setButtonDisabled(true); // Iniciar carga (deshabilitar botón)
    if (!validate()) return;
    console.log("Company User:", companyUser);
    try {
      var data;
      var message = '';
      if (companyUser.id == '#'){
        delete companyUser.id;
        console.log("Company User(F): ", companyUser);
        data = await createCompanyUsers(companyUser);
        message = '!Creación de usuario de la empresa realizada correctamente!';
      }else{
        data = await editCompanyUsers(decryptText(companyUserId), companyUser); 
        message = '!Actualización de usuario de la empresa realizada correctamente!';
      }
      setCompanyUser(data);
      toast.success(message, {
        onClose: () => {
          // Espera a que la notificación se cierre para redirigir
          setTimeout(() => {
            navigate("/company-users");  // Redirige a la lista de usuarios de la empresa
          }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
        },
      });
    } catch (err) {
      setError('Error al cargar el usuario de la empresa');
      // Mostrar una notificación de error
      toast.error("Error al actualizar el usuario de la empresa");  // Notificación de error
    } finally {
      setLoading(false); // Indicamos que la carga ha finalizado
    }
  };

  const redirectToList = () => {
    navigate(`/company-users`);
  };

  return (
    <div className="mx-auto w-full">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12">
          <div className="relative bg-white flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Header */}
            <div class="rounded-t bg-white mb-0 px-6 py-6">
              <div class="text-center flex justify-between">
                <h6 class="text-blueGray-700 text-xl font-bold">{companyUser.id == '#'? "Crear" : "Actualizar"} Usuario de la Empresa</h6>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <h6 class="text-blueGray-400 text-sm mt-3 my-6 font-bold uppercase">Informacion del usuario de la empresa</h6>
              <form onSubmit={handleSubmit}>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4 hidden">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Id</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={companyUser.id}
                        onChange={(e) => setCompanyUser({ ...companyUser, id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-10/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Nombre</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={companyUser.nombre}
                        onChange={(e) => setCompanyUser({ ...companyUser, nombre: e.target.value.toUpperCase() })}
                      />
                      {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                      </div>
                  </div>
                  <div className="w-full lg:w-5/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Correo Electronico</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={companyUser.email}
                        onChange={(e) => setCompanyUser({ ...companyUser, email: e.target.value.toUpperCase() })}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Rol</label>
                      <select id="select_state"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={companyUser.rol} onChange={(e) => setCompanyUser({ ...companyUser, rol: e.target.value })}>
                        <option value="#">Seleccione...</option>
                        <option value="operador">Operador</option>
                        <option value="operador_admin">Operador Admin</option>
                        <option value="visor">Visor</option>
                      </select>
                      {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
                    </div>
                  </div>
                  
                </div>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <button className="bg-slate-800 text-white px-4 py-2 rounded me-3"
                  disabled={buttonDisabled} // Deshabilita el botón si `buttonDisabled` es `true`
                  style={{ opacity: buttonDisabled ? 0.5 : 1 }} // Cambiar la opacidad cuando está deshabilitado
                  onClick={() => redirectToList()}>Cancelar</button>
                <button
                  type="submit"
                  className="bg-twilight-indigo-600 text-white px-4 py-2 rounded"
                  disabled={buttonDisabled} // Deshabilita el botón si `buttonDisabled` es `true`
                  style={{ opacity: buttonDisabled ? 0.5 : 1 }} // Cambiar la opacidad cuando está deshabilitado
                >
                  {buttonDisabled ? "Actualizando..." : companyUser.id == '#'? "Guardar" : "Actualizar"} {/* Cambia el texto mientras está cargando */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormCompanyUsers;