import { Link, useNavigate } from "react-router";
import { Search, LogIn, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { currentUser } from "../data/mockData";

interface NavbarProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export function Navbar({ showSearch = true, onSearchChange, searchValue = "" }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {currentUser ? (
              <>
                {currentUser.role === 'Organizer' && (
                  <Button
                    onClick={() => navigate("/organizer/publish")}
                    className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publish event
                  </Button>
                )}
                {currentUser.role === 'Admin' && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Admin Panel
                  </Button>
                )}
                {currentUser.role === 'Organizer' && (
                  <Button
                    onClick={() => navigate("/organizer/dashboard")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Dashboard
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block">{currentUser.name}</span>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1D9E75] hover:bg-[#188c66] text-white hidden sm:flex"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publish event
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
