import { buildDispacheGuidesPDF } from "./dispacheGuidesPDF";
import { documentsDispatchGuide } from "../../../services/apiDispatchGuide";
import { toast, ToastContainer } from "react-toastify";

export const generateDispatchGuidePDF = async (dispatchGuideId) => {
  try {
    const data = await documentsDispatchGuide(dispatchGuideId);
    await buildDispacheGuidesPDF(data);
  } catch (err) {
    console.error("Error generando PDF", err);
  }
};