import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showCompanyUsers, editCompanyUsers, createCompanyUsers } from '../../services/apiCompanyUsers'; // Importa el servicio
import { useNavigate, useLocation } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import $ from "jquery";
import { validateFormatEmail } from "../../utils/formatters";
import { Autocomplete, TextField } from "@mui/material";
import { getClients, showClient } from '../../services/api_clients';

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
  const [clients, setClients] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [filterResultsAdmin, setFilterResultsAdmin] = useState([]);
  const authData = localStorage.getItem("authData");
  const rol = authData ? JSON.parse(authData)["rol"] : "";
  var authclientId;
  //console.log('rol: ', rol);
  if (authData) {
    authclientId = JSON.parse(authData)['cliente_id'];
  }

  // Simulando la carga de datos del companyUser por el ID
  useEffect(() => {
    const fetchCompanyUser = async () => {
      try {
        if (companyUserId != null){
          const data = await showCompanyUsers(decryptText(companyUserId)); 
          setCompanyUser(data); 
        }else{
          await setCompanyUser({
            id: "#",
            nombre: "",
            email: "",
            rol: "",
            cliente_id: '#',
            cliente_rif: '',
            cliente_nombre: '',
          })
        }
        if (rol == 'admin'){
          const dataclsAdmin = await getClients({ page: 1, per_page: 20, request_type: 'export' });
          setClients(dataclsAdmin.data);
        }
      } catch (err) {
        console.error('err: ', err);
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
    if ((companyUser.rol == 'operador' || companyUser.rol == 'operador_admin' || companyUser.rol == 'visor') && (companyUser.cliente_id == null || companyUser.cliente_id == '#')){//
      newErrors.cliente_id = "Cliente es obligatorio";
      errorToast.push("- Cliente es obligatorio");
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
    if (!validate()) return;
    setButtonDisabled(true); // Iniciar carga (deshabilitar botón)
    //console.log("Company User:", companyUser);
    try {
      var data;
      var message = '';
      if (companyUser.id == '#'){
        delete companyUser.id;
        //console.log("Company User(F): ", companyUser);
        if (rol == 'admin'){
          var cliente_id = companyUser.cliente_id;
          //console.log("Company cliente_id(F): ", cliente_id);
          if (companyUser.rol == 'admin' || companyUser.rol == 'auditor'){
            delete companyUser.cliente_id;
            delete companyUser.cliente_rif;
            delete companyUser.cliente_nombre;
            cliente_id = null;
          }
          //console.log("Company cliente_id(F): ", cliente_id);
          data = await createCompanyUsers(companyUser, cliente_id);
        }else{
          data = await createCompanyUsers(companyUser);
        }
        message = '!Creación de usuario de la empresa realizada correctamente!';
      }else{
        data = await editCompanyUsers(decryptText(companyUserId), companyUser); 
        message = '!Actualización de usuario de la empresa realizada correctamente!';
      }
      //setCompanyUser(data);
      //console.log('data: ', data);
      if (data.status != 201 && data.status != 200) {
        if (data.data?.error) {
          toast.error(data.data.error);
        } else {
          toast.error(`${data.status} - ${data.message}`);
        }
        setButtonDisabled(false);
        return;
      }else{
        toast.success(data.data.mensaje, {
          onClose: () => {
            // Espera a que la notificación se cierre para redirigir
            setTimeout(() => {
              navigate("/company-users");  // Redirige a la lista de usuarios de la empresa
            }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
          },
        });
      }
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

const handleSearchRif = (value, type) => {
  //console.log('handleSearchRif-value: ', value);
  //console.log('handleSearchRif-type: ', type);
  value = value.toUpperCase();

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
        value = companyUser.cliente_rif;
      }
    }
  }

  // Actualiza el campo
  setCompanyUser((prev) => ({ ...prev, cliente_rif: value }));

  if (value.length < 2) {
    if (type == 'admin'){
      setFilterResultsAdmin([]);
    }else{
      setFilterResults([]);
    }
    return;
  }
  var results;
  if (type == 'admin'){
    //console.log('clients: ', clients);
    results = clients.filter((c) =>
      c.rif.toUpperCase().includes(value) ||
      c.nombre_empresa.toUpperCase().includes(value)
    );
  }else{
    //console.log('endClients: ', endClients);
    results = endClients.filter((c) =>
      c.rif.toUpperCase().includes(value) ||
      c.nombre.toUpperCase().includes(value)
    );
  }
  //console.log('handleSearchRif-results.length: ', results.length);
  if (results.length == 0){
    $('#div_none_endclients').attr('style', "width: 600px;");
    $('.form-client-complement').addClass('mt-10');
    setCompanyUser((prev) => ({
    ...prev,
      cliente_final_id: '#',
      //cliente_final_rif: '',
      cliente_nombre: '',
    }));

  }else{
    $('#div_none_endclients').removeAttr('style');
    $('.form-client-complement').removeClass('mt-10');
  }
  setFilterResultsAdmin(results);
  setShowResults(true);
};

const selectClient = async (client, type) => {
  setCompanyUser((prev) => ({
    ...prev,
    cliente_id: client.id || '#',
    cliente_rif: client.rif || '',
    cliente_nombre: client.nombre_empresa || '',
  }));
  setFilterResultsAdmin([]);
  setShowResults(false);
};

const reduceRif = (rif, type) => {
  setCompanyUser((prev) => ({
    ...prev,
    cliente_final_rif: rif || '',
  }));
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
                  {(rol == 'admin') && (
                    <div className="relative lg:w-3/12 mb-3 mx-3">
                        <label className="block text-blueGray-600 text-xs font-bold mb-2">Empresa Afiliada (RIF)</label>
                        <input
                          type="text"
                          className="hidden border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={companyUser.cliente_id}
                          placeholder="J-12345678-0"
                          onChange={(e) => setCompanyUser({ ...companyUser, cliente_id: e.target.value })}
                        />
                        <div className="relative">
                          <Autocomplete
                              freeSolo
                              options={
                                showResults && companyUser.cliente_rif !== ''
                                  ? filterResultsAdmin ?? []
                                  : clients ?? []}
                              getOptionLabel={(opt) =>
                                opt?.rif ? `${opt.rif} — ${opt.nombre_empresa}` : ""
                              }
                              filterOptions={(options) => options} // usamos tu propio filtro manual
                              value={null}
                              disabled={(companyUser.rol == 'admin' || companyUser.rol == 'auditor') ? true : false}
                              inputValue={companyUser.cliente_rif || ""}
                              onInputChange={(e) => {
                                let value = e.target.value?.toString().toUpperCase();
                                if (value == undefined){
                                  value = '';
                                }
                                // Elimina caracteres no válidos (solo letras, números y guiones)
                                value = value.replace(/[^A-Z0-9-]/g, "");

                                // Forzar el patrón paso a paso
                                if (value.length === 1) {
                                  // Primera posición → solo letras válidas
                                  if (!/[VJEPG123456789]/.test(value)) value = "";
                                } else if (value.length === 2) {
                                    // Solo agregar guion si comienza con letra válida
                                    if (/[VJEPG]/.test(value[0]) && /[1234567890]/.test(value[1]) && !value.includes("-")) {
                                      if (/[VJEPG1234567890-]/.test(value[1])){
                                        value = value[0] + "-" + value[1];
                                      }else{
                                        value = value[0];
                                      }
                                    }else if (!/[1234567890]/.test(value)) {
                                      value = value[0];
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
                                      value = companyUser.cliente_rif;
                                    }
                                  }
                                }

                                handleSearchRif(value, 'admin')
                              }}
                              onChange={(event, newValue) => {
                                if (newValue) selectClient(newValue, 'admin');
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="V-12345678-0"
                                  placeholder="V-12345678-0"
                                  variant="outlined"
                                  size="small"
                                  onKeyDown={(e) => {
                                    // Si el usuario presiona Backspace
                                    if (e.key === "Backspace") {
                                      if (companyUser.cliente_rif.substr(companyUser.cliente_rif.length - 1, companyUser.cliente_rif.length) == '-'){
                                        reduceRif(companyUser.cliente_rif.substr(0, companyUser.cliente_rif.length - 1), 'admin');
                                      }
                                    }
                                    // ENTER para seleccionar primer elemento si no se ha elegido uno
                                    if (e.key === "Enter") {
                                      if (filterResultsAdmin.length > 0) {
                                        e.preventDefault();
                                        selectClient(filterResultsAdmin[0], 'admin');
                                      }
                                    }
                                  }}
                                />
                              )}
                            />
                        </div>
                        {errors.cliente_id && <p className="text-red-500 text-xs mt-1">{errors.cliente_id}</p>}
                    </div>
                  )}
                  {(rol == 'admin') && (
                    <div className="w-full lg:w-8/12 px-1">
                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-xs font-bold mb-2">Razon Social</label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={companyUser.cliente_nombre} readonly="readonly"
                          placeholder="Nombre de la empresa afiliada"
                          onChange={(e) => setCompanyUser({ ...companyUser, cliente_nombre: e.target.value.toString().toUpperCase() })}
                        />
                      </div>
                    </div>
                  )}
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
                        placeholder="Nombre del usuario"
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
                        placeholder="correo@correo.com"
                        onChange={(e) => setCompanyUser({ ...companyUser, email: e.target.value.toUpperCase() })}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Rol</label>
                      <select
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={companyUser.rol}
                        onChange={(e) => {
                          const nuevoRol = e.target.value;
                          if (nuevoRol === 'admin' || nuevoRol === 'auditor') {
                            setCompanyUser({
                              ...companyUser,
                              rol: nuevoRol,
                              cliente_id: null,
                              cliente_rif: '',
                              cliente_nombre: ''
                            });
                          } else {
                            setCompanyUser({
                              ...companyUser,
                              rol: nuevoRol
                            });
                          }
                        }}>
                        <option value="#">Seleccione...</option>
                        <option value="operador">Operador</option>
                        <option value="operador_admin">Operador Admin</option>
                        <option value="visor">Visor</option>
                        {/*<option value="admin">Administrador</option>*/}
                        <option value="auditor">Auditor</option>
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