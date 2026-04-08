import React, { useState, useEffect, useMemo, useRef } from "react";
import { formatDecimal, formatMoney, formatDateTime, formatText, formatDate } from "../../utils/formatters";
import { generateInvoicesPDF } from "../../utils/pdf/InvoicesPDF/generateInvoicesPDF";
import { Tabs, Tab, Box } from "@mui/material";
import InvoiceDetailView from "./InvoiceDetailView";

function ModalPreinvoices({ isOpen, onClose, message }) {
  const [viewMode, setViewMode] = useState("detalle");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [tab, setTab] = useState("FC");
  const [tabDv, setTabDv] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setViewMode("detalle");
      setPdfUrl(null);
    }
  }, [isOpen]);

  const handleViewPDF = async () => {
    try {
      setLoadingPdf(true);

      let url;
      url = await generateInvoicesPDF(message.id, "view");
      setPdfUrl(url);
      setViewMode("pdf");

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPdf(false);
    }
  };

  if (!isOpen) return null;
  const hasNotaDebitoItems =
    message?.tipo_documento === "ND" &&
    message?.nota_debito_detalle?.items?.length > 0 && !message?.nota_debito_detalle?.items[0].producto;
  //console.log('hasNotaDebitoItems: ', hasNotaDebitoItems);
  var itemsList;
  if (message.tipo_documento == 'ND' && message.nota_debito_detalle?.items?.length > 0){
    itemsList = message.nota_debito_detalle?.items;
  }else if (message.tipo_documento == 'NC' && message.nota_credito_detalle?.items?.length > 0){
    itemsList = message.nota_credito_detalle?.items;
  }else{
    itemsList = message.items;
  }
  //console.log('message: ', message);
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[1200px] max-h-[90vh] overflow-y-auto relative p-6">
        {/* Header */}
        <div className="text-center mb-0">
          <div className="flex justify-between items-center mb-4">
            <h6 className="text-xl font-bold">
              Detalles de la {(message.tipo_documento == 'FC' ? 'Factura' : (message.tipo_documento == 'ND' ? 'Nota de Débito' : 'Nota de Crédito') )}
            </h6>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={handleViewPDF}
              >
                Ver PDF
              </button>

              {viewMode === "pdf" && (
                <button
                  className="bg-gray-500 text-white px-4 py-1 rounded"
                  onClick={() => setViewMode("detalle")}
                >
                  Volver
                </button>
              )}
            </div>
          </div>
          {message.tipo_documento == 'FC' && viewMode === "detalle" && (
            <div className="w-full lg:w-12/12 m-0 p-0 text-center">
              <hr class="my-0 border-b-1 border-blueGray-300"/>
              <Tabs value={tab} textColor="primary" indicatorColor="primary" centered onChange={(e, v) => {
                setTab(v);
                if (tabDv == false){
                  if (v == 'DV' && message.documentos_vinculados && message.documentos_vinculados.length > 0){
                    setTabDv(message.documentos_vinculados[0].id);
                  }
                }
              }}>
                <Tab value="FC" label="Factura" />
                <Tab value="DV" label="Documentos vinculados" />
              </Tabs>
            </div>
          )}
          <hr className="my-4 border-b border-blueGray-300"/>
        </div>
        {tab === "FC" && viewMode === "detalle" && (
          <InvoiceDetailView message={message} />
        )}

        {tab === "DV" && viewMode === "detalle" && (
          message.documentos_vinculados?.length > 0 ? (
            <>
              <div className="w-full lg:w-12/12 mb-3 p-0 text-center">
                <Tabs class="mb-3" value={tabDv} onChange={(e, v) => setTabDv(v)} centered>
                  {message.documentos_vinculados.map(item => (
                    <Tab
                      key={item.id}
                      value={item.id}
                      label={`${item.tipo_documento === 'NC' ? 'NOTA DE CREDITO' : 'NOTA DE DEBITO'} - ${item.numero_control}`}
                    />
                  ))}
                </Tabs>
              </div>

              {/* 🔥 Aquí reutilizas el mismo componente */}
              {tabDv && (
                <InvoiceDetailView
                  message={
                    message.documentos_vinculados.find(doc => doc.id === tabDv)
                  }
                />
              )}
            </>
          ) : (
            <div className="text-center py-2">
              No presenta documentos vinculados
            </div>
          )
        )}

        {viewMode === "pdf" && (
          <div className="w-full h-[80vh]">
            {loadingPdf ? (
              <div className="text-center mt-10">Generando PDF...</div>
            ) : (
              <iframe
                src={`${pdfUrl}#toolbar=0`} //src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="PDF Viewer"
              />
            )}
          </div>
        )}
        {/* Botón Cancelar */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreinvoices;
