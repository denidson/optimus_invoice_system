export const validateProduct = (product, rol) => {
  const errors = [];

  if (!product.sku) errors.push("SKU es obligatorio");
  if (!product.nombre) errors.push("Nombre es obligatorio");
  if (!product.precio_base) errors.push("Precio base es obligatorio");
  if (!product.iva_categoria_id) errors.push("Debe seleccionar IVA");
  if (!product.descripcion) errors.push("Descripción es obligatorio");
  if (!product.peso_kg) errors.push("Peso (Kg) es obligatorio");
  if (!product.volumen_m3) errors.push("Volumen (M³) es obligatorio");

  if (rol === "admin" && !product.cliente_id) {
    errors.push("Debe seleccionar un cliente");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};