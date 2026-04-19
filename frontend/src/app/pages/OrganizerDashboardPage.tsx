import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { Calendar, Plus, Bell, User, FileText, LogOut, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  getEventsByOrganizer,
  Event,
  // mockData sigue usándose para los eventos mientras el módulo de eventos no esté listo
} from "../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'notifications' | 'profile'>('events');

  const { usuario, isLoading, logout } = useAuth();

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'organizador') {
    return <Navigate to="/login" replace />;
  }

  // Por ahora usamos mockData para los eventos (hasta que el módulo de eventos esté listo)
  // Cuando el backend esté listo, reemplazar con: fetch('/eventos?organizador=true', { headers: { Authorization: `Bearer ${obtenerToken()}` } })
  const organizerEvents = getEventsByOrganizer(String(usuario.id));

  const handleEdit = (eventId: string) => {
    navigate(`/organizer/publish?edit=${eventId}`);
  };

  const handleCancel = (eventId: string) => {
    // TODO: cuando el módulo de eventos esté listo, llamar a PATCH /eventos/:id/cancelar
    toast.success("Evento cancelado (simulado)");
    console.log("Cancelar evento:", eventId);
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <h2 className="text-sm text-muted-foreground mb-4">PANEL DEL ORGANIZADOR</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'events'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
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
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notificaciones</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Mi perfil</span>
              </button>
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-50 text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-8">
          {activeTab === 'events' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Mis Eventos</h1>
                  <p className="text-muted-foreground">
                    Gestiona y realiza seguimiento de tus eventos
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/organizer/publish")}
                  className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar evento
                </Button>
              </div>

              {organizerEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizerEvents.map((event: Event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link
                              to={`/event/${event.id}`}
                              className="hover:text-accent hover:underline"
                              style={{ fontWeight: 600 }}
                            >
                              {event.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.category} />
                          </TableCell>
                          <TableCell>
                            {format(event.dateStart, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={event.status} />
                            {/* Mostrar observación del admin si fue rechazado */}
                            {event.status === 'Rejected' && event.rejectionReason && (
                              <div className="mt-1 text-xs text-destructive bg-red-50 border border-red-200 rounded p-2">
                                <span style={{ fontWeight: 600 }}>Observación del admin: </span>
                                {event.rejectionReason}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Editar: solo disponible en borrador o rechazado */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(event.id)}
                                disabled={
                                  event.status !== 'Draft' && event.status !== 'Rejected'
                                }
                                title={
                                  event.status === 'Draft' || event.status === 'Rejected'
                                    ? 'Editar evento'
                                    : 'Solo puedes editar eventos en borrador o rechazados'
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {/* Cancelar: solo disponible en eventos aprobados */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancel(event.id)}
                                disabled={
                                  event.status !== 'Approved'
                                }
                                className="text-destructive hover:text-destructive"
                                title={
                                  event.status === 'Approved'
                                    ? 'Cancelar evento'
                                    : 'Solo puedes cancelar eventos aprobados'
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                    Aún no tienes eventos
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    ¡Publica tu primer evento para empezar!
                  </p>
                  <Button
                    onClick={() => navigate("/organizer/publish")}
                    className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar evento
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Notificaciones</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                  Sin notificaciones
                </h3>
                <p className="text-muted-foreground">
                  ¡Estás al día!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Mi Perfil</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl" style={{ fontWeight: 600 }}>{usuario.nombre_completo}</h2>
                    <p className="text-muted-foreground">{usuario.email}</p>
                    <p className="text-sm text-accent capitalize">{usuario.rol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Total de eventos publicados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{organizerEvents.length}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Eventos aprobados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>
                      {organizerEvents.filter((e: Event) => e.status === 'Approved').length}
                    </p>
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