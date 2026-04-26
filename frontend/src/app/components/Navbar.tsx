import { Link, useNavigate } from "react-router";
import { Search, LogIn, Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 min-w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-white">U</span>
            </div>
            <span className="text-xl text-primary" style={{ fontWeight: 600 }}>
              UniEventos
            </span>
          </Link>

          {/* Search bar */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-9 bg-input-background border-0"
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
                    className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar evento
                  </Button>
                )}
                {usuario.rol === 'admin' && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Panel Admin
                  </Button>
                )}
                {usuario.rol === 'organizador' && (
                  <Button
                    onClick={() => navigate("/organizer/dashboard")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Dashboard
                  </Button>
                )}
                {(!usuario.rol || usuario.rol === 'miembro') && (
                  <Button
                    onClick={() => navigate("/user/dashboard")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Mi Panel
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{usuario.nombre_completo}</span>
                </div>
                <Button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
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
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1D9E75] hover:bg-[#188c66] text-white hidden sm:flex"
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
