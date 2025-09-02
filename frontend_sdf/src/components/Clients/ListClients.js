import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // Para la redirección
import { getClients, deleteClient } from '../../services/api_clients'; // Importa el servicio
import { getTypeTaxpayer } from '../../services/api_type_taxpayer'; // Importa el servicio
import ReactPaginate from 'react-paginate';
import { encryptText, decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import ModalConfirmation from "../Modals/ModalConfirmation";
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones

function CardTable() {
  const navigate = useNavigate(); // Hook para redirección
  const [clients, setClients] = useState([]); // Estado para almacenar los clientes
  const [typeTaxpayer, setTypeTaxpayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [currentPage, setCurrentPage] = useState(0); // Página actual
  const clientsPerPage = 2; // Número de clientes por página
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad de la modal
  const [clientIdToDeactivate, setClientIdToDeactivate] = useState(null); // Estado para almacenar el ID del cliente a desactivar

  // Cargar los clientes al inicio
  useEffect(() => {
    // Llamamos a la función del servicio REST para obtener los clientes
    const fetchClients = async () => {
      try {
        const datattp = await getTypeTaxpayer();
        setTypeTaxpayer(datattp);
        const data = await getClients();
        setClients(data); // Actualizamos el estado con los clientes obtenidos
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      }
    };
    fetchClients();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para redirigir a la vista de edición
  const redirectToEdit = (id) => {
    const hash = encryptText(id.toString()); // Crea el hash
    navigate(`/clients/edit?id=${encodeURIComponent(hash)}`);
  };

  const redirectToCreate = () => {
    navigate(`/clients/create`);
  };

  // Filtrar clientes según el término de búsqueda
  const filteredClients = clients.filter(client =>
    client.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefono.includes(searchTerm)
  );

  // Calcular el índice de los clientes a mostrar en la página actual
  const indexOfLastClient = (currentPage + 1) * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  // Cambiar la página actual
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAction = async (id) => {
    // Función que maneja la desactivación del cliente
    try{
        var data = await deleteClient(id); // Llamamos a createClient con el ID
        toast.success(data.mensaje, {
          onClose: () => {
            // Espera a que la notificación se cierre para redirigir
            setTimeout(() => {
              // Aquí refrescas los clientes después de la acción exitosa
              refreshClients(); // Llamamos a refreshClients para obtener la lista actualizada
            }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
          },
        });
    } catch (err) {
      // Mostrar una notificación de error
      toast.error("Error al actualizar el cliente");
    } finally {
      // Indicamos que la carga ha finalizado
    }
    // Lógica para desactivar al cliente
  };

  const refreshClients = async () => {
  // Llamamos a la función del servicio REST para obtener los clientes
  try {
    const data = await getClients();
    setClients(data); // Actualizamos el estado con los clientes obtenidos
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
  }
};

  const handleConfirm = () => {
    console.log("deleteClient-clientIdToDeactivate: ", clientIdToDeactivate);
    if (clientIdToDeactivate) {
      // Confirma la desactivación y ejecuta la acción
      handleAction(clientIdToDeactivate.id); // Llamamos a handleAction con el id del cliente
      setModalOpen(false); // Cierra la modal después de la confirmación
    }
  };

  const handleOpenModal = (id, nombre_empresa) => {
    setClientIdToDeactivate({'id': id, 'nombre_empresa': nombre_empresa});
    setModalOpen(true); // Abre la modal de confirmación
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Cierra la modal
  };

  return (
    <div className="px-4 md:px-10 mx-auto w-full -m-24">
      {/* Colocamos el contenedor de las notificaciones */}
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div class="rounded-t bg-white mb-0 px-6 py-6">
              <div class="text-center flex justify-between">
                <h6 class="text-blueGray-700 text-xl font-bold">Lista de Clientes</h6>
              </div>
            </div>
            <div className="block overflow-x-auto px-4 pt-4 pb-0">
              {/* Campo de búsqueda */}
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 mb-4 w-1/4 max-w-xs rounded-md"/>
              <button className="bg-blue-500 text-white px-4 py-2 rounded me-3 ms-3"
                  onClick={() => redirectToCreate()}>Crear</button>
            </div>
            <div className="block overflow-x-auto p-4">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                      RIF
                    </th>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                      Razon Social
                    </th>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                      Telefono
                    </th>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                      Direccion
                    </th>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                      Tipo de contribuyente
                    </th>
                    <th className="border border-solid border-l-0 border-r-0 px-6 py-3 text-xs font-semibold text-left text-blueGray-500 uppercase bg-blueGray-50 border-b border-blueGray-100">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentClients.length > 0 ? (
                    currentClients.map(client => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 text-sm font-semibold text-blueGray-700 align-middle border-t-0 whitespace-nowrap">
                          {client.rif}
                        </td>
                        <td className="px-6 py-4 text-sm text-blueGray-500 align-middle border-t-0 whitespace-nowrap">
                          {client.nombre_empresa}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blueGray-500 align-middle border-t-0 whitespace-nowrap">
                          {client.telefono}
                        </td>
                        <td className="px-6 py-4 text-sm text-blueGray-500 align-middle border-t-0 whitespace-nowrap">
                          {client.direccion}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blueGray-500 align-middle border-t-0 whitespace-nowrap">
                          {client.tipo_contribuyente_id}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blueGray-500 align-middle border-t-0 whitespace-nowrap">
                          {/* Tooltip y Icono de edición */}
                          <button className="px-4 py-1 mx-3" onClick={() => redirectToEdit(client.id)}><i class="fa-solid fa-lg fa-pen-to-square"></i></button>
                          <button className="px-4 py-1 mx-3" onClick={() => handleOpenModal(client.id, client.nombre_empresa)}><i class="fa-solid fa-lg fa-trash"></i></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No hay clientes disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-4 py-2 mx-2 text-white bg-blue-500 rounded-md"
                  disabled={currentPage === 0}>
                  Anterior
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className="px-4 py-2 mx-2 text-white bg-blue-500 rounded-md"
                  disabled={currentPage * clientsPerPage >= filteredClients.length}>
                  Siguiente
                </button>
              </div>
              {/* Modal de confirmación */}
              <ModalConfirmation
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirm}
                message={'¿Estás seguro de que deseas desactivar al cliente '+ (clientIdToDeactivate ? clientIdToDeactivate.nombre_empresa : '') +'?'} // Pasamos el mensaje personalizado
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardTable;
