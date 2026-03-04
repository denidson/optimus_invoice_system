import { buildInvoicesPDF } from "./invoicesPDF";
import { showDocument } from "../../../services/api_invoices";

export const generateInvoicesPDF = async (invoiceId) => {
  try {
    const data = await showDocument(invoiceId);
    console.log('generateInvoicesPDF: ', data);
    if (!data?.items?.length) {
      console.warn("Documento sin lineas");
      return;
    }
    await buildInvoicesPDF(data);
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};