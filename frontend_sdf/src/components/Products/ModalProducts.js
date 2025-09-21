import React from "react";

function ModalProducts({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="z-50">
        <div className="flex flex-col h-full">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center pb-4">
                <h6 className="text-blueGray-700 text-xl font-bold">Detalles del Producto</h6>
              </div>

              <hr className="my-6 border-b-1 border-blueGray-300" />

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

              <hr className="my-6 border-b-1 border-blueGray-300" />

              <div className="text-center">
                <button
                  className="bg-slate-800 text-white px-4 py-2 rounded"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
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
