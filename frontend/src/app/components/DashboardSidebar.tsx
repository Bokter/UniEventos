import { useNavigate } from "react-router";
import {
  FileText,
  Plus,
  Bell,
  User,
  LogOut,
  Users,
  Tag,
  Flag,
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
  | "reports"
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
    logout();
    navigate("/");
  };

  const renderOrganizerLinks = () => (
    <>
      <h2 className="text-sm text-muted-foreground mb-4 font-semibold uppercase">
        Panel del Organizador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("events")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "events"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Mis eventos</span>
        </button>
        <button
          onClick={() => navigate("/organizer/publish")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 text-muted-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Publicar evento</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "notifications"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notificaciones</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "profile"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <h2 className="text-sm text-muted-foreground mb-4 font-semibold uppercase">
        Panel de Administrador
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "pending"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Pendientes</span>
          {pendingEventsCount > 0 && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              {pendingEventsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "all"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Todos los eventos</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "users"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuarios</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "categories"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Categorías</span>
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "reports"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <Flag className="h-4 w-4" />
          <span>Reportes</span>
        </button>
      </nav>
    </>
  );

  const renderAttendeeLinks = () => (
    <>
      <h2 className="text-sm text-muted-foreground mb-4 font-semibold uppercase">
        Mi Cuenta
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "favorites"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeTab === "profile"
              ? "bg-primary/10 text-primary border-l-4 border-primary"
              : "hover:bg-gray-50 text-muted-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Mi perfil</span>
        </button>
      </nav>
    </>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-6 flex-1">
        {usuario?.rol === "admin" && renderAdminLinks()}
        {usuario?.rol === "organizador" && renderOrganizerLinks()}
        {(!usuario?.rol || usuario?.rol === "asistente") && renderAttendeeLinks()}
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-50 text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
