import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbars/IndexNavbar';
import ListAuditLogs from '../../components/Config/ListAuditLogs';

function ListAuditLogsPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen flex flex-col">
        <Navbar nombreUsuario={nombreUsuario} />
        <main className="flex-1 mt-20">
          {/* Contenido principal */}
          <div className="mt-12 px-4 md:px-8">
            <ListAuditLogs />
          </div>
        </main>
      </div>
    </>
  );
}

export default ListAuditLogsPage;
