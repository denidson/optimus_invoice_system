import { buildDispacheGuidesPDF } from "./dispacheGuidesPDF";
import { documentsDispatchGuide } from "../../../services/apiDispatchGuide";
import { getClientLogo } from "../../../services/api_clients";
import { toast, ToastContainer } from "react-toastify";

export const generateDispatchGuidePDF = async (dispatchGuideId) => {
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
    await buildDispacheGuidesPDF(data);
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};