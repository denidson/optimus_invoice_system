import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { box, text } from "../pdfDraw";
import { formatDate, formatDecimal } from "../../formatters";
import { getRetencionISLR } from "../../../services/apiWithholdings";

import exampleLogo from "../../../assets/img/react.jpg";

/* ================= GRID ================= */
const grid = (cols = 12, margin = 10, pageWidth = 280, gap = 2) => {
  const totalGap = (cols - 1) * gap;
  const colWidth = (pageWidth - margin * 2 - totalGap) / cols;

  return {
    col: (start, span = 1) => ({
      x: margin + start * colWidth + start * gap,
      w: colWidth * span + (span - 1) * gap
    }),
    vGap: 3
  };
};

/* ===== LABEL BOLD + VALUE NORMAL ===== */
const labelValue = (doc, label, value, x, y) => {
  doc.setFontSize(9);

  // label bold
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, x, y);

  // calcular ancho label
  const offset = doc.getTextWidth(`${label}: `);

  // value normal
  doc.setFont("helvetica", "normal");
  doc.text(String(value ?? ""), x + offset, y);
};

/* ================================================= */
export const buildISLRPDF = async (comprobante_id) => {

  const data = await getRetencionISLR(comprobante_id);
  if (!data) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter"
  });

  const g = grid();
  const col12 = g.col(0, 12);

  let y = 10;

  const {
    cabecera,
    empresa,
    proveedor_beneficiario,
    detalle,
    totales,
    firmas
  } = data;

  /* ================================================= */
  /* ================= HEADER ======================== */
  /* ================================================= */

  const headerHeight = 30;

  const colLogo = g.col(0, 2);
  const colCenter = g.col(2, 7);
  const colRight = g.col(9, 3);

  // BORDE GENERAL (único)
  box(doc, col12.x, y, col12.w, headerHeight);

  /* ---------- LOGO ---------- */

  const logoY = y + 3;
  const logoH = headerHeight - 6;

  const logoImage = empresa?.logo_base64 || exampleLogo;

  try {
    doc.addImage(
      logoImage,
      empresa?.logo_base64 ? "PNG" : "JPG",
      colLogo.x + 2,
      logoY,
      colLogo.w - 4,
      logoH
    );
  } catch (err) {
    console.warn("Error cargando logo, usando fallback");

    doc.addImage(
      exampleLogo,
      "JPG",
      colLogo.x + 2,
      logoY,
      colLogo.w - 4,
      logoH
    );
  }

  /* ---------- CENTRO ---------- */

  text(
    doc,
    cabecera.titulo,
    colCenter.x + colCenter.w / 2,
    y + 10,
    11,
    "center",
    true
  );

  text(
    doc,
    `Fecha: Desde ${formatDate(cabecera.periodo_desde)} Hasta ${formatDate(cabecera.periodo_hasta)}`,
    colCenter.x + colCenter.w / 2,
    y + 18,
    9,
    "center"
  );

  /* ---------- DERECHA (SIN CAJAS) ---------- */

  const rightX = colRight.x + 2;

  labelValue(
    doc,
    "Nº Comprobante",
    cabecera.numero_comprobante,
    rightX,
    y + 12
  );

  labelValue(
    doc,
    "Fecha Emisión",
    formatDate(cabecera.fecha_emision),
    rightX,
    y + 20
  );

  y += headerHeight + 4;

  /* ================================================= */
  /* ========= PROVEEDOR / EMPRESA =================== */
  /* ================================================= */

  const hInfo = 24;

  const colLeft = g.col(0, 6);
  const colRightInfo = g.col(6, 6);

  // Proveedor
  box(doc, colLeft.x, y, colLeft.w, hInfo);

  text(doc, "Proveedor/Beneficiario:", colLeft.x + 2, y + 5, 8, "left", true);
  text(doc, proveedor_beneficiario.nombre, colLeft.x + 2, y + 10);
  text(doc, `RIF: ${proveedor_beneficiario.rif}`, colLeft.x + 2, y + 15);
  text(
    doc,
    `Dirección: ${proveedor_beneficiario.direccion || ""}`,
    colLeft.x + 2,
    y + 20
  );

  // Empresa
  box(doc, colRightInfo.x, y, colRightInfo.w, hInfo);

  text(doc, "Empresa:", colRightInfo.x + 2, y + 5, 8, "left", true);
  text(doc, empresa.nombre, colRightInfo.x + 2, y + 10);
  text(doc, `RIF: ${empresa.rif}`, colRightInfo.x + 2, y + 15);
  text(
    doc,
    `Dirección: ${empresa.direccion || ""}`,
    colRightInfo.x + 2,
    y + 20
  );

  y += hInfo + 5;

  /* ================================================= */
  /* ================= TABLA ========================= */
  /* ================================================= */

  const tableData = detalle.map(d => [
    formatDate(d.fecha),
    d.numero_pago,
    d.tipo,
    d.nro_documento,
    formatDecimal(d.monto_documento),
    d.codigo_concepto,
    formatDecimal(d.monto_abonado),
    formatDecimal(d.monto_objeto_retencion),
    d.tarifa_porcentaje,
    formatDecimal(d.sustraendo),
    formatDecimal(d.impuesto_retenido)
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      "Fecha",
      "Número Pago",
      "Tipo",
      "N° Doc.",
      "Monto Documento",
      "Código Concepto",
      "Monto Abonado",
      "Monto Objeto Retención",
      "Tarifa %",
      "Sustraendo",
      "Impuesto Retenido"
    ]],
    body: tableData,
    foot: [[
      "", "", "", "", "", "", "",
      formatDecimal(totales.monto_objeto_retencion),
      "",
      "",
      formatDecimal(totales.impuesto_retenido)
    ]],
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [220,220,220], textColor:0, fontStyle: "bold", halign: "center" },
    footStyles: { fillColor: [220,220,220], textColor:0, fontStyle: "bold", halign: "right" },
    columnStyles: { 
        0: {halign:'center'}, 
        1: {halign:'center'}, 
        2: {halign:'center'}, 
        3:{halign:'center'}, 
        4:{halign:'right'}, 
        5:{halign:'center'}, 
        6:{halign:'right'}, 
        7:{halign:'right'}, 
        8:{halign:'center'}, 
        9:{halign:'right'},
        10:{halign:'right'} 
    },
    margin: { left: col12.x, right: 10 },
    tableWidth: col12.w
  });

  /* ================================================= */
  /* ================= FOOTER ======================== */
  /* ================================================= */

  const footerHeight = 30;
  const footerTop = doc.internal.pageSize.height - footerHeight;

  text(
    doc,
    "Firma del Agente de Retención: __________________________",
    col12.x + 5,
    footerTop + 10,
    9
  );

  text(
    doc,
    `Fecha de Entrega: ${formatDate(firmas.fecha_entrega)}`,
    col12.x + 5,
    footerTop + 18,
    9
  );

  doc.save(`RET_ISLR_${cabecera.numero_comprobante}.pdf`);
};