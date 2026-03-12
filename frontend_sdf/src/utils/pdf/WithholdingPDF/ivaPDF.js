import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable"; // npm i jspdf jspdf-autotable
import { box, text } from "../pdfDraw";
import { formatDate, formatDecimal } from "../../formatters";
import { getRetencionIVA } from "../../../services/apiWithholdings";
import { getClientLogo } from "../../../services/api_clients";
import { format } from "crypto-js";

/* ================= GRID HELPERS ================= */
const grid = (cols = 12, margin = 10, pageWidth = 280, gap = 2) => {
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

/* ================= BUILD PDF ================= */
export const buildIVAPDF = async (comprobante_id) => {
  // Obtener datos desde la API
  const data = await getRetencionIVA(comprobante_id);
  if (!data) return;

  if (data.empresa.logo_url){
    var cliente_id = data.empresa.logo_url.split('/')[3]
    data.empresa.logo_base64 = await getClientLogo(cliente_id);
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const g = grid();
  let y = 12;
  const h = 15;
  const vGap = g.vGap;

  const cabecera = data.cabecera;
  const agente = data.agente_retencion;
  const sujeto = data.sujeto_retenido;
  const detalle = data.detalle || [];
  const totales = data.totales;
  const firmas = data.firmas;
  const legal = data.legal;

  /* ================= PRIMERA FILA CENTRADA ================= */
  const col12 = g.col(0, 12);
  let yTitle = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("COMPROBANTE DE RETENCIÓN DEL IMPUESTO AL VALOR AGREGADO I.V.A", col12.x + col12.w/2, yTitle, { align: "center" });
  yTitle += 6;

  doc.setFontSize(8);
  doc.text(legal.providencia, col12.x + col12.w/2, yTitle, { align: "center" });
  yTitle += 6;

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  if (legal.articulo) {
    doc.text(legal.articulo, col12.x + col12.w/2, yTitle, { maxWidth: col12.w, align: "center" });
  }
  y = yTitle + 8;

  /* ================= NRO COMPROBANTE Y FECHA ================= */
  const col7 = g.col(0, 7);
  const col5 = g.col(7, 5);
  const boxWidth = 50;
  const boxHeight = 15;
  const gap = 5;

  const startX = col5.x;
  box(doc, startX, y, boxWidth, boxHeight);
  text(doc, "0. NRO. COMPROBANTE", startX + 2, y + 4, 7);
  text(doc, cabecera.numero_comprobante, startX + boxWidth / 2, y + 11, 9, "center");

  const x2 = startX + boxWidth + gap;
  box(doc, x2, y, boxWidth, boxHeight);
  text(doc, "1. FECHA EMISIÓN", x2 + 2, y + 4, 7);
  text(doc, formatDate(cabecera.fecha_emision), x2 + boxWidth / 2, y + 11, 9, "center");

  y += boxHeight + vGap;

  /* ================= DATOS AGENTE Y SUJETO ================= */
  const colAgente = g.col(0, 5);
  const colRif = g.col(5, 5);
  const colPeriodo = g.col(10, 2);

  box(doc, colAgente.x, y, colAgente.w, h);
  text(doc, "2. NOMBRE O RAZÓN SOCIAL DEL AGENTE DE RETENCIÓN", colAgente.x + 2, y + 4, 7);
  text(doc, agente.nombre_razon_social, colAgente.x + 2, y + 11);

  box(doc, colRif.x, y, colRif.w, h);
  text(doc, "3. REGISTRO DE INFORMACIÓN FISCAL DEL AGENTE DE RETENCIÓN", colRif.x + 2, y + 4, 7);
  text(doc, agente.rif, colRif.x + 2, y + 11);

  box(doc, colPeriodo.x, y, colPeriodo.w, h);
  text(doc, "4. PERIODO FISCAL", colPeriodo.x + 2, y + 4, 7);
  text(doc, `AÑO: ${cabecera.anio_fiscal} / MES: ${cabecera.mes_fiscal}`, colPeriodo.x + colPeriodo.w / 2, y + 11, 9, "center");

  y += h + vGap;

  // Dirección agente
  const colDirAgente = g.col(0, 12);
  box(doc, colDirAgente.x, y, colDirAgente.w, h - 5);
  text(doc, "5. DIRECCIÓN FISCAL DEL AGENTE DE RETENCIÓN: " + (agente.direccion_fiscal || ""), colDirAgente.x + 2, y + 5);
  y += h;

  // Sujeto retenido
  const colSujeto = g.col(0, 6);
  const colRifSujeto = g.col(6, 6);
  box(doc, colSujeto.x, y, colSujeto.w, h);
  text(doc, "6. NOMBRE SUJETO RETENIDO", colSujeto.x + 2, y + 4, 7);
  text(doc, sujeto.nombre_razon_social, colSujeto.x + 2, y + 11);

  box(doc, colRifSujeto.x, y, colRifSujeto.w, h);
  text(doc, "7. REGISTRO DE INFORMACIÓN FISCAL DEL SUJETO RETENIDO (R.I.F.)", colRifSujeto.x + 2, y + 4, 7);
  text(doc, sujeto.rif, colRifSujeto.x + 2, y + 11);
  y += h + vGap;

  // Dirección sujeto
  const colDirSujeto = g.col(0, 12);
  box(doc, colDirSujeto.x, y, colDirSujeto.w, h - 5);
  text(doc, "8. DIRECCIÓN FISCAL DEL SUJETO RETENIDO: " + (sujeto.direccion_fiscal || ""), colDirSujeto.x + 2, y + 5);
  y += h;

  /* ================= TABLA DE RETENCIONES ================= */
  const tableData = detalle.map(d => [
    d.oper_nro,
    formatDate(d.fecha),
    d.nro_factura,
    d.nro_control,
    d.nro_nota_debito,
    d.nro_nota_credito,
    d.tipo_transaccion,
    d.nro_documento_afectado,
    formatDecimal(d.total_compras_con_iva),
    formatDecimal(d.compras_sin_derecho_a_credito),
    formatDecimal(d.base_imponible),
    d.porcentaje_alicuota,
    formatDecimal(d.impuesto_iva),
    formatDecimal(d.iva_retenido)
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
        "Oper N°",
        "Fecha",
        "N° Factura",
        "N° Control",
        "N° Nota de Débito",
        "N° Nota de Crédito",
        "Tipo de Trans.",
        "N° Documento Afectado",
        "Total Compras con I.V.A.",
        "Compras sin Derecho a Crédito",
        "Base Imponible",
        "% Alic.",
        "Impuesto I.V.A.",
        "I.V.A. Retenido"
    ]],
    body: tableData,
    foot: [[
        "", 
        "", 
        "", 
        "", 
        "", 
        "", 
        "", 
        "", 
        formatDecimal(totales.total_compras_con_iva),
        formatDecimal(totales.compras_sin_derecho_a_credito),
        formatDecimal(totales.base_imponible), 
        "", 
        formatDecimal(totales.impuesto_iva),
        formatDecimal(totales.iva_retenido)
    ]],
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8 },
    headStyles: { fillColor: [220,220,220], textColor:0, fontStyle:"bold", halign:"center", valign:"middle" },
    footStyles: { fillColor:[240,240,240], textColor:0, fontStyle:"bold", halign:"right" },
    columnStyles: { 8: {halign:'right'}, 9:{halign:'right'}, 10:{halign:'right'}, 11:{halign:'center'}, 12:{halign:'right'}, 13:{halign:'right'} },
    margin: { left: g.col(0,12).x, right: 10 },
    tableWidth: g.col(0,12).w
  });

  /* ================= PIE DE PÁGINA ================= */
  const footerHeight = 20;
  const footerTop = doc.internal.pageSize.height - footerHeight;
  const colFirmaAgente = g.col(0,6);
  const colFechaEntrega = g.col(6,6);
  const colComprobante = g.col(0,12);
  const lineHeight = 6;

  // Firmas en una misma línea
  const yFirmas = footerTop + 2;
  text(doc, "Firma del Agente de Retención: _________________________", colFirmaAgente.x + 2, yFirmas, 8);
  text(doc, "Firma del Sujeto Retenido: _________________________", colFechaEntrega.x + 2, yFirmas, 8);

  // Fechas alineadas debajo de cada firma
  const yFechas = yFirmas + lineHeight;
  text(doc, `Fecha de Entrega: ${formatDate(firmas.fecha_entrega) || "_____/_____/______"}`, colFirmaAgente.x + 2, yFechas, 8);
  text(doc, `Fecha de Recepción: ${formatDate(firmas.fecha_recepcion) || "_____/_____/______"}`, colFechaEntrega.x + 2, yFechas, 8);

  // Texto legal en negrita debajo de las firmas
  doc.setFontSize(7);
  doc.setFont("helvetica","bold");
  doc.text(
    legal.articulo,
    colComprobante.x + 2,
    yFechas + lineHeight + 2,
    { maxWidth: colComprobante.w, align:"left" }
  );

  /* ================= GUARDAR PDF ================= */
  doc.save(`RET_IVA_${cabecera.numero_comprobante}.pdf`);
};