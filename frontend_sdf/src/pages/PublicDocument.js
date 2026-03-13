import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generateInvoicesPDF } from "../utils/pdf/InvoicesPDF/generateInvoicesPDF";
import { generateDispatchGuidePDF } from "../utils/pdf/DispacheGuidesPDF/generateDispacheGuidesPDF";
import { generateWithholdingPDF } from "../utils/pdf/WithholdingPDF/generateWithholdingPDF";
import { decryptText } from "../services/api";

const PublicDocument = () => {
  const { type } = useParams();
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const loadPDF = async () => {
      var url;
      if (type == 'INV'){
        url = await generateInvoicesPDF(decryptText(id), "view"); // genera PDF para ver
      }else if (type == 'RET'){
        url = await generateWithholdingPDF(decryptText(id), "view"); // genera PDF para ver
      }else{
        url = await generateDispatchGuidePDF(decryptText(id), "view"); // genera PDF para ver
      }
      console.log('url: ', url)
      setPdfUrl(url);
    };
    loadPDF();
  }, [id]);
  var title='';
  if (type == 'INV'){
    title = "Factura Pública"
  }else if (type == 'RET'){
    title = "Retención Pública"
  }else{
    title = "Guía de despacho Pública"
  }

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
        title={title}
        style={{ border: "none" }}
      />
    </div>
  );
};

export default PublicDocument;