import React from "react";

function ModalProducts({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null; // Si la modal no está abierta o no hay producto, no renderiza nada

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="z-50">
        <div className="flex flex-wrap h-full">
          <div className="w-full lg:w-12/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-center pb-4">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    Detalles del Producto
                  </h6>
                </div>

                <hr className="my-6 border-b-1 border-blueGray-300"/>

                <div className="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">
                      SKU:
                    </label>
                    <span className="text-blueGray-700">{product.sku}</span>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">
                      Nombre:
                    </label>
                    <span className="text-blueGray-700">{product.nombre}</span>
                  </div>
                </div>

                <hr className="mx-3 my-6 border-b-1 border-blueGray-300"/>

                <div className="px-5 text-center flex justify-between">
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">
                      Precio Base:
                    </label>
                    <span className="text-blueGray-700">{product.precio_base}</span>
                  </div>
                  <div className="lg:w-6/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">
                      Activo:
                    </label>
                    <span className="text-blueGray-700">
                      {product.activo ? "Sí" : "No"}
                    </span>
                  </div>
                </div>

                <hr className="mx-3 my-6 border-b-1 border-blueGray-300"/>

                <div className="px-5 text-start">
                  <label className="text-blueGray-700 font-bold me-3">
                    Descripción:
                  </label>
                  <p className="text-blueGray-700">{product.descripcion || "N/A"}</p>
                </div>

                <hr className="mx-3 my-6 border-b-1 border-blueGray-300"/>

                <div className="px-5 text-center flex justify-between">
                  <div className="lg:w-12/12 text-start">
                    <label className="text-blueGray-700 font-bold me-3">
                      IVA:
                    </label>
                    <span className="text-blueGray-700">
                      {product.iva_categoria
                        ? `${product.iva_categoria.nombre} (${product.iva_categoria.tasa_porcentaje}%)`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <hr className="my-6 border-b-1 border-blueGray-300"/>
              </div>
            </div>
          </div>

          <div style={buttonStyle}>
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
  width: "70%",
  height: "90%",
  overflowY: "auto",
};

const buttonStyle = {
  position: "fixed",
  justifyContent: "center",
  alignItems: "center",
  bottom: "9%",
  left: "47%",
  textAlign: "center",
};

export default ModalProducts;
