import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import registerBg from "../assets/img/register_bg_2.png";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ nombre, rol: "admin" });
    navigate("/dashboard");
  };

  return (
    <>
      <main>
        <section className="absolute w-full h-full">
          {/* Imagen de fondo */}
          <div
            className="absolute top-0 w-full h-full bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${registerBg})`,
            }}
          ></div>

          {/* Overlay oscuro */}
          <span className="absolute w-full h-full bg-slate-900 opacity-50"></span>

          {/* Contenedor del formulario */}
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
                          Nombre de usuario
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          required
                        />
                      </div>

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
    </>
  );
}
