import { useNavigate } from "react-router";
import {
  FileText,
  Plus,
  Bell,
  User,
  LogOut,
  Users,
  Tag,
  Heart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export type SidebarTab =
  // Organizer tabs
  | "events"
  | "notifications"
  | "profile"
  // Admin tabs
  | "pending"
  | "all"
  | "users"
  | "categories"
  // Attendee/User tabs
  | "favorites";

interface DashboardSidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  pendingEventsCount?: number;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  pendingEventsCount = 0,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      logout();
      navigate("/");
    }, 420);
  };

  const renderOrganizerLinks = () => (
    <>
      <h2 className="text-sm mb-4 font-semibold uppercase" style={{ color: 'rgba(229,229,229,0.5)', letterSpacing: '0.08em' }}>
        Panel del Organizador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("events")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "events"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "events"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <FileText className="h-4 w-4" />
          <span>Mis eventos</span>
        </button>
        <button
          onClick={() => navigate("/organizer/publish")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(229,229,229,0.7)' }}
        >
          <Plus className="h-4 w-4" />
          <span>Publicar evento</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "notifications"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "notifications"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <Bell className="h-4 w-4" />
          <span>Notificaciones</span>
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "favorites"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "favorites"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "profile"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "profile"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <h2 className="text-sm mb-4 font-semibold uppercase" style={{ color: 'rgba(229,229,229,0.5)', letterSpacing: '0.08em' }}>
        Panel de Administrador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "pending"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "pending"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <FileText className="h-4 w-4" />
          <span>Pendientes</span>
          {pendingEventsCount > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(238,108,77,0.2)', color: '#EE6C4D' }}>
              {pendingEventsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "all"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "all"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <FileText className="h-4 w-4" />
          <span>Todos los eventos</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "users"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "users"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <Users className="h-4 w-4" />
          <span>Usuarios</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "categories"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "categories"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <Tag className="h-4 w-4" />
          <span>Categorías</span>
        </button>
      </nav>
    </>
  );

  const renderAttendeeLinks = () => (
    <>
      <h2 className="text-sm mb-4 font-semibold uppercase" style={{ color: 'rgba(229,229,229,0.5)', letterSpacing: '0.08em' }}>
        Mi Cuenta
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "favorites"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "favorites"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "profile"
              ? "border-l-4"
              : "hover:bg-white/5"
            }`}
          style={activeTab === "profile"
            ? { borderLeftColor: '#EE6C4D', color: '#EE6C4D', background: 'rgba(238,108,77,0.1)' }
            : { color: 'rgba(229,229,229,0.7)' }
          }
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  return (
    <div className="w-64 min-h-[calc(100vh-4rem)] flex flex-col" style={{ background: '#293241', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="p-6 flex-1">
        {usuario?.rol === "admin" && renderAdminLinks()}
        {usuario?.rol === "organizador" && renderOrganizerLinks()}
        {(!usuario?.rol || usuario?.rol === "miembro") && renderAttendeeLinks()}
      </div>

      <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-500/10 transition-colors"
          style={{ color: '#f87171' }}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
