import { buildInvoicesPDF } from "./invoicesPDF";
import { showDocument } from "../../../services/api_invoices";
import { toast, ToastContainer } from "react-toastify";

export const generateInvoicesPDF = async (invoiceId) => {
  try {
    const data = await showDocument(invoiceId);
    console.log('generateInvoicesPDF: ', data);
    if (!data?.items?.length) {
      console.warn("Documento sin lineas");
      toast.info("El documento " + data.documento.numero_factura +" no presenta lineas asociadas.");
      return;
    }
    await buildInvoicesPDF(data);
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};