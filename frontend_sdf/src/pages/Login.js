import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginRequest, forgotPassword } from "../services/authService";
import registerBg from "../assets/img/register_bg_2.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Forgot password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState(null);
  const [loadingForgot, setLoadingForgot] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginRequest(email, password);

      const userData = {
        token: data.token,
        expires_in: data.expires_in,
        ...data.usuario,
      };

      login(userData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Credenciales inválidas");
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    setForgotMessage(null);

    try {
      const response = await forgotPassword(forgotEmail);
      setForgotMessage(
        response.mensaje || "Revisa tu correo para continuar."
      );
    } catch (err) {
      setForgotMessage("No se pudo procesar la solicitud.");
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <main>
      <section className="absolute w-full h-full">
        {/* Background */}
        <div
          className="absolute top-0 w-full h-full bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${registerBg})` }}
        ></div>

        <span className="absolute w-full h-full bg-slate-900 opacity-50"></span>

        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
              {/* Login card */}
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-200 border-0">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center mb-3">
                    <h6 className="text-slate-500 text-sm font-bold">
                      Ingrese sus credenciales
                    </h6>
                  </div>
                  <hr className="mt-6 border-b-1 border-slate-300" />
                </div>

                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-slate-600 text-xs font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-slate-600 text-xs font-bold mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs italic mb-4">
                        {error}
                      </p>
                    )}

                    <div className="text-center mt-6">
                      <button
                        type="submit"
                        className="bg-slate-800 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg w-full"
                      >
                        Entrar
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex flex-wrap mt-6 relative">
                <div className="w-full text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-white text-sm underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4">
              Recuperar contraseña
            </h2>

            <form onSubmit={handleForgotPassword}>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                placeholder="tu@email.com"
              />

              {forgotMessage && (
                <div className="mt-4 px-4 py-3 rounded border-l-4 border-blue-500 bg-blue-100 text-blue-700">
                  {forgotMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage(null);
                  }}
                  className="px-4 py-2 text-sm bg-slate-300 rounded"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loadingForgot}
                  className="px-4 py-2 text-sm bg-slate-800 text-white rounded"
                >
                  {loadingForgot ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
