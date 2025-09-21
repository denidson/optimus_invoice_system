import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginRequest } from "../services/authService";
import registerBg from "../assets/img/register_bg_2.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginRequest(email, password);

      // Guardamos token y usuario directamente en el estado
      const userData = {
        token: data.token,
        ...data.usuario,
      };

      login(userData);

      // Guardamos en localStorage para persistencia
      localStorage.setItem("authData", JSON.stringify(userData));

      // Redirigimos al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Credenciales inválidas");
    }
  };

  return (
    <main>
      <section className="absolute w-full h-full">
        <div
          className="absolute top-0 w-full h-full bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${registerBg})` }}
        ></div>

        <span className="absolute w-full h-full bg-slate-900 opacity-50"></span>

        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
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
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-slate-600 text-xs font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>

                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-slate-600 text-xs font-bold mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs italic">{error}</p>
                    )}

                    <div className="text-center mt-6">
                      <button
                        className="bg-slate-800 text-white active:bg-slate-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
                        type="submit"
                      >
                        Entrar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex flex-wrap mt-6 relative">
                <div className="w-full text-center">
                  <a href="#" className="text-slate-200">
                    <small>¿Olvidaste tu contraseña?</small>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
