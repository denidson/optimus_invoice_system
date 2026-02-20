import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactDOM from "react-dom";

import Logo from "../../assets/img/Quantus-Invoice.png";
import LogoCollapse from "../../assets/img/Quantus-Invoice3.png";
import { AuthContext } from "../../context/AuthContext";

/* ================= TOOLTIP ================= */

function Tooltip({ targetRef, text, visible }) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetRef?.current && visible) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [targetRef, visible]);

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
        backgroundColor: "#112c55",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "0.85rem",
        zIndex: 9999,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>,
    document.body
  );
}

/* ================= SIDEBAR ================= */

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const rol = user?.rol || "";

  const [tooltip, setTooltip] = useState({
    text: "",
    visible: false,
    ref: null,
  });

  const isActive = (path) => location.pathname.includes(path);

  const menuSections = [
    {
      heading: "Inicio",
      links: [
        { to: "/dashboard", icon: "fas fa-tv", label: "Panel de Control" },
      ],
    },
    {
      heading: "Documentos Legales",
      links: [
        { to: "/proformas", icon: "fas fa-file-import", label: "Proformas" },
        { to: "/invoices", icon: "fas fa-file-invoice", label: "Facturas" },
        { to: "/credit-note", icon: "fas fa-file-invoice", label: "Notas de Crédito" },
        { to: "/debit-note", icon: "fas fa-file-invoice", label: "Notas de Débito" },
        { to: "/withholdings", icon: "fas fa-file-invoice", label: "Retenciones" },
        { to: "/dispatch-guide", icon: "fas fa-file-invoice", label: "Guía de despacho" },
      ],
    },
    {
      heading: "Configuración",
      links: [
        { to: "/clients", icon: "fas fa-users", label: "Clientes", roles: ["admin"] },
        { to: "/endClients", icon: "fas fa-users", label: "Clientes", roles: ["operador_admin", "operador"] },
        { to: "/products", icon: "fas fa-cubes", label: "Producto/Servicio", roles: ["admin", "operador_admin", "operador"] },
        { to: "/taxpayer", icon: "fas fa-tags", label: "Tipos de Contribuyentes", roles: ["admin", "operador_admin"] },
        { to: "/taxes", icon: "fas fa-percent", label: "Impuestos", roles: ["admin", "operador_admin"] },
        { to: "/config-withholdings", icon: "fas fa-percent", label: "Retenciones", roles: ["admin", "operador_admin"] },
        { to: "/auditlogs", icon: "fa-solid fa-list-ul", label: "Registro de auditoria", roles: ["admin"] },
        { to: "/company-users", icon: "fas fa-users", label: "Usuarios", roles: ["operador_admin"] },
      ],
    },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 h-screen
        bg-white shadow-xl z-30 py-4
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "md:w-20" : "md:w-64"}
        w-64
      `}
    >
      <div className={`${collapsed ? "px-2" : "px-6"} h-full flex flex-col`}>

        {/* ================= LOGO ================= */}
        <div className="flex items-center justify-between">

          <Link to="/dashboard" className="block py-4 w-full">
            <div className="relative flex items-center justify-center h-16">

              {/* Logo expandido */}
              <img
                src={Logo}
                alt="Logo"
                className={`
                  absolute transition-opacity duration-300 ease-in-out
                  ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
                `}
                style={{ width: 160 }}
              />

              {/* Logo colapsado */}
              <img
                src={LogoCollapse}
                alt="Logo"
                className={`
                  absolute transition-opacity duration-300 ease-in-out
                  ${collapsed ? "opacity-100" : "opacity-0 pointer-events-none"}
                `}
                style={{ width: 40 }}
              />

            </div>
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-slate-500 hover:text-twilight-indigo-500 ml-2"
          >
            <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
          </button>
        </div>

        {/* ================= MENU ================= */}
        <div className="flex-1 mt-4 overflow-y-auto sidebar-scroll">

          {menuSections.map((section) => {
            const visibleLinks = section.links.filter(
              (link) => !link.roles || link.roles.includes(rol)
            );
            if (!visibleLinks.length) return null;

            return (
              <div key={section.heading}>
                <hr className="my-4 border-slate-200" />

                {!collapsed && (
                  <h6 className="text-slate-500 text-xs uppercase font-bold pb-4">
                    {section.heading}
                  </h6>
                )}

                <ul className="flex flex-col pb-6">
                  {visibleLinks.map((link) => {
                    const active = isActive(link.to);
                    const linkRef = useRef(null);

                    return (
                      <li key={link.to} className="relative">

                        <Link
                          to={link.to}
                          ref={linkRef}
                          onMouseEnter={() =>
                            collapsed &&
                            setTooltip({
                              text: link.label,
                              visible: true,
                              ref: linkRef,
                            })
                          }
                          onMouseLeave={() =>
                            setTooltip({
                              text: "",
                              visible: false,
                              ref: null,
                            })
                          }
                          className={`
                            flex items-center
                            ${collapsed ? "justify-center px-2" : "gap-3 px-4"}
                            py-3 text-xs uppercase font-bold
                            w-full h-12 mb-1
                            transition-colors duration-150
                            rounded-lg
                            ${
                              active
                                ? "bg-twilight-indigo-100 text-twilight-indigo-700"
                                : "text-slate-700 hover:bg-twilight-indigo-50 hover:text-twilight-indigo-700"
                            }
                          `}
                        >
                          <i className={`${link.icon} text-sm w-5 text-center`} />
                          {!collapsed && <span>{link.label}</span>}
                        </Link>

                        {tooltip.ref === linkRef && (
                          <Tooltip
                            targetRef={linkRef}
                            text={tooltip.text}
                            visible={tooltip.visible}
                          />
                        )}

                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}