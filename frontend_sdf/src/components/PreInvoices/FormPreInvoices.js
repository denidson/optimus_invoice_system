import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPreInvoices, showPreInvoice, createPreInvoice } from '../../services/api_pre_invoices'; // Importa el servicio
import { getProducts, showProduct, createProduct } from '../../services/api_products'; // Importa el servicio
import { useNavigate } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { useLocation } from "react-router-dom"; // Para la obtener el parametro de la url
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Button } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";
import { esES } from '@mui/x-data-grid/locales';

// Componente editor para el Autocomplete
function ProductoEditCell({ params, products }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // pone el cursor en el buscador
    }
  }, []);

  return (
    <Autocomplete
      options={products || []}
      fullWidth
      size="small"
      getOptionLabel={(option) => `${option.sku} - ${option.nombre}`}
      value={products?.find((p) => p.id === params.value) || null}
      onChange={(event, newValue) => {
        params.api.setEditCellValue({
          id: params.id,
          field: "producto_id",
          value: newValue ? newValue.id : "",
        });
      }}
      renderInput={(p) => (
        <TextField
          {...p}
          inputRef={inputRef} // aquí va el ref para el foco
          variant="standard"
          placeholder="Seleccione un producto..."
          fullWidth
          InputProps={{
            ...p.InputProps,
            sx: { height: "100%", padding: "0 !important" },
          }}
        />
      )}
      sx={{
        width: "100%",
        height: "100%",
        "& .MuiInputBase-root": {
          height: "100%",
          padding: "0 !important",
          display: "flex",
          alignItems: "center",
        },
      }}
    />
  );
}

function FormPreInvoices() {
  const navigate = useNavigate(); // Hook para redirección
  const [products, setProducts] = useState(null);
  // Obtener los query parameters con `useLocation`
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preInvoiceId = queryParams.get("id"); // Obtener el ID de la URL
  const [preInvoice, setPreInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  //Autofocus
  const apiRef = useGridApiRef();
  //Campos del DataGrid
  const columns = [
    { field: "id", headerName: "ID", editable: false },
    //{ field: 'producto_id', headerName: 'Producto', flex: 4, editable: true },
    {
      field: "producto_id",
      headerName: "Producto",
      flex: 4,
      editable: true,
      headerAlign: "center",
      renderEditCell: (params) => (
        <ProductoEditCell params={params} products={products} />
      ),
      // esto asegura que en modo "display" se vea el label en vez del id
      valueFormatter: (params) => {
        const product = products?.find((p) => p.id === params);
        return product ? `${product.sku} - ${product.nombre}` : "";
      },
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 1,
      type: "number",
      editable: true,
      headerAlign: "center",
      renderCell: (params) => {
        // safe check: params puede ser undefined muy tempranamente, evitamos crash
        const raw = params?.value ?? 0;
        return new Intl.NumberFormat("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(raw));
      },
    },
    {
      field: "precio_unitario",
      headerName: "Precio Unitario",
      flex: 1,
      type: "number",
      editable: true,
      headerAlign: "center",
      renderCell: (params) => {
        // safe check: params puede ser undefined muy tempranamente, evitamos crash
        const raw = params?.value ?? 0;
        return new Intl.NumberFormat("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(raw));
      },
    },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      sortable: false,
      align: "right",        // alinea el contenido a la derecha
      headerAlign: "center",  // alinea el título de la cabecera a la derecha
      renderCell: (params) => {
        if (!params || !params.row) return "0,00";

        const cantidad = Number(params.row.cantidad) || 0;
        const precio = Number(params.row.precio_unitario) || 0;
        const total = cantidad * precio;
        //handleCellEditCommit(params);
        return new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "VES",
          minimumFractionDigits: 2,
        }).format(total);
      }
    },
    {
      field: "acciones",
      headerName: "",
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button
          color="bg-slate-800"
          size="small"
          onClick={() => handleDeleteRow(params.row.id)}>
          <i class="fa-solid fa-lg fa-trash"></i>
        </Button>
      ),
    },
  ];
  //Botones para agregar lineas
  const [rows, setRows] = useState([
    //{ id: 1, producto_id: "P001", cantidad: 2, precio_unitario: 1500.0 },
    //{ id: 2, producto_id: "P002", cantidad: 5, precio_unitario: 15.5 },
  ]);
  // Simulando la carga de datos del Pre-Factura por el ID
  useEffect(() => {
    const fetchPreInvoice = async () => {
      try {
        const datapts = await getProducts();
        setProducts(datapts);
        if (preInvoiceId != null){
          const data = await showPreInvoice(decryptText(preInvoiceId)); // Llamamos a showPreInvoice con el ID
          setPreInvoice(data); // Guardamos los datos del Pre-Factura en el estado
        }else{
          setPreInvoice({
            id: "#",
            cliente_final_nombre: "",
            cliente_final_rif: "",
            cliente_id: 1,
            items: [],
            total: "0.0",
            zona: ""
          })
        }
      } catch (err) {
        setError('Error al cargar la Pre-Factura');
      } finally {
        setLoading(false); // Indicamos que la carga ha finalizado
      }
    };

    fetchPreInvoice();
  }, [preInvoiceId]); // Recarga si el `preInvoiceId` cambia

  //Calcular total de la Pre-Factura
  const totalAmount = useMemo(() => {
    if (!preInvoice?.items) return 0;
    return preInvoice.items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      return acc + cantidad * precio;
    }, 0);
  }, [preInvoice?.items]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí enviarías los datos de nuevo al backend para actualizar al preInvoice
    setButtonDisabled(true); // Iniciar carga (deshabilitar botón)
    console.log("preInvoiceId:", preInvoiceId);
    try {
      var data;
      if (preInvoice.id == '#'){
        delete preInvoice.id;
        preInvoice.total = totalAmount;
        console.log("preInvoice(F):", preInvoice);
        data = await createPreInvoice(preInvoice); // Llamamos a createClient con el ID
        console.log("preInvoice(F)-data:", data);
      }else{
        data = await editPreInvoice(decryptText(preInvoiceId), preInvoice); // Llamamos a editPreInvoice con el ID
      }
      //console.log('editPreInvoice-data: ', data);
      setPreInvoice(data.prefactura); // Guardamos los datos del preInvoice en el estado
      // Mostrar una notificación de éxito
      toast.success(data.mensaje, {
        onClose: () => {
          // Espera a que la notificación se cierre para redirigir
          setTimeout(() => {
            navigate("/preinvoices");  // Redirige a la lista de pre-facturas
          }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
        },
      });
    } catch (err) {
      setError('Error al cargar la Pre-Factura');
      // Mostrar una notificación de error
      toast.error("Error al actualizar la Pre-Factura");  // Notificación de error
    } finally {
      setLoading(false); // Indicamos que la carga ha finalizado
    }
  };

  const redirectToList = () => {
    navigate(`/preinvoices`);
  };

  // Agregar nueva línea con foco
  const handleAddRow = () => {
    const newId =
      preInvoice.items.length > 0
        ? Math.max(...preInvoice.items.map((r) => r.id)) + 1
        : 1;

    const newRow = { id: newId, producto_id: "", cantidad: 1, precio_unitario: 0 };

    setPreInvoice((prev) => {
      const updated = {
        ...prev,
        items: [...prev.items, newRow],
      };

      setTimeout(() => {
        apiRef.current.setCellFocus(newId, "producto_id");
        apiRef.current.startCellEditMode({ id: newId, field: "producto_id" });
      });

      return updated;
    });
  };

  // Función para eliminar fila
  const handleDeleteRow = (id) => {
    setPreInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((row) => row.id !== id),
    }));
  };

  // Función para actualizar fila
