import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState(tokenFromUrl || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await resetPassword(token, password);
      setMessage(response.mensaje);

      // Redirigir al login después de 2s
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("No se pudo reestablecer la contraseña");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-center">
          Reestablecer contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          {!tokenFromUrl && (
            <input
              type="text"
              placeholder="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded"
              required
            />
          )}

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm mb-3">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
