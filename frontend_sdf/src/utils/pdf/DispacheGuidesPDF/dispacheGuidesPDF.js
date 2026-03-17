import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { box, text, grid, boxCustom, line, textWrap, labelValue } from "../pdfDraw";
import { formatDate, formatDecimal, formatText, formatMoney, formatDecimalSpecial } from "../../formatters";
import exampleLogo from "../../../assets/img/react.jpg";
import QRCode from "qrcode";
import { encryptText } from '../../../services/api';

/* ================================================= */
export const buildDispacheGuidesPDF = async (data, dispacheGuideId, mode = "download") => {

  //const data = await getRetencionISLR(comprobante_id);
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
    documento,
    emisor,
    destinatario,
    items,
    totales,
    transporte,
    referencia_factura,
    legal
  } = data;

  /* ================================================= */
  /* ================= HEADER ======================== */
  /* ================================================= */

  const headerHeight = 30;

  const colLogo = g.col(0, 2);
  const colRender = g.col(3, 1);
  const colCenter = g.col(4, 3);
  const colRight = g.col(7, 4);
  const colQr = g.col(10, 2);

  // BORDE GENERAL (único)
  box(doc, col12.x, y, col12.w, headerHeight);

  /* ---------- LOGO ---------- */

  const logoY = y + 3;
  const logoH = headerHeight - 6;

  const logoImage = emisor?.logo_base64 || exampleLogo;

  try {
    doc.addImage(
      logoImage,
      emisor?.logo_base64 ? "PNG" : "JPG",
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
      colLogo.x + 4,
      logoY,
      colLogo.w - 4,
      logoH
    );
  }

  /* ---------- QR ---------- */

  const baseUrl = window.location.origin;

  const qrUrl = `${baseUrl}/document/DG/${encodeURIComponent(encryptText(dispacheGuideId.toString()))}/`;

  const qrBase64 = await QRCode.toDataURL(qrUrl, {
    width: 120,
    margin: 1
  });
  const qrSize = 17 + 3;
  doc.addImage(
    qrBase64,
    "PNG",
    colQr.x + 15,
    logoY,
    logoH,
    logoH
  );

  /* ---------- CENTRO ---------- */

  text(
    doc,
    formatText("Guía de despacho"),
    colCenter.x + colCenter.w / 2,
    y + 10,
    11,
    "center",
    true
  );

  if (documento.numero_guia){
    text(
      doc,
      formatText(documento.numero_guia),
      colCenter.x + colCenter.w / 2,
      y + 16,
      11,
      "center",
      true
    );
  }

  text(
    doc,
    `Fecha de emisión: ${formatDate(referencia_factura.fecha_emision)}`,
    colCenter.x + colCenter.w / 2,
    y + ((documento.numero_guia == "" || documento.numero_guia == null) ? 16 : 22),
    9,
    "center"
  );

  /* ---------- DERECHA (SIN CAJAS) ---------- */

  const rightX = colRight.x + 2;
  labelValue(
    doc,
    "Nº de control",
    formatText(documento.numero_control_guia) || "",
    rightX,
    y + 6
  );

  labelValue(
    doc,
    "Fecha de sálida",
    formatDate(documento.fecha_salida) + ' ' + formatText(documento.hora_salida),
    rightX,
    y + 11
  );

  labelValue(
    doc,
    "Nº de factura",
    referencia_factura.numero_factura,
    rightX,
    y + 16
  );

  labelValue(
    doc,
    "Nº de control factura",
    formatText(referencia_factura.numero_control),
    rightX,
    y + 21
  );

  labelValue(
    doc,
    "Fecha emisión",
    formatDate(referencia_factura.fecha_emision),
    rightX,
    y + 26
  );

  y += headerHeight + 4;

  /* ================================================= */
  /* ========= PROVEEDOR / EMPRESA =================== */
  /* ================================================= */

  const hInfo = 28;

  const colLeft = g.col(0, 4);
  const colCenterInfo = g.col(4, 4);
  const colRightInfo = g.col(8, 4);

  // Proveedor
  box(doc, colLeft.x, y, colLeft.w, hInfo);

  text(doc, "Proveedor/Beneficiario:", colLeft.x + 2, y + 5, 8, "left", true);
  text(doc, formatText(emisor.nombre_empresa), colLeft.x + 2, y + 9);
  //text(doc, `RIF: ${formatText(emisor.rif)}`, colLeft.x + 2, y + 15);
  labelValue(
    doc,
    "RIF",
    formatText(emisor.rif),
    colLeft.x + 2,
    y + 13
  );
  labelValue(
    doc,
    "Dirección",
    "",
    colLeft.x + 2,
    y + 17
  );

  textWrap(
    doc,
    "                    " + formatText(emisor.direccion || ""),
    colLeft.x + 2,
    y + 17,
    colLeft.w - 2,
    9,
    "justify",
    false,
    4
  );

  // Empresa
  box(doc, colCenterInfo.x, y, colCenterInfo.w, hInfo);

  text(doc, "Empresa:", colCenterInfo.x + 2, y + 5, 8, "left", true);
  text(doc, formatText(destinatario.nombre), colCenterInfo.x + 2, y + 9);
  //text(doc, `RIF: ${formatText(destinatario.rif)}`, colRightInfo.x + 2, y + 15);
  labelValue(
    doc,
    "RIF",
    formatText(destinatario.rif),
    colCenterInfo.x + 2,
    y + 13
  );
  labelValue(
    doc,
    "Dirección",
    "",
    colCenterInfo.x + 2,
    y + 17
  );

  textWrap(
    doc,
    "                    " + formatText(destinatario.direccion || ""),
    colCenterInfo.x + 2,
    y + 17,
    colCenterInfo.w - 2,
    9,
    "justify",
    false,
    4
  );

  // Info transporte
  box(doc, colRightInfo.x, y, colRightInfo.w, hInfo);

  text(doc, "Detalle del transporte:", colRightInfo.x + 2, y + 5, 8, "left", true);
  //text(doc, formatText(destinatario.nombre), colRightInfo.x + 2, y + 10);
  labelValue(
    doc,
    "Ubic. de origen",
    formatText(transporte.origen),
    colRightInfo.x + 2,
    y + 9
  );
  labelValue(
    doc,
    "Dir. de destino",
    "",
    colRightInfo.x + 2,
    y + 13
  );
  var trpY = y + 13;
  trpY = textWrap(
    doc,
    "                            " + formatText(transporte.destino || ""),
    colRightInfo.x + 2,
    trpY,
    colRightInfo.w - 2,
    9,
    "justify",
    false,
    4
  );
  labelValue(
    doc,
    "Motivo",
    formatText(transporte.motivo_traslado) || "",
    colRightInfo.x + 2,
    trpY
  );
  /*labelValue(
    doc,
    "Placa del vehículo",
    formatText(transporte.placa) || "",
    colRightInfo.x + 2,
    y + 25
  );*/

  y += hInfo + 5;

  /* ================================================= */
  /* ================= TABLA ========================= */
  /* ================================================= */

  const tableData = items.map(d => [
    formatText(d.descripcion),
    formatDecimal(d.cantidad),
    formatDecimalSpecial(d.peso_unitario_kg, 3),
    formatDecimalSpecial(d.masa_kg, 3),
    formatDecimal(d.capacidad),
    formatDecimalSpecial(d.volumen_unitario_m3, 4),
    formatDecimalSpecial(d.volumen, 4),
    formatText(d.unidad_medida),
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      "Descripción",
      "Cantidad",
      "Peso Unit. (Kg)",
      "Peso (Kg)",
      "Capacidad",
      "Volumen Unit. (M³)",
      "Volumen (M³)",
      "Unidad de medida",
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
        0: {halign:'left'},
        1: {halign:'center'}, 
        2: {halign:'center'}, 
        3:{halign:'center'}, 
        4:{halign:'center'},
        5:{halign:'center'}, 
        6:{halign:'center'},
        7:{halign:'center'},
    },
    margin: { left: col12.x, right: 10 },
    tableWidth: col12.w
  });

  /* ================================================= */
  /* ================= FOOTER ======================== */
  /* ================================================= */

  const footerHeight = 40;
  const footerTop = doc.internal.pageSize.height - footerHeight;

  labelValue(
    doc,
    "Total Neto",
    formatMoney(referencia_factura.total_neto),
    col12.x,
    footerTop - 10,
    9
  )

  labelValue(
    doc,
    "Nº de identificación del transportista",
    "   __________________________",
    col12.x,
    footerTop - 5,
    9
  )

  labelValue(
    doc,
    "Nombre del transportista",
    "                      " + (formatText(transporte.chofer) || "__________________________"),
    col12.x,
    footerTop,
    9
  );

  labelValue(
    doc,
    "Firma del transportista",
    "                          __________________________",
    col12.x,
    footerTop + 5,
    9
  );

  labelValue(
    doc,
    "Nº de identificación del receptor",
    "   __________________________",
    col12.x + 150,
    footerTop - 5,
    9
  )

  labelValue(
    doc,
    "Nombre del receptor",
    "                      __________________________",
    col12.x + 150,
    footerTop,
    9
  );

  labelValue(
    doc,
    "Firma del receptor",
    "                          __________________________",
    col12.x + 150,
    footerTop + 5,
    9
  );

  labelValue(
    doc,
    "Fecha de sálida",
    formatDate(documento.fecha_salida),
    col12.x,
    footerTop + 10,
    9
  );
  if (transporte.placa){
    labelValue(
      doc,
      "Placa del vehículo",
      "   " + formatText(transporte.placa),
      col12.x + 50,
      footerTop + 10,
      9
    );
  }

  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - (8 * 2);

  y = textWrap(
    doc,
    formatText(legal.leyenda),
    8,       // X inicial
    footerTop + 15,            // Y inicial
    maxWidth,     // ancho máximo
    6,            // tamaño fuente
    "center",     // alineación centrada
    false,          // negrita
    3
  );

  y = textWrap(
    doc,
    `Imprenta Digital Autorizada mediante Providencia Administrativa ${formatText(data.legal.providencia_descripcion) || "SENIAT/INTI/011"} de fecha ${formatDate(data.legal.providencia_fecha) || "10/11/2023"}.`,
    8,       // X inicial
    footerTop + 18,            // Y inicial
    maxWidth,     // ancho máximo
    6,            // tamaño fuente
    "center",     // alineación centrada
    false,          // negrita
    3
  );

  const pdfBlob = doc.output("blob");
  if(mode === "download"){
    doc.save(`GUIA_${documento.numero_guia || ""}.pdf`);
  } else {
    return URL.createObjectURL(pdfBlob);
  }
};