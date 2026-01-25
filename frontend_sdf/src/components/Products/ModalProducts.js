import React from "react";

function ModalProducts({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[75%] h-[90%] rounded-lg shadow-xl overflow-hidden relative">

        {/* header */}
        <div className="bg-white p-6 border-b">
          <h3 className=" font-bold text-center">
            Detalles del Producto
          </h3>
        </div>

        {/* contenido scroll */}
        <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">
          <div className="px-5 text-start space-y-2">
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Nombre:</strong> {product.nombre}</p>
            <p><strong>Precio Base:</strong> {product.precio_base}</p>
            <p><strong>Activo:</strong> {product.activo ? "Sí" : "No"}</p>
            <p><strong>Descripción:</strong> {product.descripcion || "N/A"}</p>
            <p>
              <strong>IVA:</strong>{" "}
              {product.iva_categoria
                ? `${product.iva_categoria.nombre}`
                : "N/A"}
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

export default ModalProducts;
