import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPreInvoices, showPreInvoice, createPreInvoice, editPreInvoice } from '../../services/api_pre_invoices'; // Importa el servicio
import { showInvoice } from '../../services/api_invoices'; // Importa el servicio
import { getProducts, showProduct, createProduct } from '../../services/apiProducts'; // Importa el servicio
import { getEndClients, showEndClient, createEndClient } from '../../services/api_end_clients'; // Importa el servicio
import { useNavigate } from "react-router-dom"; // Para la redirección
import { decryptText } from '../../services/api'; // Importa el servicio para encriptar/desencriptar parametros
import { useLocation } from "react-router-dom"; // Para la obtener el parametro de la url
import { toast, ToastContainer } from "react-toastify"; // Importamos las funciones necesarias
import "react-toastify/dist/ReactToastify.css"; // Importar el CSS de las notificaciones
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Button } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";
import { Tabs, Tab, Box } from "@mui/material";
import { esES } from '@mui/x-data-grid/locales';
import $ from "jquery";

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
  const [endClients, setEndClients] = useState(null);
  const [filterResults, setFilterResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Obtener los query parameters con `useLocation`
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preInvoiceId = queryParams.get("id"); // Obtener el ID de la URL
  const preInvoiceType = queryParams.get("type");
  const [preInvoice, setPreInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [tab, setTab] = useState("productos"); // Estado para controlar qué DataGrids mostrar
  const authData = localStorage.getItem("authData");
  var authclientId;
  if (authData) {
    authclientId = JSON.parse(authData)['cliente_id'];
  }
  const type = preInvoiceType != undefined ? decryptText(preInvoiceType) : 'FC';
  //Autofocus
  const apiRef = useGridApiRef();
  const apiRefNd = useGridApiRef();
  //Campos del DataGrid
  const columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "nueva_linea", headerName: "Nueva Linea", editable: false },
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
    { field: "iva_categoria_id", headerName: "iva_categoria_id", editable: false },
    {
      field: "tasa_porcentaje",
      headerName: "Impuesto",
      flex: 1,
      type: "number",
      editable: false,
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
      field: "descuento_porcentaje",
      headerName: "Desc %",
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
        const tasa_porcentaje = Number(params.row.tasa_porcentaje) || 0;
        const descuento_porcentaje = Number(params.row.descuento_porcentaje) || 0;
        const total = cantidad * (precio - (precio * descuento_porcentaje/100));
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

  const columnsNd = [
    { field: "id", headerName: "ID", editable: false },
    { field: "nueva_linea", headerName: "Nueva Linea", editable: false },
    { field: "concepto", headerName: "Concepto", editable: true, flex: 4 },
    {
      field: "monto",
      headerName: "Monto",
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
      field: "acciones",
      headerName: "",
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button
          color="bg-slate-800"
          size="small"
          onClick={() => handleDeleteRowNd(params.row.id)}>
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

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  // Simulando la carga de datos del Pre-Factura por el ID
  useEffect(() => {
    const fetchPreInvoice = async () => {
      try {
        const datapts = await getProducts();
        setProducts(datapts);
        const datacls = await getEndClients({ page: 1, per_page: 20, request_type: 'export' });
        setEndClients(datacls.data);
        var data;
        if (preInvoiceId != null){
          console.log('type: ', type);
          if (type == 'FC'){
            data = await showPreInvoice(decryptText(preInvoiceId)); // Llamamos a showPreInvoice con el ID
            if (data.igtf_monto > 0){
              data['aplica_igtf'] = true;
              $('#aplica_igtf').prop('checked', true);
              $('.apply_igtf').removeClass('hidden');
            }
          }else{
            data = await showInvoice(decryptText(preInvoiceId)); // Llamamos a showPreInvoice con el ID
            data['tipo_documento'] = type;
            data['factura_afectada_id'] = data['id'];
            data['id'] = '#';
            data['fecha_factura'] = formattedDate;
            data['aplica_igtf'] = false;
            data['monto_pagado_divisas'] = 0.0;
            data['igtf_monto'] = 0.0;
            if (type == 'ND'){
              data['items'] = [];
              data['conceptos_nd'] = [];
            }
          }
          setPreInvoice(data); // Guardamos los datos del Pre-Factura en el estado
        }else{
          setPreInvoice({
            id: "#",
            cliente_final_id: "",
            cliente_final_nombre: "",
            cliente_final_rif: "",
            cliente_final_telefono: "",
            cliente_final_email: "",
            cliente_final_direccion: "",
            cliente_id: authclientId,
            items: [],
            correlativo_interno: "",
            zona: "",
            aplica_igtf: false,
            monto_pagado_divisas: 0,
            igtf_porcentaje: 3.0,
            igtf_monto: 0,
            tipo_documento: 'FC',
            fecha_factura: formattedDate,
            serial: '',
            conceptos_nd: [],
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

  // función auxiliar para redondear
  const roundTo = (num, decimals) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  //Calcular base imponible de la Pre-Factura
  const taxBase = useMemo(() => {
    if (!preInvoice?.items && !preInvoice?.conceptos_nd) return 0;

    const baseTotal = preInvoice.items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      const descuento_porcentaje = Number(item.descuento_porcentaje) || 0;

      // calcular Base de la línea
      const baseLine = cantidad * (precio - (precio * (descuento_porcentaje/100)));

      // redondear a 4 decimales por línea
      return acc + roundTo(baseLine, 2);
    }, 0);

    const baseTotalNd = preInvoice.conceptos_nd.reduce((acc, item) => {
      const monto = Number(item.monto) || 0;

      // redondear a 4 decimales por línea
      return acc + roundTo(monto, 2);
    }, 0);

    // resultado final redondeado a 2 decimales
    return roundTo(baseTotal + baseTotalNd, 2);
  }, [preInvoice?.items, preInvoice?.conceptos_nd]);

  //Calcular iva de la Pre-Factura
  const taxApplied = useMemo(() => {
    if (!preInvoice?.items) return 0;

    const taxTotal = preInvoice.items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      const tasa_porcentaje = Number(item.tasa_porcentaje) || 0;
      const descuento_porcentaje = Number(item.descuento_porcentaje) || 0;

      // calcular IVA de la línea
      const taxLine = cantidad * (precio - (precio * (descuento_porcentaje/100))) * (tasa_porcentaje / 100);

      // redondear a 4 decimales por línea
      return acc + roundTo(taxLine, 2);
    }, 0);

    // resultado final redondeado a 2 decimales
    return roundTo(taxTotal, 2);
  }, [preInvoice?.items]);

  //Calcular total de la Pre-Factura
  const totalAmount = useMemo(() => {
    if (!preInvoice?.items && !preInvoice?.conceptos_nd) return 0;

    const total = preInvoice.items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      const tasa_porcentaje = Number(item.tasa_porcentaje) || 0;
      const descuento_porcentaje = Number(item.descuento_porcentaje) || 0;

      // calcular Total de la línea
      const totalLine = cantidad * ((precio - (precio * (descuento_porcentaje/100))) * (1 + (tasa_porcentaje / 100)));

      // redondear a 4 decimales por línea
      return acc + roundTo(totalLine, 2);
    }, 0);

    const totalNd = preInvoice.conceptos_nd.reduce((acc, item) => {
      const monto = Number(item.monto) || 0;

      // redondear a 4 decimales por línea
      return acc + roundTo(monto, 2);
    }, 0);

    // resultado final redondeado a 2 decimales
    return roundTo(total + totalNd, 2);
  }, [preInvoice?.items, preInvoice?.conceptos_nd]);

  //Calcular monto del igtf en la Pre-Factura
  const igtfAmount = useMemo(() => {
    if (!preInvoice?.items) return 0;
    if (!preInvoice?.monto_pagado_divisas) return 0;
    const igtfAmount = preInvoice.monto_pagado_divisas * (preInvoice.igtf_porcentaje / 100);

    // resultado final redondeado a 2 decimales
    return roundTo(igtfAmount, 2);
  }, [preInvoice?.monto_pagado_divisas]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí enviarías los datos de nuevo al backend para actualizar al preInvoice
    setButtonDisabled(true); // Iniciar carga (deshabilitar botón)
    console.log("preInvoiceId:", preInvoiceId);
    try {
      var data;
      var action;
      if (preInvoice.id == '#'){
        delete preInvoice.id;
        if (preInvoice.cliente_final_id == '#'){
          delete preInvoice.cliente_final_id;
          if (preInvoice.tipo_documento != 'ND'){
            delete preInvoice.conceptos_nd;
          }
        }
        action = 'create';
        //preInvoice.total = totalAmount;
        console.log("preInvoice(F):", preInvoice);
        var preInvoiceList = [preInvoice];
        data = await createPreInvoice(preInvoiceList); // Llamamos a createClient con el ID
        console.log("preInvoice(F)-data:", data);
      }else{
        action = 'update';
        data = await editPreInvoice(decryptText(preInvoiceId), preInvoice); // Llamamos a editPreInvoice con el ID
      }
      //console.log('editPreInvoice-data: ', data);
      //setPreInvoice(data.resultados[0]); // Guardamos los datos del preInvoice en el estado
      // Mostrar una notificación de éxito
      console.log('editPreInvoice-status: ', data);
      if (action == 'create' && data.resultados[0].status == 'prefactura_creada'){
        console.log('CreatePreInvoice-toast:==>');
        toast.success('Pre-Factura creada satisfactoriamente.', {
          onClose: () => {
            // Espera a que la notificación se cierre para redirigir
            setTimeout(() => {
              navigate("/preinvoices");  // Redirige a la lista de pre-facturas
            }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
          },
        });
      } else if (action == 'update' && ((data.items != undefined && data.items.length) > 0 || data.mensaje == 'No se enviaron campos modificables o los valores son iguales.')){
        console.log('EditPreInvoice-toast:==>');
        toast.success('Pre-Factura actualizada satisfactoriamente.', {
          onClose: () => {
            // Espera a que la notificación se cierre para redirigir
            setTimeout(() => {
              navigate("/preinvoices");  // Redirige a la lista de pre-facturas
            }, 2000); // El tiempo debe ser el mismo o ligeramente mayor que la duración de la notificación
          },
        });
      }else{
        toast.error("Error al actualizar la Pre-Factura");
        setButtonDisabled(false);
      }
    } catch (err) {
      console.log('Error: ', err);
      setError('Error al cargar la Pre-Factura');
      // Mostrar una notificación de error
      toast.error("Error al actualizar la Pre-Factura");  // Notificación de error
      setButtonDisabled(false);
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
    //console.log('newId: ', newId);
    const newRow = { id: newId, nueva_linea: true, producto_id: "", cantidad: 1, precio_unitario: 0, iva_categoria_id: "", tasa_porcentaje: "", descuento_porcentaje: 0 };

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

  // Agregar nueva línea con foco Nota de Debito
  const handleAddRowNd = () => {
    const newId =
      preInvoice.conceptos_nd.length > 0
        ? Math.max(...preInvoice.conceptos_nd.map((r) => r.id)) + 1
        : 1;
    //console.log('newId: ', newId);
    const newRow = { id: newId, nueva_linea: true, concepto: "", monto: 0.0 };

    setPreInvoice((prev) => {
      const updated = {
        ...prev,
        conceptos_nd: [...prev.conceptos_nd, newRow],
      };

      setTimeout(() => {
        apiRefNd.current.setCellFocus(newId, "concepto");
        apiRefNd.current.startCellEditMode({ id: newId, field: "concepto" });
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

  // Función para eliminar fila
  const handleDeleteRowNd = (id) => {
    setPreInvoice((prev) => ({
      ...prev,
      conceptos_nd: prev.conceptos_nd.filter((row) => row.id !== id),
    }));
  };

  // Función para actualizar fila
const processRowUpdate = (newRow, oldRow) => {
  // Buscar producto seleccionado
  const selectedProduct = products?.find(p => p.id === newRow.producto_id);

  // Normalizar precio_base: convertir "31,00" -> 31.00 (float)
  let precioUnitario = newRow.precio_unitario;

  // Solo tomar el precio_base si el usuario no ha editado o no existe valor
  if (selectedProduct && (oldRow.producto_id !== newRow.producto_id || !precioUnitario)) {
    precioUnitario = parseFloat(
      selectedProduct.precio_base.toString().replace(",", ".")
    );
  }

  // Crear la fila actualizada
  const updatedRow = {
    ...newRow,
    precio_unitario: precioUnitario,
    iva_categoria_id: selectedProduct.iva_categoria.id,
    tasa_porcentaje: selectedProduct.iva_categoria.tasa_porcentaje,
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

  // Función para actualizar fila Nota Debito
const processRowUpdateNd = (newRow, oldRow) => {
  // Buscar producto seleccionado

  // Normalizar precio_base: convertir "31,00" -> 31.00 (float)
  let monto = parseFloat(
    newRow.monto.toString().replace(",", ".")
  );

  // Crear la fila actualizada
  const updatedRow = {
    ...newRow,
    monto: monto,
  };

  // Actualizar estado global preInvoice
  setPreInvoice((prev) => ({
    ...prev,
    conceptos_nd: prev.conceptos_nd.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    ),
  }));

  return updatedRow; // obligatorio retornar la fila actualizada
};

const handleSearchRif = (value) => {
  console.log('handleSearchRif-value: ', value);
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
        value = preInvoice.cliente_final_rif;
      }
    }
  }

  // Actualiza el campo
  setPreInvoice((prev) => ({ ...prev, cliente_final_rif: value }));

  if (value.length < 2) {
    setFilterResults([]);
    setShowResults(false);
    return;
  }

  const results = endClients.filter((c) =>
    c.rif.toUpperCase().includes(value) ||
    c.nombre.toUpperCase().includes(value)
  );
  console.log('handleSearchRif-results.length: ', results.length);
  if (results.length == 0){
    $('#div_none_endclients').attr('style', "width: 600px;");
    $('.form-client-complement').addClass('mt-10');
    setPreInvoice((prev) => ({
    ...prev,
      cliente_final_id: '#',
      //cliente_final_rif: '',
      cliente_final_nombre: '',
      cliente_final_telefono: '',
      cliente_final_email: '',
      cliente_final_direccion: '',
    }));
  }else{
    $('#div_none_endclients').removeAttr('style');
    $('.form-client-complement').removeClass('mt-10');
  }
  setFilterResults(results);
  setShowResults(true);
};

const selectClient = (client) => {
  setPreInvoice((prev) => ({
    ...prev,
    cliente_final_id: client.id || '#',
    cliente_final_rif: client.rif || '',
    cliente_final_nombre: client.nombre || '',
    cliente_final_telefono: client.telefono || '',
    cliente_final_email: client.email || '',
    cliente_final_direccion: client.direccion || '',
  }));

  setFilterResults([]);
  setShowResults(false);
};

const reduceRif = (rif) => {
  setPreInvoice((prev) => ({
    ...prev,
    cliente_final_rif: rif || '',
  }));
};

const handleRadioChange = (event) => {
  setSelectedView(event.target.value); // Actualiza el estado con el valor del radio button seleccionado
};

  return (
    <div className="mx-auto w-full">
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
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Fecha de factura</label>
                      <input
                        type="date"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.fecha_factura} max={formattedDate}
                        onChange={(e) => setPreInvoice({ ...preInvoice, fecha_factura: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">RIF</label>
                      <input
                        type="text"
                        className="hidden border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_id}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_id: e.target.value })}
                      />
                      <div className="relative">
                        {/*<input
                          type="text"
                          maxLength={12}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                          placeholder="V-12345678-9"
                          value={preInvoice.cliente_final_rif}
                          onChange={(e) => handleSearchRif(e.target.value)}
                          onKeyDown={(e) => {
                            console.log('e.key: ', e.key);
                            if (e.key === "ArrowDown") {
                              $('.li_search_client').focus()
                            }
                            // Si el usuario presiona Backspace
                            if (e.key === "Backspace") {
                              if (preInvoice.cliente_final_rif.substr(preInvoice.cliente_final_rif.length - 1, preInvoice.cliente_final_rif.length) == '-'){
                                reduceRif(preInvoice.cliente_final_rif.substr(0, preInvoice.cliente_final_rif.length - 1));
                              }
                            }
                            // Si el usuario presiona Enter y hay resultados
                            if (e.key === "Enter") {
                              e.preventDefault(); // evita submit del formulario

                              if (filterResults.length > 0) {
                                selectClient(filterResults[0]); // selecciona el primer resultado
                              } else {
                                // si no hay resultados se oculta la lista igual
                                setShowResults(false);
                              }
                            }
                          }}
                        />*/}
                        <Autocomplete
                            freeSolo
                            options={endClients || []}
                            getOptionLabel={(opt) =>
                              opt?.rif ? `${opt.rif} — ${opt.nombre}` : ""
                            }
                            filterOptions={(options) => options} // usamos tu propio filtro manual
                            inputValue={preInvoice.cliente_final_rif}
                            onInputChange={(e, value) => handleSearchRif(value)}
                            onChange={(event, newValue) => {
                              if (newValue) selectClient(newValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="RIF"
                                placeholder="V-12345678-9"
                                variant="outlined"
                                size="small"
                                onKeyDown={(e) => {
                                  // Si el usuario presiona Backspace
                                  if (e.key === "Backspace") {
                                    if (preInvoice.cliente_final_rif.substr(preInvoice.cliente_final_rif.length - 1, preInvoice.cliente_final_rif.length) == '-'){
                                      reduceRif(preInvoice.cliente_final_rif.substr(0, preInvoice.cliente_final_rif.length - 1));
                                    }
                                  }
                                  // ENTER para seleccionar primer elemento si no se ha elegido uno
                                  if (e.key === "Enter") {
                                    if (filterResults.length > 0) {
                                      e.preventDefault();
                                      selectClient(filterResults[0]);
                                    }
                                  }
                                }}
                              />
                            )}
                          />

                        {/*
                        {showResults && filterResults.length > 0 && (
                          <ul className="absolute z-50 bg-white border border-gray-300 rounded w-full mt-1 max-h-48 overflow-y-auto shadow-lg ul_search_client">
                            {filterResults.map((c) => (
                              <li
                                key={c.id}
                                className="px-3 py-2 hover:bg-gray-200 cursor-pointer li_search_client"
                                onClick={() => selectClient(c)}
                              >
                                <strong>{c.rif}</strong> — {c.nombre}
                              </li>
                            ))}
                          </ul>
                        )}

                        {showResults && filterResults.length === 0 && (
                          <div id="div_none_endclients" className="absolute z-50 bg-white border border-gray-300 rounded w-full mt-1 px-3 py-2 text-gray-500">
                            No se encontraron resultados, se creara un nuevo cliente con los datos enviados.
                          </div>
                        )}*/}
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-8/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Razon Social</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_nombre}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_nombre: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4 form-client-complement">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Telefono</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_telefono}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_telefono: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 form-client-complement">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Correo electronico</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_email}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_email: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4 form-client-complement">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Dirección</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.cliente_final_direccion}
                        onChange={(e) => setPreInvoice({ ...preInvoice, cliente_final_direccion: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-4">Tipo de documento</label>
                      <label className="block text-blueGray-600 text-xs mt-4 font-bold">{preInvoice.tipo_documento == 'FC' ?
                        ('FACTURA')
                        :
                        (preInvoice.tipo_documento == 'NC'?
                          ('NOTA DE CREDITO')
                          :
                          ('NOTA DE DEBITO')
                        )
                      }</label>
                      <input
                        type="text"
                        className="hidden border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.tipo_documento}
                      />
                      {/*<select
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.tipo_documento} readonly
                        onChange={(e) => setClient({ ...preInvoice, tipo_documento: e.target.value })}>
                        <option value="#">Seleccione...</option>
                        <option value="FC">Factura</option>
                        <option value="NC">Nota de Crédito</option>
                        <option value="ND">Nota de Débito</option>
                      </select>*/}
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Correlativo Interno</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.correlativo_interno}
                        onChange={(e) => setPreInvoice({ ...preInvoice, correlativo_interno: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-2/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Serial</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.serial}
                        onChange={(e) => setPreInvoice({ ...preInvoice, serial: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-xs font-bold mb-2">Zona</label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value={preInvoice.zona}
                        onChange={(e) => setPreInvoice({ ...preInvoice, zona: e.target.value.toString().toUpperCase() })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap">
                  {/* Aquí el grupo de radio buttons */}

                    {type == 'ND' && (
                      <div className="w-full lg:w-12/12 px-4 mt-1 text-center">
                        <hr class="my-6 border-b-1 border-blueGray-300"/>
                        <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" centered>
                          <Tab value="productos" label="Productos" />
                          <Tab value="conceptos" label="Conceptos" />
                        </Tabs>
                      </div>
                    )}
                    {/* Condicionalmente renderizamos los DataGrids basados en el estado selectedView */}
                    {tab === "productos" && (
                      <div className="w-full lg:w-12/12 px-4 mt-1 text-right">
                        {type != 'NC' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddRow}
                          style={{ marginBottom: 10 }}>
                          Agregar línea
                        </Button>
                        )}
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
                            nueva_linea: false, // oculta la columna "nueva_linea"
                            iva_categoria_id: false, // oculta la columna "iva_categoria_id"
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
                    )}
                    {tab === "conceptos" && (
                      <div className="w-full lg:w-12/12 px-4 mt-5 text-right">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddRowNd}
                          style={{ marginBottom: 10 }}>
                          Agregar concepto
                        </Button>
                        <DataGrid
                          apiRef={apiRefNd}
                          rows={preInvoice.conceptos_nd}
                          columns={columnsNd}
                          getRowId={(row) => row.id}
                          pageSize={5}
                          autoHeight
                          processRowUpdate={processRowUpdateNd}
                          columnVisibilityModel={{
                            id: false, // oculta la columna "id"
                            nueva_linea: false, // oculta la columna "nueva_linea"
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
                    )}

                  <div className="w-full lg:w-4/12 px-4 mt-3">
                    <div className="relative w-full mb-3">
                      <label class="inline-flex items-center cursor-pointer">
                        <input value={preInvoice.aplica_igtf} type="checkbox" id="aplica_igtf" class="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                          onChange={(e) => {
                            const aplica_igtf = e.target.checked; // obtienes el value normal
                            if (aplica_igtf){
                              $('.apply_igtf').removeClass('hidden');
                            }else{
                              $('.apply_igtf').addClass('hidden');
                            }
                            // actualizamos el atributo aplica_igtf
                            setPreInvoice({ ...preInvoice, aplica_igtf: e.target.value })
                          }}/>
                        <span class="ml-2 text-sm font-semibold text-blueGray-600">Aplicar IGTF</span>
                      </label>
                      <div className="apply_igtf mt-3 p-4 border rounded bg-gray-50 hidden">
                        <label className="block text-blueGray-600 text-xs font-bold mb-2">Monto pagado en divisas</label>
                        <input
                          type="number" step="0.01"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-right text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={preInvoice.monto_pagado_divisas}
                          onChange={(e) => {
                            // convertir a float, pero permitir "" si el input está vacío
                            const value = e.target.value;
                            setPreInvoice({...preInvoice,
                              monto_pagado_divisas: value === "" ? "" : value
                            });
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value || 0).toFixed(2); // redondea a 2 decimales
                            setPreInvoice({
                              ...preInvoice,
                              monto_pagado_divisas: parseFloat(value) // guardamos como float
                            });
                          }}/>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-3/12 px-4 mt-10">
                    <div className="apply_igtf mt-3 p-4 pb-2 border border-b-0 rounded rounded-t-none bg-gray-50 hidden">
                        <label className="block text-blueGray-600 text-xs font-bold mb-2">{'IGTF ' + parseFloat(preInvoice.igtf_porcentaje).toFixed(2).toString() + '%' }</label>
                    </div>
                    <div className="apply_igtf p-4 pt-0 border border-t-0 rounded rounded-b-none bg-gray-50 text-right hidden">
                        <label className="border-0 px-3 text-blueGray-600 rounded text-lg font-bold">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                          minimumFractionDigits: 2,
                        }).format(igtfAmount)}
                        </label>
                      </div>
                  </div>
                  <div className="w-full lg:w-5/12 px-4 mt-3">
                    <div className="flex w-full mb-1">
                      <div className="w-full lg:w-4/12 px-4 mt-3">
                        <label className="block text-blueGray-600 font-bold text-lg">Base imponible</label>
                      </div>
                      <div className="w-full lg:w-9/12 px-4 mt-3 text-right">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                          minimumFractionDigits: 2,
                        }).format(taxBase)}
                        </label>
                      </div>
                    </div>
                    <div className="flex w-full mb-1">
                      <div className="w-full lg:w-4/12 px-4">
                        <label className="block text-blueGray-600 font-bold text-lg">I.V.A.</label>
                      </div>
                      <div className="w-full lg:w-9/12 px-4 text-right">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                          minimumFractionDigits: 2,
                        }).format(taxApplied)}
                        </label>
                      </div>
                    </div>
                    <div className="flex w-full mb-3">
                      <div className="w-full lg:w-3/12 px-4">
                        <label className="block text-blueGray-600 font-bold text-lg">Total</label>
                      </div>
                      <div className="w-full lg:w-9/12 px-4 text-right">
                        <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                          minimumFractionDigits: 2,
                        }).format(totalAmount)}
                        </label>
                      </div>
                    </div>
                    {(preInvoice.monto_pagado_divisas > 0.0) ?
                    (<div className="flex w-full mb-3">
                        <div className="w-full lg:w-3/12 px-4">
                          <label className="block text-blueGray-600 font-bold text-lg">Total + IGTF</label>
                        </div>
                        <div className="w-full lg:w-9/12 px-4 text-right">
                          <label className="text-right border-0 px-3 text-blueGray-600 bg-white rounded text-lg font-bold">
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: "VES",
                            minimumFractionDigits: 2,
                          }).format(totalAmount + igtfAmount)}
                          </label>
                        </div>
                      </div>)
                      :
                      (<div className="hidden flex w-full mb-3">
                        <div className="w-full lg:w-3/12 px-4">
                        </div>
                        <div className="w-full lg:w-9/12 px-4 text-right">
                        </div>
                      </div>)
                    }
                  </div>
                </div>

                <hr class="my-6 border-b-1 border-blueGray-300"/>
                <button className="bg-twilight-indigo-600 text-white px-4 py-2 rounded me-3"
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