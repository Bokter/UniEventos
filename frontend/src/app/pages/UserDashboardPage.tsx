import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { Heart, User } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { mockFavoriteEvents } from "../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";

export function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('favorites');
  const { usuario, isLoading } = useAuth();

  // Lógica de carga inicial de favoritos (Comentada para futura conexión)
  /*
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favoritos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        // setFavorites(data);
      } catch (error) {
        console.error("Error al cargar favoritos", error);
      }
    };
    fetchFavorites();
  }, [token]);
  */

  if (isLoading) return null;
  // If not logged in, or if it's admin/organizer, they shouldn't be here, but we'll just check if logged in.
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido principal */}
        <div className="flex-1 p-8">
          {activeTab === 'favorites' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Mis Eventos Favoritos</h1>
                <p className="text-muted-foreground">
                  Aquí encontrarás los eventos que has guardado
                </p>
              </div>

              {mockFavoriteEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockFavoriteEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                    Aún no tienes favoritos
                  </h3>
                  <p className="text-muted-foreground">
                    Explora eventos y guárdalos para verlos aquí
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Mi Perfil</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl" style={{ fontWeight: 600 }}>{usuario.nombre_completo}</h2>
                    <p className="text-muted-foreground">{usuario.email}</p>
                    <p className="text-sm text-accent capitalize">{usuario.rol}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
