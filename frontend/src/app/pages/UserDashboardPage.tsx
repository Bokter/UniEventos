import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { Heart } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { useAuth } from "../../context/AuthContext";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";
import { favoritosApi } from "../services/api.service";
import { toast } from "sonner";

export function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('favorites');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const { usuario, isLoading } = useAuth();

  useEffect(() => {
    if (usuario && activeTab === 'favorites') {
      const fetchFavorites = async () => {
        setIsLoadingFavorites(true);
        try {
          const data = await favoritosApi.getAll();
          setFavorites(data as any[]);
        } catch (error) {
          console.error("Error al cargar favoritos", error);
          toast.error("No se pudieron cargar tus favoritos");
        } finally {
          setIsLoadingFavorites(false);
        }
      };
      fetchFavorites();
    }
  }, [usuario, activeTab]);

  if (isLoading) return null;
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen dashboard-shell">
      <Navbar showSearch={false} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido principal */}
        <div className="dashboard-main">
          {activeTab === 'favorites' && (
            <>
              <div className="mb-6">
                <h1 className="font-h1 mb-1">Mis Eventos Favoritos</h1>
                <p className="font-caption">
                  Aquí encontrarás los eventos que has guardado
                </p>
              </div>

              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 uni-shimmer rounded-xl" />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="dashboard-panel p-12 text-center">
                  <Heart className="h-12 w-12 dashboard-empty-icon mx-auto mb-4" />
                  <h3 className="font-h3 text-lg mb-2">
                    Aún no tienes favoritos
                  </h3>
                  <p className="font-caption">
                    Explora eventos y guárdalos para verlos aquí
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="font-h1 mb-6">Mi Perfil</h1>
              <div className="dashboard-panel p-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
                  >
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-h3 text-xl">{usuario.nombre_completo}</h2>
                    <p className="font-caption">{usuario.email}</p>
                    <p className="font-body text-sm capitalize" style={{ color: "var(--accent-primary)" }}>{usuario.rol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="uni-label">Nombre Completo</label>
                    <p className="font-body text-lg" style={{ fontWeight: 600 }}>{usuario.nombre_completo}</p>
                  </div>
                  <div>
                    <label className="uni-label">Correo Electrónico</label>
                    <p className="font-body text-lg" style={{ fontWeight: 600 }}>{usuario.email}</p>
                  </div>
                  <div>
                    <label className="uni-label">Rol en la Plataforma</label>
                    <p className="font-body text-lg capitalize" style={{ fontWeight: 600 }}>{usuario.rol}</p>
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
