/* =========================================================
   pdfDraw.js - Funciones utilitarias para dibujar en PDF
   =========================================================
   Librería base: jsPDF
   doc -> instancia de jsPDF (ej: const doc = new jsPDF())
*/

/* ================= CAJA ================= */
/**
 * Dibuja un rectángulo en el PDF
 * 
 * @param {object} doc - Instancia de jsPDF
 * @param {number} x - Posición X inicial
 * @param {number} y - Posición Y inicial
 * @param {number} w - Ancho de la caja
 * @param {number} h - Alto de la caja
 * 
 * Ejemplo:
 * box(doc, 10, 20, 50, 30);
 * Esto dibuja un rectángulo de 50x30mm comenzando en X=10, Y=20
 */
export const box = (doc, x, y, w, h) => {
  doc.rect(x, y, w, h);
};

/* ================= LINEA ================= */
/**
 * Dibuja una línea entre dos puntos
 * 
 * @param {object} doc - Instancia de jsPDF
 * @param {number} x1 - Posición X del inicio
 * @param {number} y1 - Posición Y del inicio
 * @param {number} x2 - Posición X del final
 * @param {number} y2 - Posición Y del final
 * 
 * Ejemplo:
 * line(doc, 10, 10, 60, 10);
 * Esto dibuja una línea horizontal de 50mm de largo desde X=10,Y=10
 */
export const line = (doc, x1, y1, x2, y2) => {
  doc.line(x1, y1, x2, y2);
};

/* ================= TEXTO ================= */
/**
 * Escribe texto en el PDF
 * 
 * @param {object} doc - Instancia de jsPDF
 * @param {string} value - Texto a escribir
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño de fuente (default 8)
 * @param {string} align - Alineación: left, center, right (default "left")
 * @param {boolean} bold - Si el texto es bold o no (default false)
 * 
 * Ejemplo:
 * text(doc, "Retención IVA", 10, 20, 10, "left", true);
 * Esto escribe "Retención IVA" en X=10,Y=20, tamaño 10, alineado a la izquierda, en negrita
 */
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
/**
 * Escribe un par Label + Valor en línea
 * El label siempre en negrita y el valor en normal
 * 
 * @param {object} doc - Instancia de jsPDF
 * @param {string} label - Nombre del campo (ej: "Nº Comprobante")
 * @param {string|number} value - Valor del campo (ej: "00001")
 * @param {number} x - Posición X inicial
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño de fuente (default 9)
 * 
 * Ejemplo:
 * labelValue(doc, "Nº Comprobante", "00001", 10, 30);
 * Esto escribe:
 * "Nº Comprobante: 00001"
 * con "Nº Comprobante:" en negrita y "00001" normal, comenzando en X=10, Y=30
 */
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