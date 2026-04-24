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
  mockEvents
} from "../data/mockData";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>('events');
  const [refresh, setRefresh] = useState(0);

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
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.status = 'Cancelled';
      toast.success("Evento cancelado exitosamente");
      setRefresh(prev => prev + 1); // Forzar re-render
    }
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
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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