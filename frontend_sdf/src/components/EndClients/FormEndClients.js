import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showEndClient, editEndClient, createEndClient } from '../../services/api_end_clients'; // Importa el servicio
import { getTypeTaxpayer } from '../../services/api_type_taxpayer'; // Importa el servicio
import { useNavigate } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { useLocation } from "react-router-dom"; // Para la obtener el parametro de la url
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import $ from "jquery";

function FormEndClients() {
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
        //console.log('datattp: ', datattp);
        setTypeTaxpayer(datattp);
        if (clientId != null){
          const data = await showEndClient(decryptText(clientId)); // Llamamos a showClient con el ID
          //console.log('data: ', data);
          setClient(data); // Guardamos los datos del client en el estado
        }else{
          setClient({
            id: "#",
            rif: "",
            nombre: "",
            telefono: "",
            email: "",
            direccion: "",
            activo: true,
            //tipo_contribuyente_id: 1,
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
      var message = '';
      if (client.id == '#'){
        delete client.id;
        console.log("Client(F): ", client);
        data = await createEndClient(client);
        //var clientList = [client];
        //console.log("clientList(F): ", clientList);
        //data = await createEndClient(clientList); // Llamamos a createClient con el ID
        //console.log("Client(F)-data: ", data);
        message = '!Creación de cliente realizada correctamente!';
      }else{
        data = await editEndClient(decryptText(clientId), client); // Llamamos a editClient con el ID
        //console.log("Client(F)-editClient-data: ", data);
        //console.log("Client(F)-editClient-client: ", client);
        message = '!Actualización de cliente realizada correctamente!';
      }
      //console.log('editClient-data: ', data);
      setClient(data); // Guardamos los datos del client en el estado
      // Mostrar una notificación de éxito
      toast.success(message, {
        onClose: () => {
          // Espera a que la notificación se cierre para redirigir
          setTimeout(() => {
            navigate("/endClients");  // Redirige a la lista de clientes
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

  const reduceRif = (rif) => {
    setClient((prev) => ({
      ...prev,
      rif: rif || '',
    }));
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
                        value={client.rif} placeholder="V-12345678-9" onChange={(e) => {
                          let value = e.target.value.toUpperCase();

                          // Elimina caracteres no válidos (solo letras, números y guiones)
                          value = value.replace(/[^A-Z0-9-]/g, "");

                          // Forzar el patrón paso a paso
                          if (value.length === 1) {
                            // Primera posición → solo letras válidas
                            if (!/[VJEPG123456789]/.test(value)) value = "";
                          } else if (value.length === 2) {
                              // Solo agregar guion si comienza con letra válida
                              if (/[VJEPG]/.test(value[0]) && !value.includes("-")) {
                                value = value[0] + "-" + value[1];
                              }
                            } else if (value.length > 2) {
                            // Nuevo: permitir solo números (hasta 8)
                            const matchSoloNumeros = value.match(/^\d{0,8}$/);

                            if (matchSoloNumeros) {
                              value = matchSoloNumeros[0];
                            } else {
                              // Caso RIF tradicional
                              const match = value.match(/^([VJEPG])-(\d{0,8})-?(\d{0,1})?$/);

                              if (match) {
                                const [, letra, numeros, verificador] = match;
                                value = `${letra}-${numeros}${numeros.length === 8 ? "-" : ""}${verificador || ""}`;
                              } else {
                                value = client.rif;
                              }
                            }
                          }

                          setClient({ ...client, rif: value });
                        }}
                        onKeyDown={(e) => {
                          // Si el usuario presiona Backspace
                          if (e.key === "Backspace") {
                            if (client.rif.substr(client.rif.length - 1, client.rif.length) == '-'){
                              reduceRif(client.rif.substr(0, client.rif.length - 1));
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-10/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Razon Social</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.nombre}
                        onChange={(e) => setClient({ ...client, nombre: e.target.value.toUpperCase() })}
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
                  <div className="w-full lg:w-5/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Correo Electronico</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.email}
                        onChange={(e) => setClient({ ...client, email: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                  {/*<div className="w-full lg:w-2/12 px-4">
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
                  </div>*/}
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Direccion</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.direccion}
                        onChange={(e) => setClient({ ...client, direccion: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                  {/*<div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Región</label>
                      <select
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.region} onChange={(e) => {
                          const selectedOption = e.target.options[e.target.selectedIndex];
                          const regionId = selectedOption.getAttribute("region_id"); // obtienes el atributo
                          const regionValue = e.target.value; // obtienes el value normal
                          console.log("region_id:", regionId);
                          console.log("region value:", regionValue);
                          $('.region_id').addClass('hidden');
                          $('.region_' + regionId.toString()).removeClass('hidden');
                          client.estado = '#';
                          // actualizamos el estado con ambos si quieres
                          setClient({ ...client, region: e.target.value });
                        }}>
                        <option value="#">Seleccione...</option>
                        <option region_id="1" value="Central">Central</option>
                        <option region_id="2" value="Capital">Capital</option>
                        <option region_id="3" value="Occidental">Occidental</option>
                        <option region_id="4" value="Guayana">Guayana</option>
                        <option region_id="5" value="Insular">Insular</option>
                        <option region_id="6" value="Los Andes">Los Andes</option>
                        <option region_id="7" value="Los Llanos">Los Llanos</option>
                        <option region_id="8" value="Oriental">Oriental</option>
                        <option region_id="9" value="Zuliana">Zuliana</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Estado</label>
                      <select id="select_state"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.estado} onChange={(e) => setClient({ ...client, estado: e.target.value })}>
                        <option value="#">Seleccione...</option>
                        <option class="region_id region_1" value="Aragua">Aragua</option>
                        <option class="region_id region_1" value="Carabobo">Carabobo</option>
                        <option class="region_id region_1" value="Cojedes">Cojedes</option>
                        <option class="region_id region_2" value="Distrito Capital">Distrito Capital</option>
                        <option class="region_id region_2" value="Miranda">Miranda</option>
                        <option class="region_id region_2" value="La Guaira">La Guaira</option>
                        <option class="region_id region_3" value="Falcón">Falcón</option>
                        <option class="region_id region_3" value="Lara">Lara</option>
                        <option class="region_id region_3" value="Portuguesa">Portuguesa</option>
                        <option class="region_id region_3" value="Yaracuy">Yaracuy</option>
                        <option class="region_id region_4" value="Amazonas">Amazonas</option>
                        <option class="region_id region_4" value="Bolívar">Bolívar</option>
                        <option class="region_id region_4" value="Delta Amacuro">Delta Amacuro</option>
                        <option class="region_id region_4" value="Guayana Esequiba">Guayana Esequiba</option>
                        <option class="region_id region_5" value="Dependencias Federales">Dependencias Federales</option>
                        <option class="region_id region_5" value="Nueva Esparta">Nueva Esparta</option>
                        <option class="region_id region_6" value="Barinas">Barinas</option>
                        <option class="region_id region_6" value="Mérida">Mérida</option>
                        <option class="region_id region_6" value="Táchira">Táchira</option>
                        <option class="region_id region_6" value="Trujillo">Trujillo</option>
                        <option class="region_id region_6" value="Apure - Municipio Páez">Apure - Municipio Páez</option>
                        <option class="region_id region_7" value="Apure - Sin el Municipio Páez">Apure - Sin el Municipio Páez</option>
                        <option class="region_id region_7" value="Guárico">Guárico</option>
                        <option class="region_id region_8" value="Anzoátegui">Anzoátegui</option>
                        <option class="region_id region_8" value="Monagas">Monagas</option>
                        <option class="region_id region_8" value="Sucre">Sucre</option>
                        <option class="region_id region_9" value="Zulia">Zulia</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Zona</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={client.zona}
                        onChange={(e) => setClient({ ...client, zona: e.target.value })}
                      />
                    </div>
                  </div>*/}
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-4">Condición</label>
                      {(client.activo == true) ? (
                        <label class="bg-emerald-400 text-white py-1 px-3 rounded-full text-center">Activo</label>
                      ):(
                        <label class="bg-red-400 text-white py-1 px-3 rounded-full text-center">Inactivo</label>
                      )}
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

export default FormEndClients;