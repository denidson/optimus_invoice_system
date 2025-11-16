import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { showProfileClient, showProfile } from "../services/apiProfile";
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbars/IndexNavbar';
import { Loader2 } from "lucide-react";
import ProfileContent from "../components/Profile/ProfileContent";

import {ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [client, setClient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.cliente_id) return;
    console.log(user)
    const fetchData = async () => {
      try {
        const data = await showProfileClient(user.cliente_id);
        const dataProfile = await showProfile();
        setProfile(dataProfile);
        setClient(data);
      } catch (error) {
        console.error("Error al obtener datos del cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 min-h-screen flex flex-col">
        <Navbar nombreUsuario={nombreUsuario}/>
        <main className="flex-1 mt-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
            </div>
          ) : client ? (
            <ProfileContent client={client} />
          ) : profile ? (
            <ProfileContent profile={profile} />
          )
          : (
            <div className="text-center text-gray-500 mt-10">
              No se pudieron cargar los datos del perfil.
            </div>
          )}
        </main>
      </div>
    </>
  );

}
