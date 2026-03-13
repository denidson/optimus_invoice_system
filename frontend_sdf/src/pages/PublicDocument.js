import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generateInvoicesPDF } from "../utils/pdf/InvoicesPDF/generateInvoicesPDF";
import { decryptText } from "../services/api";

const PublicDocument = () => {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const loadPDF = async () => {
      const url = await generateInvoicesPDF(decryptText(id), "view"); // genera PDF para ver
      setPdfUrl(url);
    };
    loadPDF();
  }, [id]);

  if (!pdfUrl) return <div>Cargando documento...</div>;

  return (
    <div
      style={{
        padding: 10,
        height: "100vh",       // altura completa del navegador
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
      }}
    >
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        title="Factura Pública"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default PublicDocument;