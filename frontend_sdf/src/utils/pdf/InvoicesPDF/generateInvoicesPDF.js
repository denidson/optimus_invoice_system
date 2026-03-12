import { buildInvoicesPDF } from "./invoicesPDF";
import { showDocument } from "../../../services/api_invoices";
import { getClientLogo } from "../../../services/api_clients";
import { toast, ToastContainer } from "react-toastify";

/**
 * Genera PDF de factura.
 * @param {string} invoiceId - ID de la factura
 * @param {"download"|"view"} mode - "download" para descargar, "view" para visor
 */
export const generateInvoicesPDF = async (invoiceId, mode = "download") => {
  try {
    const data = await showDocument(invoiceId);
    if (!data?.items?.length) {
      toast.info(`El documento ${data.documento.numero_factura} no presenta lineas asociadas.`);
      return;
    }

    if (data.emisor.logo_url) {
      const cliente_id = data.emisor.logo_url.split("/")[3];
      data.emisor.logo_base64 = await getClientLogo(cliente_id);
    }

    return await buildInvoicesPDF(data, invoiceId, mode);
  } catch (err) {
    console.error("Error generando PDF", err);
    toast.error("Error generando PDF");
  }
};