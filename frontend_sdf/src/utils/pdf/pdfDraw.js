/* ================= CAJA ================= */
export const box = (doc, x, y, w, h) => {
  doc.rect(x, y, w, h);
};

/* ================= LINEA ================= */
export const line = (doc, x1, y1, x2, y2) => {
  doc.line(x1, y1, x2, y2);
};

/* ================= TEXTO ================= */
export const text = (
  doc,
  value,
  x,
  y,
  size = 8,
  align = "left",
  bold = false
) => {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);

  doc.text(String(value ?? ""), x, y, { align });
};

/* ================= LABEL + VALUE ================= */
/* Ej: Nº Comprobante: 00001  (solo label bold) */
export const labelValue = (
  doc,
  label,
  value,
  x,
  y,
  size = 9
) => {
  doc.setFontSize(size);

  // Label bold
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, x, y);

  // calcular ancho del label
  const labelWidth = doc.getTextWidth(`${label}: `);

  // Value normal
  doc.setFont("helvetica", "normal");
  doc.text(String(value ?? ""), x + labelWidth, y);
};