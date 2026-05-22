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

  return (
    <nav className="border-b sticky top-0 z-50 min-w-full glass-darker"
      style={{ borderColor: 'rgba(148, 163, 184, 0.08)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem' }}>UN</span>
            </div>
            <span className="text-xl gradient-text-violet-rose"
              style={{ 
                fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
                fontWeight: 700, 
                letterSpacing: '-0.02em' 
              }}>
              UniEventos
            </span>
          </Link>

          {/* Barra de búsqueda */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#64748B' }} />
                <input
                  type="search"
                  placeholder="Buscar eventos..."
                  className="pl-9 w-full h-9 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    color: '#F8FAFC',
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                    padding: '0 0.75rem 0 2.25rem',
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
                    className="btn-shimmer transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', 
                      color: '#FFFFFF', 
                      fontWeight: 600,
                      border: 'none'
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar evento
                  </Button>
                )}
                {usuario.rol === 'admin' && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    className="transition-all"
                    style={{ 
                      borderColor: 'rgba(124, 58, 237, 0.4)', 
                      color: '#A78BFA', 
                      background: 'rgba(124, 58, 237, 0.1)' 
                    }}
                  >
                    Panel Admin
                  </Button>
                )}
                {usuario.rol === 'organizador' && (
                  <Button
                    onClick={() => navigate("/organizer/dashboard")}
                    variant="outline"
                    className="transition-all"
                    style={{ 
                      borderColor: 'rgba(30, 64, 175, 0.4)', 
                      color: '#60A5FA', 
                      background: 'rgba(30, 64, 175, 0.1)' 
                    }}
                  >
                    Dashboard
                  </Button>
                )}
                {(!usuario.rol || usuario.rol === 'miembro') && (
                  <Button
                    onClick={() => navigate("/user/dashboard")}
                    variant="outline"
                    className="transition-all"
                    style={{ 
                      borderColor: 'rgba(30, 64, 175, 0.4)', 
                      color: '#60A5FA', 
                      background: 'rgba(30, 64, 175, 0.1)' 
                    }}
                  >
                    Mi Panel
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #7C3AED 0%, #1E40AF 100%)', 
                      color: '#FFFFFF', 
                      fontWeight: 700 
                    }}>
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block" style={{ color: '#F8FAFC' }}>
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
                  className="transition-all"
                  style={{ color: '#64748B' }}
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
                  className="transition-all"
                  style={{ 
                    borderColor: 'rgba(30, 64, 175, 0.4)', 
                    color: '#60A5FA', 
                    background: 'rgba(30, 64, 175, 0.1)' 
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex btn-shimmer transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    border: 'none'
                  }}
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
