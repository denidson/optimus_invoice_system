import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showClient, editClient, createClient } from '../../services/api_clients'; // Importa el servicio
import { getTypeTaxpayer } from '../../services/api_type_taxpayer'; // Importa el servicio
import { useNavigate } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { useLocation } from "react-router-dom"; // Para la obtener el parametro de la url
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones

function FormClients() {
  const navigate = useNavigate(); // Hook para redirección
  // Obtener los query parameters con `useLocation`
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get("id"); // Obtener el ID de la URL
  const [client, setClient] = useState(null);
  const [typeTaxpayer, setTypeTaxpayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Simulando la carga de datos del client por el ID
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const datattp = await getTypeTaxpayer();
        setTypeTaxpayer(datattp);
        if (clientId != null){
          const data = await showClient(decryptText(clientId)); // Llamamos a showClient con el ID
          setClient(data); // Guardamos los datos del client en el estado
        }else{
          setClient({
            id: "#",
            rif: "",
            nombre_empresa: "",
            telefono: "",
            direccion: "",
            tipo_contribuyente_id: 1,
          })
        }
      } catch (err) {
        setError('Error al cargar el cliente');
      } finally {
        setLoading(false); // Indicamos que la carga ha finalizado
      }
    };
    fetchClient();
  }, [clientId]); // Recarga si el `clientId` cambia

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí enviarías los datos de nuevo al backend para actualizar al client
    setButtonDisabled(true); // Iniciar carga (deshabilitar botón)
    console.log("Client:", client);
    try {
      var data;
      if (client.id == '#'){
        delete client.id;
        console.log("Client(F):", client);
        data = await createClient(client); // Llamamos a createClient con el ID
        console.log("Client(F)-data:", data);
      }else{
        data = await editClient(decryptText(clientId), client); // Llamamos a editClient con el ID
      }
      //console.log('editClient-data: ', data);
      setClient(data.cliente); // Guardamos los datos del client en el estado
      // Mostrar una notificación de éxito
      toast.success(data.mensaje, {
        onClose: () => {
          // Espera a que la notificación se cierre para redirigir
          setTimeout(() => {
            navigate("/clients");  // Redirige a la lista de clientes
          }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
        },
      });
    } catch (err) {
      setError('Error al cargar el cliente');
      // Mostrar una notificación de error
      toast.error("Error al actualizar el cliente");  // Notificación de error
    } finally {
      setLoading(false); // Indicamos que la carga ha finalizado
    }
  };

  const redirectToList = () => {
    navigate(`/clients`);
  };

  return (
    <div className="px-4 md:px-10 mx-auto w-full -m-24">
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            {/* Colocamos el contenedor de las notificaciones */}
            <ToastContainer />
            <div class="rounded-t bg-white mb-0 px-6 py-6">
              <div class="text-center flex justify-between">
                <h6 class="text-blueGray-700 text-xl font-bold">{client.id == '#'? "Crear" : "Actualizar"} Cliente</h6>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <h6 class="text-blueGray-400 text-sm mt-3 my-6 font-bold uppercase">Informacion del cliente</h6>
              <form onSubmit={handleSubmit}>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4 hidden">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Id</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.id}
                        onChange={(e) => setClient({ ...client, id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">RIF</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.rif}
                        onChange={(e) => setClient({ ...client, rif: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-10/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Razon Social</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.nombre_empresa}
                        onChange={(e) => setClient({ ...client, nombre_empresa: e.target.value })}
                      />
                      </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Telefono</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.telefono}
                        onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-10/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Direccion</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.direccion}
                        onChange={(e) => setClient({ ...client, direccion: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Tipo de contribuyente</label>
                      <select
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.tipo_contribuyente_id}
                        onChange={(e) => setClient({ ...client, tipo_contribuyente_id: e.target.value })}
                      >
                        {typeTaxpayer.length > 0 ? (
                            typeTaxpayer.map(taxpayer => (
                            <option key={taxpayer.id} value={taxpayer.id}>{taxpayer.nombre}</option>
                          ))
                        ) : (
                          <option value="0">Seleccione...</option>
                        )}
                      </select>
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
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={buttonDisabled} // Deshabilita el botón si `buttonDisabled` es `true`
                  style={{ opacity: buttonDisabled ? 0.5 : 1 }} // Cambiar la opacidad cuando está deshabilitado
                >
                  {buttonDisabled ? "Actualizando..." : client.id == '#'? "Guardar" : "Actualizar"} {/* Cambia el texto mientras está cargando */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormClients;