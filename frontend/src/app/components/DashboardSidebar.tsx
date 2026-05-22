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
  | "events"
  | "notifications"
  | "profile"
  | "pending"
  | "all"
  | "users"
  | "categories"
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
      setTimeout(() => { document.body.style.opacity = '1'; }, 50);
    }, 420);
  };

  const activeStyle = {
    borderLeftColor: '#7C3AED',
    color: '#A78BFA',
    background: 'rgba(124, 58, 237, 0.15)'
  };

  const inactiveStyle = {
    color: '#94A3B8'
  };

  const renderOrganizerLinks = () => (
    <>
      <h2 className="hidden md:block text-sm mb-4 font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}>
        Panel del Organizador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("events")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "events" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "events" ? activeStyle : inactiveStyle}
        >
          <FileText className="h-4 w-4" />
          <span>Mis eventos</span>
        </button>
        <button
          onClick={() => navigate("/organizer/publish")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-all"
          style={inactiveStyle}
        >
          <Plus className="h-4 w-4" />
          <span>Publicar evento</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "notifications" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "notifications" ? activeStyle : inactiveStyle}
        >
          <Bell className="h-4 w-4" />
          <span>Notificaciones</span>
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "favorites" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "favorites" ? activeStyle : inactiveStyle}
        >
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "profile" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "profile" ? activeStyle : inactiveStyle}
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <h2 className="hidden md:block text-sm mb-4 font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}>
        Panel de Administrador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "pending" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "pending" ? activeStyle : inactiveStyle}
        >
          <FileText className="h-4 w-4" />
          <span>Pendientes</span>
          {pendingEventsCount > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185' }}>
              {pendingEventsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "all" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "all" ? activeStyle : inactiveStyle}
        >
          <FileText className="h-4 w-4" />
          <span>Todos los eventos</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "users" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "users" ? activeStyle : inactiveStyle}
        >
          <Users className="h-4 w-4" />
          <span>Usuarios</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "categories" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "categories" ? activeStyle : inactiveStyle}
        >
          <Tag className="h-4 w-4" />
          <span>Categorías</span>
        </button>
      </nav>
    </>
  );

  const renderAttendeeLinks = () => (
    <>
      <h2 className="hidden md:block text-sm mb-4 font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}>
        Mi Cuenta
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "favorites" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "favorites" ? activeStyle : inactiveStyle}
        >
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === "profile" ? "border-l-4" : "hover:bg-white/5"}`}
          style={activeTab === "profile" ? activeStyle : inactiveStyle}
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  return (
    <div className="w-full md:w-64 md:min-h-[calc(100vh-4rem)] flex flex-col"
      style={{ background: '#1E293B', borderRight: '1px solid rgba(148, 163, 184, 0.08)' }}>
      <div className="p-4 md:p-6 flex-1 overflow-x-auto md:overflow-x-visible">
        <div className="flex md:block gap-2 min-w-max md:min-w-0">
          {usuario?.rol === "admin" && renderAdminLinks()}
          {usuario?.rol === "organizador" && renderOrganizerLinks()}
          {(!usuario?.rol || usuario?.rol === "miembro") && renderAttendeeLinks()}
        </div>
      </div>

      <div className="p-4 md:p-6 hidden md:block" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
          style={{ color: '#F87171' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
