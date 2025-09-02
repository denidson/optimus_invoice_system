import React, { useState } from "react";

function ModalConfirmation({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null; // Si la modal no está abierta, no renderiza nada

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>{message || "¿Estás seguro de que deseas continuar?"}</h3> {/* Usamos el mensaje que recibe como prop */}
        <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-3 me-3 ms-3" onClick={onConfirm}>Confirmar</button>
          <button className="bg-slate-800 text-white px-4 py-2 rounded mt-3 me-3 ms-3" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// Estilos para la modal
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
};

export default ModalConfirmation;