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
      className={`border-b sticky top-0 z-50 min-w-full transition-all duration-300 ${
        scrolled ? "navbar-glass" : ""
      }`}
      style={{
        background: scrolled ? undefined : "#293241",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div className="relative">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "#EE6C4D" }}
              >
                <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.8rem" }}>UN</span>
              </div>
              <span
                className="logo-pulse-dot absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#293241]"
                style={{ background: "#EE6C4D" }}
              />
            </div>
            <span
              className="font-h2 text-xl"
              style={{ color: "#E0FBFC", letterSpacing: "0.04em" }}
            >
              UniEventos
            </span>
          </Link>

          {/* Barra de búsqueda */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "rgba(229,229,229,0.5)" }}
                />
                <input
                  type="search"
                  placeholder="Buscar eventos..."
                  className="pl-9 w-full h-9 rounded-md text-sm font-body"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#E5E5E5",
                    outline: "none",
                    padding: "0 0.75rem 0 2.25rem",
                    borderRadius: "var(--radius-sm)",
                  }}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                {usuario.rol === 'organizador' && (
                  <Button
                    onClick={() => navigate("/organizer/publish")}
                    className="text-white hover:bg-[#d45d3f] active:scale-95 transition-all"
                    style={{ background: '#EE6C4D', color: '#FFFFFF', fontWeight: 600 }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar evento
                  </Button>
                )}
                {usuario.rol === 'admin' && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    className="hover:bg-[#98C1D9]/10 active:scale-95 transition-all"
                    style={{ borderColor: '#98C1D9', color: '#98C1D9', background: 'transparent' }}
                  >
                    Panel Admin
                  </Button>
                )}
                {usuario.rol === 'organizador' && (
                  <Button
                    onClick={() => navigate("/organizer/dashboard")}
                    variant="outline"
                    className="hover:bg-[#98C1D9]/10 active:scale-95 transition-all"
                    style={{ borderColor: '#98C1D9', color: '#98C1D9', background: 'transparent' }}
                  >
                    Dashboard
                  </Button>
                )}
                {(!usuario.rol || usuario.rol === 'miembro') && (
                  <Button
                    onClick={() => navigate("/user/dashboard")}
                    variant="outline"
                    className="hover:bg-[#98C1D9]/10 active:scale-95 transition-all"
                    style={{ borderColor: '#98C1D9', color: '#98C1D9', background: 'transparent' }}
                  >
                    Mi Panel
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#EE6C4D', color: '#FFFFFF', fontWeight: 700 }}>
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block font-body" style={{ color: '#E0FBFC' }}>{usuario.nombre_completo}</span>
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
                  className="hover:text-foreground"
                  style={{ color: 'rgba(224,251,252,0.6)' }}
                  size="icon"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="hover:bg-[#98C1D9]/10 active:scale-95 transition-all"
                  style={{ borderColor: '#98C1D9', color: '#98C1D9', background: 'transparent' }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex hover:bg-[#d45d3f] active:scale-95 transition-all"
                  style={{ background: '#EE6C4D', color: '#FFFFFF', fontWeight: 600 }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar evento
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
