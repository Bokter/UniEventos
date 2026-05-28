import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, LogIn, Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export function Navbar({ showSearch = true, onSearchChange, searchValue = "" }: NavbarProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`navbar-premium border-b sticky top-0 z-50 min-w-full transition-all duration-300 ${
        scrolled ? "navbar-premium--scrolled" : ""
      }`}
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div className="relative">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "var(--accent-primary)" }}
              >
                <span className="font-data text-xs font-bold" style={{ color: "var(--text-primary)" }}>UN</span>
              </div>
              <span
                className="logo-pulse-dot absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--accent-primary)", border: "2px solid var(--bg-surface)" }}
              />
            </div>
            <span className="font-h2 hidden sm:inline" style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              UniEventos
            </span>
          </Link>

          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type="search"
                  placeholder="Buscar eventos..."
                  className="uni-input pl-9 h-10 text-sm"
                  style={{ paddingTop: "8px", paddingBottom: "8px" }}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {usuario ? (
              <>
                {usuario.rol === 'organizador' && (
                  <Button
                    onClick={() => navigate("/organizer/publish")}
                    className="text-[var(--text-primary)] hover:opacity-90"
                    style={{ background: "var(--accent-primary)", fontWeight: 600 }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Publicar</span>
                  </Button>
                )}
                {usuario.rol === 'admin' && (
                  <Button onClick={() => navigate("/admin")} variant="outline" className="uni-btn-ghost border-[var(--border-default)]">
                    Admin
                  </Button>
                )}
                {usuario.rol === 'organizador' && (
                  <Button onClick={() => navigate("/organizer/dashboard")} variant="outline" className="uni-btn-ghost hidden sm:flex">
                    Dashboard
                  </Button>
                )}
                {(!usuario.rol || usuario.rol === 'miembro') && (
                  <Button onClick={() => navigate("/user/dashboard")} variant="outline" className="uni-btn-ghost hidden sm:flex">
                    Mi Panel
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
                  >
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block font-body text-sm" style={{ color: "var(--text-secondary)" }}>
                    {usuario.nombre_completo}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    document.body.style.transition = 'opacity 0.4s ease';
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                      logout();
                      navigate("/");
                      setTimeout(() => { document.body.style.opacity = '1'; }, 50);
                    }, 420);
                  }}
                  variant="ghost"
                  size="icon"
                  title="Cerrar sesión"
                  style={{ color: "var(--text-muted)" }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/login")} variant="outline" className="uni-btn-ghost">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex"
                  style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
