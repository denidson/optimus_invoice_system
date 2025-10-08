import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showProduct, editProduct, createProduct } from "../../services/apiProducts"; 
import { getTaxCategories } from "../../services/apiConfig";
import { getClients } from "../../services/api_clients";
import { decryptText } from "../../services/api"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FormProducts({ cliente_id: clienteProp, rol }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("id");

  const [product, setProduct] = useState(null);
  const [taxCategories, setTaxCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({}); // Estado para errores de validación

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await getTaxCategories();
        setTaxCategories(categories);

        if (rol === "admin") {
          const clientsData = await getClients();
          setClients(clientsData);
        }

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
            cliente_id: clienteProp || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el producto, los impuestos o los clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, rol, clienteProp]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  // Validación de campos requeridos
  const validate = () => {
    const newErrors = {};
    if (!product.sku) newErrors.sku = "SKU es obligatorio";
    if (!product.nombre) newErrors.nombre = "Nombre es obligatorio";
    if (!product.precio_base) newErrors.precio_base = "Precio base es obligatorio";
    if (!product.iva_categoria_id) newErrors.iva_categoria_id = "Debe seleccionar IVA";
    if (rol === "admin" && !product.cliente_id) newErrors.cliente_id = "Debe seleccionar un cliente";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setButtonDisabled(true);
    try {
      const body = {
        nombre: product.nombre,
        sku: product.sku,
        precio_base: product.precio_base.toString(),
        descripcion: product.descripcion,
        iva_categoria_id: parseInt(product.iva_categoria_id, 10),
        aplica_iva: product.aplica_iva ?? true,
      };

      if (product.cliente_id) body.cliente_id = product.cliente_id;

      if (!productId) {
        await createProduct(body);
      } else {
        await editProduct(decryptText(productId), body);
      }

      toast.success("Producto guardado correctamente", {
        onClose: () => navigate("/products"),
      });
    } catch (err) {
      console.error("Error creando/editando producto:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data ||
        "Error al guardar el producto";
      toast.error(msg);
    } finally {
      setButtonDisabled(false);
    }
  };

  const redirectToList = () => navigate("/products");

  // Función para clases de input según error
  const inputClass = (field) =>
    `border-0 px-3 py-3 rounded text-sm shadow focus:outline-none focus:ring w-full ${
      errors[field] ? "border-red-500 ring-red-200" : "border-gray-200 ring-blue-300"
    }`;


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
                {/* FILA 1: SKU | Nombre */}
                <div className="flex flex-wrap -mx-2 mb-4">
                  <div className="w-1/2 px-2">
                    <label className="block text-blueGray-600 text-xs font-bold mb-2">SKU</label>
                    <input
                      type="text"
                      className={inputClass("sku")}
                      value={product.sku}
                      onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                  </div>

                  <div className="w-1/2 px-2">
                    <label className="block text-blueGray-600 text-xs font-bold mb-2">Nombre</label>
                    <input
                      type="text"
                      className={inputClass("nombre")}
                      value={product.nombre}
                      onChange={(e) => setProduct({ ...product, nombre: e.target.value })}
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                </div>

                {/* FILA 2: Precio Base | IVA */}
                <div className="flex flex-wrap -mx-2 mb-4">
                  <div className="w-1/2 px-2">
                    <label className="block text-blueGray-600 text-xs font-bold mb-2">Precio Base</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputClass("precio_base")}
                      value={product.precio_base}
                      onChange={(e) => setProduct({ ...product, precio_base: e.target.value })}
                    />
                    {errors.precio_base && <p className="text-red-500 text-xs mt-1">{errors.precio_base}</p>}
                  </div>

                  <div className="w-1/2 px-2">
                    <label className="block text-blueGray-600 text-xs font-bold mb-2">IVA</label>
                    <select
                      className={inputClass("iva_categoria_id")}
                      value={product.iva_categoria_id}
                      onChange={(e) =>
                        setProduct({ ...product, iva_categoria_id: parseInt(e.target.value, 10) })
                      }
                    >
                      {taxCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                    {errors.iva_categoria_id && <p className="text-red-500 text-xs mt-1">{errors.iva_categoria_id}</p>}
                  </div>
                </div>

                {/* Descripción */}
                <div className="w-full px-2 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">Descripción</label>
                  <textarea
                    className="border-0 px-3 py-3 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    value={product.descripcion}
                    onChange={(e) => setProduct({ ...product, descripcion: e.target.value })}
                  />
                </div>

                {/* Cliente */}
                <div className="w-full px-2 mb-4">
                  <label className="block text-blueGray-600 text-xs font-bold mb-2">Cliente</label>
                  {rol === "admin" ? (
                    <select
                      className={inputClass("cliente_id")}
                      value={product.cliente_id || ""}
                      onChange={(e) =>
                        setProduct({ ...product, cliente_id: parseInt(e.target.value, 10) })
                      }
                    >
                      <option value="">Seleccione un cliente</option>
                      {clients.map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.nombre_empresa} ({cli.rif})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="border-0 px-3 py-3 bg-gray-100 text-blueGray-600 rounded text-sm shadow w-full"
                      value={`Cliente #${clienteProp}`}
                      readOnly
                    />
                  )}
                  {errors.cliente_id && <p className="text-red-500 text-xs mt-1">{errors.cliente_id}</p>}
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
