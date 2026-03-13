import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { box, text, grid, labelValue, textWrap } from "../pdfDraw";
import { formatDate, formatDecimal, formatText } from "../../formatters";
import { getRetencionISLR } from "../../../services/apiWithholdings";
import { getClientLogo } from "../../../services/api_clients";
import exampleLogo from "../../../assets/img/react.jpg";
import QRCode from "qrcode";
import { encryptText } from '../../../services/api';

/* ================================================= */
export const buildISLRPDF = async (comprobante_id, withholdingId, mode = "download") => {

  const data = await getRetencionISLR(comprobante_id);
  if (!data) return;

  if (data.empresa.logo_url){
    var cliente_id = data.empresa.logo_url.split('/')[3]
    data.empresa.logo_base64 = await getClientLogo(cliente_id);
  }

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

  /* ---------- QR ---------- */

  const baseUrl = window.location.origin;

  const qrUrl = `${baseUrl}/document/RETISLR/${encodeURIComponent(encryptText(withholdingId.toString()))}/`;

  const qrBase64 = await QRCode.toDataURL(qrUrl, {
    width: 120,
    margin: 1
  });
  const qrSize = 25;
  doc.addImage(
    qrBase64,
    "PNG",
    colRight.x + colRight.w - 28,
    y + 2.5,
    qrSize,
    qrSize
  );

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
    rightX - 15,
    y + 7
  );

  labelValue(
    doc,
    "Fecha Emisión",
    formatDate(cabecera.fecha_emision),
    rightX - 15,
    y + 12
  );

  y += headerHeight + 4;

  /* ================================================= */
  /* ========= PROVEEDOR / EMPRESA =================== */
  /* ================================================= */

  let hInfo = 24;
  const colLeft = g.col(0, 6);
  const colRightInfo = g.col(6, 6);
  let yLn = 1;
  var yPro = textWrap(
    doc,
    "                    " + formatText(proveedor_beneficiario.direccion2) || "",
    0, // X no importa para medir
    0,
    colLeft.x + 2,
    7,
    "justify",
    false,
    5,
    true // measureOnly
  );
  var yEmp = textWrap(
    doc,
    "                    " + formatText(empresa.direccion2) || "",
    0, // X no importa para medir
    0,
    colRightInfo.x + 2,
    7,
    "justify",
    false,
    5,
    true // measureOnly
  );
  if (yPro > yEmp){
    yLn = (yPro / 2);
    hInfo = hInfo - 5 + yPro;
  }
  if (yEmp > yPro){
    yLn = (yEmp / 2);
    hInfo = hInfo - 5 + yEmp;
  }
  console.log('yPro: ', yPro);
  console.log('yEmp: ', yEmp);

  // Proveedor
  box(doc, colLeft.x, y, colLeft.w, hInfo);

  text(doc, "Proveedor/Beneficiario:", colLeft.x + 2, y + 5, 8, "left", true);
  text(doc, formatText(proveedor_beneficiario.nombre), colLeft.x + 2, y + 10);
  labelValue(
    doc,
    "RIF",
    formatText(proveedor_beneficiario.rif),
    colLeft.x + 2,
    y + 15
  );
  labelValue(
    doc,
    "Dirección",
    "",
    colLeft.x + 2,
    y + 20
  );

  textWrap(
    doc,
    "                         " + formatText(proveedor_beneficiario.direccion) || "",
    colLeft.x + 2, // X no importa para medir
    y + 20,
    colLeft.w - 3,
    7,
    "justify",
    false,
    5
  );

  // Empresa
  box(doc, colRightInfo.x, y, colRightInfo.w, hInfo);

  text(doc, "Empresa:", colRightInfo.x + 2, y + 5, 8, "left", true);
  text(doc, formatText(empresa.nombre), colRightInfo.x + 2, y + 10);
  labelValue(
    doc,
    "RIF",
    formatText(empresa.rif),
    colRightInfo.x + 2,
    y + 15
  );
  labelValue(
    doc,
    "Dirección",
    "",
    colRightInfo.x + 2,
    y + 20
  );

  textWrap(
    doc,
    "                         " + formatText(empresa.direccion) || "",
    colRightInfo.x + 2, // X no importa para medir
    y + 20,
    colRightInfo.w - 3,
    7,
    "justify",
    false,
    5
  );

  y += hInfo + (yLn * 5);

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
  /* ================= GUARDAR PDF ================= */
  const pdfBlob = doc.output("blob");
  if(mode === "download"){
    doc.save(`RET_ISLR_${cabecera.numero_comprobante}.pdf`);
  } else {
    return URL.createObjectURL(pdfBlob);
  }
};