import { buildIVAPDF } from "./ivaPDF";
import { buildISLRPDF } from "./islrPDF";
import { showWithholding } from "../../../services/apiWithholdings";

/**
 * Genera PDF de factura.
 * @param {string} invoiceId - ID de la factura
 * @param {"download"|"view"} mode - "download" para descargar, "view" para visor
 */
export const generateWithholdingPDF = async (withholdingId, mode = "download", type_ret = false) => {
  try {
    if (type_ret == 'ISLR'){
      return await buildISLRPDF(withholdingId, withholdingId, mode);
    }else if (type_ret == 'IVA'){
      return await buildIVAPDF(withholdingId, withholdingId, mode);
    }else{
      const data = await showWithholding(withholdingId);
      if (!data?.items?.length) {
        console.warn("Retención sin items");
        return;
      }

      // detectar tipo por primer item
      const codigo =
        data.items[0]?.tipo_retencion?.codigo_seniat || "";

      if (codigo.includes("IVA")) {
        return await buildIVAPDF(data.numero_comprobante, withholdingId, mode);
      } else {
        return await buildISLRPDF(data.numero_comprobante, withholdingId, mode);
      }
    }
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};