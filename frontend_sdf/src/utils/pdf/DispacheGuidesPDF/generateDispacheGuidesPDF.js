import { buildDispacheGuidesPDF } from "./dispacheGuidesPDF";
import { documentsDispatchGuide } from "../../../services/apiDispatchGuide";
import { getClientLogo } from "../../../services/api_clients";
import { toast, ToastContainer } from "react-toastify";

/**
 * Genera PDF de factura.
 * @param {string} invoiceId - ID de la factura
 * @param {"download"|"view"} mode - "download" para descargar, "view" para visor
 */
export const generateDispatchGuidePDF = async (dispatchGuideId, mode = "download") => {
  try {
    const data = await documentsDispatchGuide(dispatchGuideId);
    if (!data?.items?.length) {
      console.warn("Documento sin lineas");
      toast.info("El documento " + data.documento.numero_factura +" no presenta lineas asociadas.");
      return;
    }
    if (data.emisor.logo_url){
      var cliente_id = data.emisor.logo_url.split('/')[3]
      data.emisor.logo_base64 = await getClientLogo(cliente_id);
    }
    return await buildDispacheGuidesPDF(data, dispatchGuideId, mode);
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};