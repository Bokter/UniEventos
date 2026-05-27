/* @visual-only — nav callbacks passed from parent logic */
import { useState, useEffect } from "react";
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
  Sun,
  Moon,
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

function NavItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dashboard-nav-item ${active ? "dashboard-nav-item--active" : ""}`}
    >
      <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-data"
          style={{ background: "var(--accent-glow)", color: "var(--accent-primary)" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  pendingEventsCount = 0,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Theme support
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    };
    window.addEventListener("theme-changed", handleThemeChange);
    return () => window.removeEventListener("theme-changed", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setTheme(newTheme);
    window.dispatchEvent(new Event("theme-changed"));
  };

  const handleLogout = () => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      logout();
      navigate("/");
      setTimeout(() => { document.body.style.opacity = '1'; }, 50);
    }, 420);
  };

  const renderOrganizerLinks = () => (
    <nav className="space-y-1">
      <p className="font-caption uppercase tracking-widest mb-4 hidden md:block" style={{ fontSize: "0.7rem" }}>
        Organizador
      </p>
      <NavItem active={activeTab === "events"} onClick={() => setActiveTab("events")} icon={<FileText className="h-5 w-5" />} label="Mis eventos" />
      <NavItem active={false} onClick={() => navigate("/organizer/publish")} icon={<Plus className="h-5 w-5" />} label="Publicar evento" />
      <NavItem active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={<Bell className="h-5 w-5" />} label="Notificaciones" />
      <NavItem active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")} icon={<Heart className="h-5 w-5" />} label="Favoritos" />
      <NavItem active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="h-5 w-5" />} label="Mi perfil" />
    </nav>
  );

  const renderAdminLinks = () => (
    <nav className="space-y-1">
      <p className="font-caption uppercase tracking-widest mb-4 hidden md:block" style={{ fontSize: "0.7rem" }}>
        Administración
      </p>
      <NavItem active={activeTab === "pending"} onClick={() => setActiveTab("pending")} icon={<FileText className="h-5 w-5" />} label="Pendientes" badge={pendingEventsCount} />
      <NavItem active={activeTab === "all"} onClick={() => setActiveTab("all")} icon={<FileText className="h-5 w-5" />} label="Todos los eventos" />
      <NavItem active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-5 w-5" />} label="Usuarios" />
      <NavItem active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={<Tag className="h-5 w-5" />} label="Categorías" />
    </nav>
  );

  const renderAttendeeLinks = () => (
    <nav className="space-y-1">
      <p className="font-caption uppercase tracking-widest mb-4 hidden md:block" style={{ fontSize: "0.7rem" }}>
        Mi cuenta
      </p>
      <NavItem active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")} icon={<Heart className="h-5 w-5" />} label="Favoritos" />
      <NavItem active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="h-5 w-5" />} label="Mi perfil" />
    </nav>
  );

  return (
    <aside className="dashboard-sidebar w-full md:w-[260px] flex flex-col border-b md:border-b-0">
      <div className="p-6 border-b hidden md:block" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <span className="logo-pulse-dot w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-primary)" }} />
          <span className="font-h2" style={{ fontSize: "1.25rem", fontWeight: 700 }}>UniEventos</span>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1 overflow-x-auto md:overflow-visible">
        <div className="flex md:block gap-2 min-w-max md:min-w-0">
          {usuario?.rol === "admin" && renderAdminLinks()}
          {usuario?.rol === "organizador" && renderOrganizerLinks()}
          {(!usuario?.rol || usuario?.rol === "miembro") && renderAttendeeLinks()}
        </div>
      </div>

      <div className="p-4 md:p-6 border-t hidden md:block" style={{ borderColor: "var(--border-subtle)" }}>
        {usuario && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
            >
              {usuario.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-body text-sm truncate" style={{ fontWeight: 600 }}>{usuario.nombre_completo}</p>
              <p className="font-caption capitalize">{usuario.rol}</p>
            </div>
          </div>
        )}
        <button type="button" onClick={handleLogout} className="dashboard-nav-item w-full" style={{ color: "var(--status-red)" }}>
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>

        <button 
          type="button" 
          onClick={toggleTheme} 
          className="dashboard-nav-item w-full mt-2" 
          style={{ color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 text-indigo-500" />
              <span>Modo oscuro</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
