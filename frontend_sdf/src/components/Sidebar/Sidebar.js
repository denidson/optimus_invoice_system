/* eslint-disable */
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";

import NotificationDropdown from "../Dropdowns/NotificationDropdown.js";
import UserDropdown from "../Dropdowns/UserDropdown.js";
import Logo1 from "../../assets/img/logo1.png";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const rol = user?.rol || "";

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "text-sky-500 hover:text-sky-600 font-bold"
      : "text-slate-700 hover:text-slate-500";

  const menuSections = [
    {
      heading: "Inicio",
      links: [
        {
          to: "/dashboard",
          icon: "fas fa-tv",
          label: "Dashboard",
        },
      ],
    },
    {
      heading: "Facturación",
      links: [
        {
          to: "/preinvoices",
          icon: "fas fa-file-import",
          label: "Pre-Facturación",
        },
        {
          to: "/invoices",
          icon: "fas fa-file-invoice",
          label: "Facturación",
        },
      ],
    },
    // {
    //   heading: "Reportes",
    //   links: [
    //     {
    //       to: "/report",
    //       icon: "far fa-file-pdf",
    //       label: "Libro de Ventas",
    //     },
    //     {
    //       to: "/issued-invoices",
    //       icon: "far fa-file-pdf",
    //       label: "Facturas Emitidas",
    //     },
    //     {
    //       to: "/taxes-reported",
    //       icon: "far fa-file-pdf",
    //       label: "Impuestos Facturados",
    //     },
    //   ],
    // },
    {
      heading: "Configuración",
      links: [
        {
          to: "/clients",
          icon: "fas fa-users",
          label: "Clientes",
          roles: ["admin"]
        },
        // {
        //   to: "/partners",
        //   icon: "fas fa-cash-register",
        //   label: "Comercios",
        // },
        {
          to: "/products",
          icon: "fas fa-cubes",
          label: "Productos y Servicios",
          roles: ["operador"]
        },
        {
          to: "/taxpayer",
          icon: "fas fa-tags",
          label: "Tipos de Contribuyentes",
          roles: ["admin", "operador"]
        },
        {
          to: "/taxes",
          icon: "fas fa-percent",
          label: "Impuestos",
          roles: ["admin", "operador"]
        },
        {
          to: "/auditlogs",
          icon: "fa-solid fa-list-ul",
          label: "Registro de auditoria",
          roles: ["admin"]
        },
        // {
        //   to: "/settings",
        //   icon: "fas fa-shield",
        //   label: "Gestión de Seguridad",
        // },
      ],
    },
  ];

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-slate-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/"
          >
            <img src={Logo1} alt="Logo1" className="w-full h-full object-cover" />
          </Link>

          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>

          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-slate-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-slate-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/"
                  >
                    <img src={Logo1} alt="Logo1" className="w-8 h-8 object-cover" />
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <form className="mt-6 mb-4 md:hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="border-0 px-3 py-2 h-12 border border-solid border-slate-500 placeholder-slate-300 text-slate-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {/* Navigation Sections */}
            {menuSections.map((section) => (
              <React.Fragment key={section.heading}>
                <hr className="my-4 md:min-w-full" />
                <h6 className="md:min-w-full text-slate-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
                  {section.heading}
                </h6>
                <ul className="md:flex-col md:min-w-full flex flex-col list-none">
                  {section.links
                    .filter(link => !link.roles || link.roles.includes(rol))
                    .map((link) => (
                      <li key={link.to} className="items-center">
                        <Link
                          className={`text-xs uppercase py-3 font-bold block ${isActive(link.to)}`}
                          to={link.to}
                        >
                          <i
                            className={`${link.icon} mr-2 text-sm ${
                              isActive(link.to).includes("text-sky")
                                ? "opacity-75"
                                : "text-slate-300"
                            }`}
                          ></i>{" "}
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
