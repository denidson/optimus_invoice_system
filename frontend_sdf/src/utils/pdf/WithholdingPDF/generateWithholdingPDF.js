import { buildIVAPDF } from "./ivaPDF";
import { buildISLRPDF } from "./islrPDF";
import { showWithholding } from "../../../services/apiWithholdings";

export const generateWithholdingPDF = async (withholdingId) => {
  try {
    const data = await showWithholding(withholdingId);

    if (!data?.items?.length) {
      console.warn("Retención sin items");
      return;
    }

    // detectar tipo por primer item
    const codigo =
      data.items[0]?.tipo_retencion?.codigo_seniat || "";

    if (codigo.includes("IVA")) {
      await buildIVAPDF(data.numero_comprobante);
    } else {
      await buildISLRPDF(data.numero_comprobante);
    }
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};