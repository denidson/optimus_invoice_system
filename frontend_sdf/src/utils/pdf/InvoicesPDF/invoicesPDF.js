import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { box, text, grid, boxCustom, line, textWrap } from "../pdfDraw";
import { formatDate, formatDecimal, formatText } from "../../formatters";
import exampleLogo from "../../../assets/img/react.jpg";
import QRCode from "qrcode";

export const buildInvoicesPDF = async (data) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 8;

  const { documento, emisor, receptor: cliente, items, totales } = data;

  const layout = grid(12, margin, pageWidth, 2);

  let y = 10;

  /* =====================================================
     HEADER SUPERIOR
  ===================================================== */

  const colEmpresa = layout.col(0, 7);
  const colFactura = layout.col(7, 5);
  let padding = 3; // espacio interno
  /* ===== EMPRESA ===== */
  let empresaY = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatText(emisor.nombre_empresa || ""), colEmpresa.x, empresaY);

  empresaY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(formatText(emisor.rif || ""), colEmpresa.x, empresaY);

  empresaY += 2;

  const colLogo = layout.col(0, 3);
  const colInfoEmpresa = layout.col(3, 4);
  /* ===== LOGO ===== */
  try {
    doc.addImage(
      emisor?.logo_base64 || exampleLogo,
      emisor?.logo_base64 ? "PNG" : "JPG",
      colLogo.x,
      empresaY,
      colLogo.w,
      30
    );
  } catch {
    doc.addImage(exampleLogo, "JPG", colLogo.x, y, colLogo.w, 25);
  }

  /* ==== Informacion de la Empresa ==== */
  doc.setFontSize(7);
  empresaY += 6;
  /* ==== BLOQUE INFO EMPRESA EN CAJA ==== */
  // Calcular altura total del boxCustom
  let tempY = empresaY;
  tempY = textWrap(
    doc,
    emisor.direccion_fiscal || "CALLE PANAMA EDIF LIDOMAR PLAZA PISO MEZZANINA OF 08 URB LOS CAOBOS CARACAS DISTRITO CAPITAL ZONA POSTAL 1050",
    0, // X no importa para medir
    tempY,
    colInfoEmpresa.w - padding * 2,
    7,
    "justify",
    false,
    3,
    true // measureOnly
  );

  tempY = textWrap(
    doc,
    emisor.telefono || "",
    0,
    tempY,
    colInfoEmpresa.w - padding * 2,
    7,
    "left",
    false,
    3,
    true
  );

  tempY = textWrap(
    doc,
    `Código de Actividad Económica: ${emisor.codigo_actividad || ""}`,
    0,
    tempY,
    colInfoEmpresa.w - padding * 2,
    7,
    "left",
    false,
    3,
    true
  );

  const boxHeight = tempY - empresaY + padding * 2;

  // Dibujar la caja con la altura exacta
  boxCustom(doc, colInfoEmpresa.x, empresaY, colInfoEmpresa.w, boxHeight, "#ecf6ff", 3, 0, "#ecf6ff");

  // Escribir el contenido dentro, ahora en orden lineal
  let currentInfoY = empresaY + padding;
  currentInfoY = textWrap(
    doc,
    emisor.direccion_fiscal || "CALLE PANAMA EDIF LIDOMAR PLAZA PISO MEZZANINA OF 08 URB LOS CAOBOS CARACAS DISTRITO CAPITAL ZONA POSTAL 1050",
    colInfoEmpresa.x + padding,
    currentInfoY + padding,
    colInfoEmpresa.w - padding * 2,
    7,
    "justify",
    false,
    3
  );

  currentInfoY = textWrap(
    doc,
    emisor.telefono || "",
    colInfoEmpresa.x + padding,
    currentInfoY,
    colInfoEmpresa.w - padding * 2,
    7,
    "left",
    false,
    3
  );

  currentInfoY = textWrap(
    doc,
    `Código de Actividad Económica: ${emisor.codigo_actividad || ""}`,
    colInfoEmpresa.x + padding,
    currentInfoY,
    colInfoEmpresa.w - padding * 2,
    7,
    "left",
    false,
    3
  );

  /* ===== CAJA FACTURA ===== */

  boxCustom(
    doc,
    colFactura.x,
    y - 6,
    colFactura.w + 2,
    8,
    "#ecf6ff",
    3,
    0,
    "#ecf6ff"
  );

  let leftX = colFactura.x + padding;
  let rightX = colFactura.x + colFactura.w - padding;

  let currentY = y + 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  // Primera línea: "FACTURA" a la izquierda, número a la derecha
  text(doc, "FACTURA", leftX, currentY, 12, "left", true);
  text(doc, `${documento.numero_factura}`, rightX, currentY, 12, "right", true);

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  // Segunda línea: fecha a la izquierda, hora a la derecha
  text(doc, `Fecha emisión: ${formatDate(documento.fecha_emision)}`, leftX, currentY, 8, "left", false);
  text(doc, `Hora emisión: ${formatText(documento.hora_emision)}`, pageWidth - margin, currentY, 8, "right", false);

  currentY += 6;
  /* =====================================================
     BLOQUE CONTROL
  ===================================================== */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);

  doc.text(
    `N° de Control ${documento.numero_control || ""}`,
    pageWidth - margin,
    currentY,
    { align: "right" }
  );

  currentY += 4;
  doc.text(
    `Fecha de asignación ${formatDate(documento.fecha_asignacion)}`,
    pageWidth - margin,
    currentY,
    { align: "right" }
  );

  currentY = currentInfoY + 5;

  line(doc, margin, currentY, pageWidth - margin, currentY);
  y = currentY + 6;

  //y += 32;

  /* =====================================================
     BLOQUE CLIENTE
  ===================================================== */

  doc.setFont("helvetica", "bold");
  doc.text("Cliente", margin + 5, y);
  doc.text("Correo", pageWidth / 4, y);
  doc.text("Teléfono", pageWidth / 2, y);
  doc.setFont("helvetica", "normal");
  //doc.text(cliente.nombre || "", margin + 25, y);

  y += 3;

  textWrap(
    doc,
    "INSTITUTO NACIONAL DE LOS ESPACIOS ACUATICOS",//cliente.nombre || ""
    margin + 5,
    y,
    (pageWidth / 4) - 15,
    7,
    "justify",
    false,
    3
  );
  doc.text(cliente.correo || "", pageWidth / 4, y);
  doc.text(cliente.telefono || "0000-0000000", pageWidth / 2, y);

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.text("Documento", margin + 5, y);
  doc.text("Dirección", pageWidth / 4, y);

  y += 3;

  doc.setFont("helvetica", "normal");
  doc.text(`RIF: ${cliente.rif || ""}`, margin + 5, y);

  const addressY = textWrap(
    doc,
    cliente.direccion || "CALLE PANAMA EDIF LIDOMAR PLAZA PISO MEZZANINA OF 08 URB LOS CAOBOS CARACAS DISTRITO CAPITAL ZONA POSTAL 1050",
    (pageWidth / 4),
    y,
    (pageWidth / 2) - 20,
    7,
    "justify",
    false,
    3
  );

  const addressLenY = textWrap(
    doc,
    cliente.direccion || "CALLE PANAMA EDIF LIDOMAR PLAZA PISO MEZZANINA OF 08 URB LOS CAOBOS CARACAS DISTRITO CAPITAL ZONA POSTAL 1050",
    (pageWidth / 4),
    0,
    (pageWidth / 2) - 20,
    7,
    "justify",
    false,
    3,
    true
  );

  const qrUrl = documento.url_validacion || "https://tu-url-validacion.com";

  const qrBase64 = await QRCode.toDataURL(qrUrl, {
    width: 120,
    margin: 1
  });
  const qrSize = 17 + addressLenY;
  doc.addImage(
    qrBase64,
    "PNG",
    (pageWidth - margin - qrSize) - 27,
    y - 18,
    qrSize,
    qrSize
  );

  y = addressY + 3;

  /* =====================================================
     TABLA
  ===================================================== */
  const marginTb = 8;
  const maxTableHeight = 120; // altura deseada desde startY
  const rowHeight = 7; // depende del tamaño de fuente y padding (aprox)
  const currentTableHeight = items.length * rowHeight;
  const remainingHeight = maxTableHeight - currentTableHeight;
  const emptyRowsCount = Math.ceil(remainingHeight / rowHeight);
  const emptyRows = Array.from({ length: emptyRowsCount }, () => ["", "", "", "", "", "", ""]);
  const tableBody = [...items.map(i => [
    formatText(i.codigo),
    formatText(i.descripcion),
    formatDecimal(i.cantidad),
    formatDecimal(i.precio_unitario),
    formatDecimal(i.tasa_iva) + "%",
    formatDecimal(i.descuento),
    formatDecimal(i.total)
  ]), ...emptyRows];
  autoTable(doc, {
    startY: y,
    margin: { left: marginTb, right: marginTb }, // usa los mismos márgenes que la página
    tableWidth: 'auto', // o 'wrap', para que jsPDF calcule según columnas
    head: [["Cod.", "Descripción", "Cantidad", "P. Unit.", "% IVA", "Monto Desc.", "Total"]],
    body: tableBody,
    styles: {
      fontSize: 7,
      //cellPadding: 2,
      lineColor: [100, 119, 140],
    },
    headStyles: {
      fillColor: [235, 246, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0 // quitamos bordes laterales
    },
    didParseCell: function (data) {
      /* ===== HEADER ===== */
      if (data.section === "head") {
        // Solo dibujar borde superior e inferior
        data.cell.styles.lineWidth = {
          top: 0.6,
          bottom: 0.6,
          left: 0,
          right: 0
        };
        data.cell.styles.halign = "center";
        data.cell.styles.lineColor = [100, 119, 140];
      }
       /* ===== BODY ===== */
      if (data.section === "body") {
        data.cell.styles.lineWidth = {
          top: 0,
          bottom: 0,
          left: 0.1,
          right: 0.1
        };
        data.cell.styles.lineColor = [100, 119, 140];
      }
    },
    bodyStyles: {
      textColor: [60, 60, 60]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]    // efecto zebra opcional
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { cellWidth: 78 },
      2: { halign: "right", cellWidth: 18 },
      3: { halign: "right", cellWidth: 22 },
      4: { halign: "center", cellWidth: 15 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", cellWidth: 25 }
    }
  });

  y = doc.lastAutoTable.finalY;

  line(doc, margin, y, pageWidth - margin - 2, y);

  y = doc.lastAutoTable.finalY + 8;
  /* =====================================================
     OBSERVACIÓN
  ===================================================== */

  doc.setFont("helvetica", "bold");
  doc.text("Observación:", margin, y);

  doc.setFont("helvetica", "normal");
  textWrap(
    doc,
    formatText(documento.observacion || "Observación de prueba"),
    margin,       // X inicial
    y + 5,            // Y inicial
    (pageWidth / 2) - (margin),     // ancho máximo
    7,            // tamaño fuente
    "justify",     // alineación centrada
    false,          // negrita
    3
  );

  //y += 15;

  /* =====================================================
     TOTALES
  ===================================================== */

  const totalsX = pageWidth - 70;

  doc.setFont("helvetica", "normal");
  const lineHeight = 3; // altura entre líneas, ajusta según fuente
  for (let i = 0; i < totales.desglose_impuestos.length; i++) {
    doc.text(
      "Base imponible IVA " + formatDecimal(totales.desglose_impuestos[i].tasa) + "% Bs.:",
      totalsX,
      y
    );
    doc.text(
      formatDecimal(totales.desglose_impuestos[i].base_bs),
      pageWidth - margin,
      y,
      { align: "right" }
    );

    y += lineHeight; // avanzar después de la base

    doc.text(
      "IVA " + formatDecimal(totales.desglose_impuestos[i].tasa) + "% Bs.:",
      totalsX,
      y
    );
    doc.text(
      formatDecimal(totales.desglose_impuestos[i].iva_bs),
      pageWidth - margin,
      y,
      { align: "right" }
    );

    y += lineHeight + 1; // avanzar después del IVA para la siguiente tasa (puedes ajustar el +1 si quieres más separación)
  }

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Factura Bs.:", totalsX, y);
  doc.text(formatDecimal(totales.total_factura_bs), pageWidth - margin, y, { align: "right" });

  y += 5;

  doc.text("Total a Pagar Bs.:", totalsX, y);
  doc.text(formatDecimal(totales.total_factura_bs), pageWidth - margin, y, { align: "right" });

  y += 5;

  doc.text("IGTF("+formatDecimal(totales.igtf_porcentaje)+"%):", totalsX, y);
  doc.text(formatDecimal(totales.igtf_bs), pageWidth - margin, y, { align: "right" });

  y += 12;

  /* =====================================================
     BLOQUE LEGAL INFERIOR
  ===================================================== */

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");

  const maxWidth = pageWidth - margin*2;
  y = textWrap(
    doc,
    data.legal.leyenda_legal_2 || "Este pago estará sujeto al cobro adicional del 3% del Impuesto a las Grandes Transacciones Financieras (IGTF), de conformidad con la Providencia Administrativa SNAT/2022/000013 publicada en la G.O. N° 42.339 del 17-03-2022, en caso de ser cancelado en divisas. No aplicara en pago en Bs. Este documento se expresa en Bolívares con su equivalencia en divisas al tipo de cambio corriente del mercado a la fecha de su emisión, según lo establecido en el artículo 13 numeral 14 de la Providencia Administrativa SNAT/2011/00071 (...) en concordancia con el artículo 128 de la Ley del Banco Central de Venezuela (BCV); artículo 25 de la Ley que establece el Impuesto al valor Agregado (IVA) y 38 del Reglamento General de la Ley que establece el Impuesto al Valor Agregado (RLIVA)",
    margin,       // X inicial
    y,            // Y inicial
    maxWidth,     // ancho máximo
    5,            // tamaño fuente
    "center",     // alineación centrada
    true,          // negrita
    2.5
  );
  doc.save(`FACT_${documento.numero_factura}.pdf`);
};