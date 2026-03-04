/* ================= GRID HELPERS ================= */
export const grid = (cols = 12, margin = 10, pageWidth = 280, gap = 2) => {
  const totalGap = (cols - 1) * gap;
  const colWidth = (pageWidth - margin * 2 - totalGap) / cols;
  return {
    col: (start, span = 1) => ({
      x: margin + start * colWidth + start * gap,
      w: colWidth * span + (span - 1) * gap
    }),
    gap,
    vGap: 3
  };
};

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

/* ================= CAJA CON COLOR, BORDES REDONDEADOS Y PERSONALIZABLES ================= */
/**
 * Dibuja un rectángulo con color de fondo, bordes redondeados y personalización de borde
 *
 * @param {object} doc - Instancia de jsPDF
 * @param {number} x - Posición X inicial
 * @param {number} y - Posición Y inicial
 * @param {number} w - Ancho de la caja
 * @param {number} h - Alto de la caja
 * @param {string|array} fillColor - Color de fondo (hex o RGB) (default "#FFFFFF")
 * @param {number} borderRadius - Radio de los bordes (default 0)
 * @param {number} borderWidth - Grosor del borde en mm (default 0, sin borde)
 * @param {string|array} borderColor - Color del borde (hex o RGB) (default "#000000")
 *
 * Ejemplo:
 * boxColored(doc, 10, 20, 50, 30, "#E0E0E0", 3, 0.5, "#FF0000");
 */
export const boxCustom = (
  doc,
  x,
  y,
  w,
  h,
  fillColor = "#FFFFFF",
  borderRadius = 0,
  borderWidth = 0,
  borderColor = "#000000"
) => {
  // --------------------- Convertir colores ---------------------
  const parseColor = (color) => {
    if (typeof color === "string" && color.startsWith("#")) {
      return [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16),
      ];
    } else if (Array.isArray(color) && color.length === 3) {
      return color;
    }
    return [0, 0, 0]; // default negro
  };

  const fillRGB = parseColor(fillColor);
  const borderRGB = parseColor(borderColor);

  // --------------------- Relleno ---------------------
  doc.setFillColor(...fillRGB);

  // --------------------- Borde ---------------------
  if (borderWidth > 0) {
    doc.setLineWidth(borderWidth);
    doc.setDrawColor(...borderRGB);
  }

  // --------------------- Dibujar rectángulo ---------------------
  // 'FD' = Fill + Draw (relleno + borde)
  // 'F' = Fill only
  // 'S' = Stroke only (solo borde)
  let style = borderWidth > 0 ? 'FD' : 'F';

  doc.roundedRect(x, y, w, h, borderRadius, borderRadius, style);
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

/**
 * Calcula o escribe texto con wrap
 *
 * @param {object} doc - instancia jsPDF
 * @param {string} value - texto
 * @param {number} x - posición X
 * @param {number} y - posición Y inicial
 * @param {number} maxWidth - ancho máximo
 * @param {number} size - tamaño fuente
 * @param {"left"|"center"|"right"|"justify"} align - alineación
 * @param {boolean} bold - negrita
 * @param {number} lineHeight - espacio entre líneas
 * @param {boolean} measureOnly - si true, solo retorna altura sin dibujar
 *
 * @returns {number} - Y final después de escribir o altura total
 */
export const textWrap = (
  doc,
  value,
  x,
  y,
  maxWidth,
  size = 8,
  align = "left",
  bold = false,
  lineHeight = 4,
  measureOnly = false
) => {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);

  // Dividir el texto en líneas según maxWidth
  const lines = doc.splitTextToSize(String(value ?? ""), maxWidth);

  if (!measureOnly) {
    lines.forEach((line, index) => {
      let drawX = x;

      if (align === "center") {
        // Centrar cada línea según su ancho real
        const lineWidth = doc.getTextWidth(line);
        drawX = x + maxWidth / 2; // centro del rectángulo
        // Si la línea excede maxWidth, limitar el ancho
        if (lineWidth > maxWidth) {
          // recortar la línea visualmente a maxWidth
          // splitTextToSize ya corta, pero en caso extremo ajustamos x
          drawX = x + maxWidth / 2;
        }
      } else if (align === "right") {
        drawX = x + maxWidth; // extremo derecho
      }

      doc.text(line, drawX, y + index * lineHeight, { align });
    });
  }

  return y + lines.length * lineHeight;
};