const processRowUpdate = (newRow, oldRow) => {
  // Buscar producto seleccionado
  const selectedProduct = products?.find(p => p.id === newRow.producto_id);

  // Normalizar precio_base: convertir "31,00" -> 31.00 (float)
  let precioUnitario = newRow.precio_unitario;
  if (selectedProduct) {
    precioUnitario = parseFloat(
      selectedProduct.precio_base.toString().replace(",", ".")
    );
  }

  // Crear la fila actualizada
  const updatedRow = {
    ...newRow,
    precio_unitario: precioUnitario,
  };

  // Actualizar estado global preInvoice
  setPreInvoice((prev) => ({
    ...prev,
    items: prev.items.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    ),
  }));

  return updatedRow; // obligatorio retornar la fila actualizada
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
                <h6 class="text-blueGray-700 text-xl font-bold">{preInvoice.id == '#'? "Crear" : "Actualizar"} Pre-Factura</h6>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <h6 class="text-blueGray-400 text-sm mt-3 my-6 font-bold uppercase">Informacion de la Pre-Factura</h6>
              <form onSubmit={handleSubmit}>
                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4 hidden">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Id</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.id}
                        onChange={(e) => setPreInvoice({ ...preInvoice, id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">RIF</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_rif}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_rif: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-10/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Razon Social</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_nombre}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_nombre: e.target.value })}
                      />
                      </div>
                  </div>
                  <div className="w-full lg:w-7/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Zona</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.zona}
                        onChange={(e) => setPreInvoice({ ...preInvoice, zona: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    {/*<div className="relative w-full mb-3">
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
                    </div>*/}
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4 mt-1 text-right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddRow}
                      style={{ marginBottom: 10 }}>
                      Agregar línea
                    </Button>
                    <DataGrid
                      apiRef={apiRef}
                      rows={preInvoice.items}
                      columns={columns}
                      getRowId={(row) => row.id}
                      pageSize={5}
                      autoHeight
                      processRowUpdate={processRowUpdate}
                      columnVisibilityModel={{
                        id: false, // oculta la columna "id"
                      }}
                      rowHeight={30}
                      localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Traducción al español
                      sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                          fontWeight: 'bold',   // ahora sí en negrita
                          fontSize: '0.80rem',
                        },
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-7/12 px-4 mt-3"></div>
                  <div className="w-full lg:w-5/12 px-4 mt-3">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Total</label>
                      <input
                        type="text"
                        className="text-right border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                          minimumFractionDigits: 2,
                        }).format(totalAmount)}
                        readOnly
                        onChange={(e) => setPreInvoice({ ...preInvoice, total: e.target.value })}
                      />
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
                  {buttonDisabled ? "Actualizando..." : preInvoice.id == '#'? "Guardar" : "Actualizar"} {/* Cambia el texto mientras está cargando */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormPreInvoices;