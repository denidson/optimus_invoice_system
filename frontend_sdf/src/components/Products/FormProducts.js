import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showProduct, editProduct, createProduct } from "../../services/apiProducts"; 
import { getTaxCategories } from "../../services/apiConfig"; //Importar los impuestos
import { decryptText } from "../../services/api"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FormProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("id");

  const [product, setProduct] = useState(null);
  const [taxCategories, setTaxCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [error, setError] = useState(null);

  // Cargar producto si estamos editando
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await getTaxCategories();
        setTaxCategories(categories);

        if (productId) {
          const data = await showProduct(decryptText(productId));
          setProduct(data);
        } else {
          setProduct({
            nombre: "",
            sku: "",
            precio_base: "",
            descripcion: "",
            iva_categoria_id: categories.length > 0 ? categories[0].id : 1,
            activo: true,
            aplica_iva: true,
            cliente_id: 1, // Ajusta si aplica
          });
        }
      } catch (err) {
        setError("Error al cargar el producto o impuestos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);

    try {
      // Crear body completo con todos los campos requeridos por la API
      const body = {
        nombre: product.nombre,
        sku: product.sku,
        precio_base: product.precio_base.toString(),
        descripcion: product.descripcion,
        iva_categoria_id: parseInt(product.iva_categoria_id, 10),
        activo: product.activo ?? true,
        aplica_iva: product.aplica_iva ?? true,
        cliente_id: product.cliente_id ?? 1, 
      };

      console.log("Enviando body:", body); // Para debug

      let response;
      if (!productId) {
        response = await createProduct(body);
      } else {
        response = await editProduct(decryptText(productId), body);
      }

      toast.success("Producto guardado correctamente", {
        onClose: () => navigate("/products"),
      });
    } catch (err) {
      console.error("Error creating/editing product:", err);
      toast.error("Error al guardar el producto");
    } finally {
      setButtonDisabled(false);
    }
  };

  const redirectToList = () => navigate("/products");

  return (
    <div className="px-4 md:px-10 mx-auto w-full -m-24">
      <ToastContainer />
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6 flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold">
                {productId ? "Actualizar" : "Crear"} Producto
              </h6>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                {/* SKU */}
                <div className="w-full px-4 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">SKU</label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    required
                  />
                </div>

                {/* Nombre */}
                <div className="w-full px-4 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">Nombre</label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.nombre}
                    onChange={(e) => setProduct({ ...product, nombre: e.target.value })}
                    required
                  />
                </div>

                {/* Precio Base */}
                <div className="w-full px-4 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">Precio Base</label>
                  <input
                    type="number"
                    step="0.01"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.precio_base}
                    onChange={(e) => setProduct({ ...product, precio_base: e.target.value })}
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="w-full px-4 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">Descripción</label>
                  <textarea
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.descripcion}
                    onChange={(e) => setProduct({ ...product, descripcion: e.target.value })}
                  />
                </div>

                {/* IVA */}
                <div className="w-full px-4 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">IVA</label>
                  <select
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.iva_categoria_id}
                    onChange={(e) => setProduct({ ...product, iva_categoria_id: parseInt(e.target.value, 10) })}
                    required
                  >
                    {taxCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="my-6 border-b-1 border-blueGray-300" />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="bg-slate-800 text-white px-4 py-2 rounded"
                    disabled={buttonDisabled}
                    onClick={redirectToList}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={buttonDisabled}
                  >
                    {buttonDisabled ? "Guardando..." : productId ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormProducts;
