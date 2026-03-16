import React from "react";
import { formatMoney, formatDate, formatDateTime, formatText } from "../../utils/formatters";

function ModalCompanyUsers({ isOpen, onClose, companyUser }) {
  if (!isOpen || !companyUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <h3 className=" font-bold text-center">
            Detalles de Usuario
          </h3>
        </div>

        {/* contenido scroll */}
        <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">
          <div className="px-5 text-start space-y-2">
            <p><strong>Fecha de creación:</strong> {formatDateTime(companyUser.created_at)}</p>
            <p><strong>Nombre:</strong> {formatText(companyUser.nombre)}</p>
            <p><strong>Correo electrónico:</strong> {formatText(companyUser.email)}</p>
            <p><strong>Cambio de contraseña:</strong> {companyUser.must_change_password ? "SI" : "NO"}</p>
            <p><strong>Rol: </strong>
              {companyUser.rol == 'operador' ?
              `${formatText('Operador')}`
                  : companyUser.rol == 'operador_admin' ?
                    formatText('Operador Admin') : formatText('Visor')}
            </p>
          </div>
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

// Estilos
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  width: "70%",
  maxHeight: "90%",
  overflowY: "auto",
};

export default ModalCompanyUsers;
