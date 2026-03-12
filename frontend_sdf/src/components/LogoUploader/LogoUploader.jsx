import React, { useRef } from "react";
import { toast } from "react-toastify";

export default function LogoUploader({ logo, onChange, size = 96, mode = "edit" }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result); // Devuelve base64 al componente padre
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-${size} h-${size} rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 ${
          mode === "edit" ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (mode === "edit") fileInputRef.current.click();
        }}
      >
        {logo ? (
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl font-semibold text-blue-600">
            ?
          </div>
        )}
      </div>

      {mode === "edit" && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500 mt-1">Click para cambiar imagen</p>
        </>
      )}
    </div>
  );
}