import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { Calendar, Bell, User, Pencil, X, Video, Heart, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";
import { useAuth } from "../../context/AuthContext";
import { eventosApi, favoritosApi } from "../services/api.service";
import { toast } from "sonner";
import { notificationService } from "../services/notification.service";

// Tipo local para eventos que llegan del backend
interface EventoBackend {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: { id: number; nombre: string } | string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  observacion_admin?: string;
  streams?: { organizerId: string; streamLink: string }[];
  coorganizadores?: { id: number; nombre_completo: string; email: string }[];
  [key: string]: unknown;
}

export function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>('events');
  const [organizerEvents, setOrganizerEvents] = useState<EventoBackend[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [streamDialogOpen, setStreamDialogOpen] = useState(false);
  const [selectedEventForStream, setSelectedEventForStream] = useState<EventoBackend | null>(null);
  const [streamLink, setStreamLink] = useState("");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const { usuario, isLoading, logout } = useAuth();

  // Carga de eventos desde el backend (siempre arriba de los returns)
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      // Solo hacer el fetch si hay un usuario logueado con rol correcto
      if (!usuario || usuario.rol !== 'organizador') return;
      
      setIsLoadingEvents(true);
      try {
        const data = await eventosApi.getMisEventos() as EventoBackend[];
        setOrganizerEvents(data);
      } catch {
        toast.error("Error al cargar tus eventos");
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchOrganizerEvents();
  }, [usuario]);

  // Carga de favoritos (solo cuando se abre la pestaña)
  useEffect(() => {
    if (usuario && activeTab === 'favorites') {
      const fetchFavorites = async () => {
        setIsLoadingFavorites(true);
        try {
          const data = await favoritosApi.getAll();
          setFavorites(data as any[]);
        } catch (error) {
          console.error("Error al cargar favoritos", error);
          toast.error("No se pudieron cargar tus favoritos");
        } finally {
          setIsLoadingFavorites(false);
        }
      };
      fetchFavorites();
    }
  }, [usuario, activeTab]);

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'organizador') {
    return <Navigate to="/login" replace />;
  }

  const handleEdit = (eventId: number) => {
    navigate(`/organizer/publish?edit=${eventId}`);
  };

  const handleCancel = async (eventId: number) => {
    const event = organizerEvents.find(e => e.id === eventId);
    if (!confirm(`¿Estás seguro de que quieres cancelar "${event?.titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await eventosApi.cancelar(eventId);
      
      // Obtener interesados y notificarles
      try {
        const followers = await favoritosApi.getInteresados(eventId) as string[];
        const coOrganizers = (event?.coorganizadores || []).map(c => c.email);
        
        // Unir listas de correos y eliminar duplicados
        const allEmails = Array.from(new Set([...followers, ...coOrganizers]));

        if (allEmails.length > 0 && event) {
          toast.info(`Notificando a ${allEmails.length} personas (seguidores y colaboradores)...`);
          // Enviar correos
          allEmails.forEach((email: string) => {
            notificationService.sendEmail({
              usuario: { nombre_completo: "Colaborador/Seguidor de UniEventos" },
              event: { titulo: event.titulo, estado: 'CANCELADO' },
              to_email: email
            });
          });
        }
      } catch (err) {
        console.error("Error al notificar a interesados:", err);
      }

      toast.success("Evento cancelado exitosamente");
      setOrganizerEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, estado: 'cancelado' } : e)
      );
    } catch (error: unknown) {
      toast.error((error as Error).message || "No se pudo cancelar el evento");
    }
  };

  const handleEliminar = async (eventId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento permanentemente? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await eventosApi.eliminar(eventId);
      toast.success("Evento eliminado");
      setOrganizerEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: unknown) {
      toast.error((error as Error).message || "No se pudo eliminar el evento");
    }
  };

  const handleOpenStreamDialog = (event: EventoBackend) => {
    setSelectedEventForStream(event);
    const userStream = event.streams?.find(s => String(s.organizerId) === String(usuario?.id));
    setStreamLink(userStream?.streamLink || "");
    setStreamDialogOpen(true);
  };

  const handleSaveStreamLink = () => {
    // El stream link se guarda localmente hasta que exista endpoint en el backend
    if (!selectedEventForStream) return;
    setOrganizerEvents(prev =>
      prev.map(e => {
        if (e.id !== selectedEventForStream.id) return e;
        const streams = [...(e.streams || [])];
        const idx = streams.findIndex(s => String(s.organizerId) === String(usuario?.id));
        if (idx >= 0) {
          streams[idx] = { ...streams[idx], streamLink };
        } else {
          streams.push({ organizerId: String(usuario.id), streamLink });
        }
        return { ...e, streams };
      })
    );
    toast.success("Enlace de transmisión guardado");
    setStreamDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  void handleLogout; // evita warning de variable no usada

  const approvedCount = organizerEvents.filter(e => e.estado === 'Approved' || e.estado === 'aprobado').length;

  return (
    <div className="min-h-screen dashboard-shell">
      <Navbar showSearch={false} />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido principal */}
        <div className="dashboard-main">
          {activeTab === 'events' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Mis Eventos</h1>
                  <p className="text-muted-foreground">
                    Gestiona y realiza seguimiento de tus eventos
                  </p>
                </div>
              </div>

              {isLoadingEvents ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-muted-foreground">
                  Cargando eventos...
                </div>
              ) : organizerEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                      {organizerEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link
                              to={`/event/${event.id}`}
                              className="hover:text-accent hover:underline"
                              style={{ fontWeight: 600 }}
                            >
                              {event.titulo}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.categoria as any} />
                          </TableCell>
                          <TableCell>
                            {event.fecha ? (() => {
                              // Parsear YYYY-MM-DD como fecha LOCAL para evitar el desfase UTC
                              const [y, m, d] = event.fecha.split('-').map(Number);
                              return format(new Date(y, m - 1, d), 'dd/MM/yyyy');
                            })() : '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={event.estado as any} />
                            {/* Mostrar observación del admin si fue rechazado */}
                            {(event.estado === 'Rejected' || event.estado === 'rechazado') && event.observacion_admin && (
                              <div className="mt-1 text-xs text-destructive bg-red-50 border border-red-200 rounded p-2 max-w-md break-words whitespace-normal">
                                <span style={{ fontWeight: 600 }}>Observación del admin: </span>
                                {event.observacion_admin}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Editar */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(event.id)}
                                disabled={event.estado !== 'Draft' && event.estado !== 'borrador' && event.estado !== 'Rejected' && event.estado !== 'rechazado'}
                                title={event.estado === 'Draft' || event.estado === 'borrador' || event.estado === 'Rejected' || event.estado === 'rechazado' ? 'Editar evento' : 'Solo puedes editar eventos en borrador o rechazados'}
                                className="hover:bg-[#98C1D9]/10 active:scale-90 transition-all"
                                style={{ borderColor: '#98C1D9', color: '#3D5A80', fontWeight: 600 }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {/* Stream Link */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenStreamDialog(event)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="hover:bg-[#A4D4B4]/10 active:scale-90 transition-all"
                                style={{ borderColor: '#A4D4B4', color: '#293241' }}
                                title={event.estado === 'Approved' || event.estado === 'aprobado' ? 'Añadir enlace de transmisión' : 'Solo eventos aprobados pueden tener transmisión'}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              {/* Cancelar */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(event.id)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="border-destructive text-destructive hover:bg-red-50 active:scale-90 transition-all"
                                title={event.estado === 'Approved' || event.estado === 'aprobado' ? 'Cancelar evento' : 'Solo puedes cancelar eventos aprobados'}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {/* Eliminar */}
                              {(event.estado === 'borrador' || event.estado === 'cancelado') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEliminar(event.id)}
                                  className="border-destructive text-destructive hover:bg-red-50 active:scale-90 transition-all"
                                  title="Eliminar evento permanentemente"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

          {activeTab === 'favorites' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Mis Eventos Favoritos</h1>
                <p className="text-muted-foreground">
                  Aquí encontrarás los eventos que has guardado
                </p>
              </div>

              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                    Aún no tienes favoritos
                  </h3>
                  <p className="text-muted-foreground">
                    Explora eventos y guárdalos para verlos aquí
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
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-full bg-[#3D5A80] text-white flex items-center justify-center text-2xl shrink-0">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{usuario.nombre_completo}</h2>
                    <p className="text-muted-foreground">{usuario.email}</p>
                    <p className="text-sm text-[#EE6C4D] capitalize font-medium">{usuario.rol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Total de eventos publicados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{organizerEvents.length}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Eventos aprobados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{approvedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para añadir el enlace del stream */}
      <Dialog open={streamDialogOpen} onOpenChange={setStreamDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enlace de Transmisión (Stream)</DialogTitle>
            <DialogDescription>
              Añade el enlace de YouTube, Twitch u otra plataforma para la transmisión en vivo del evento "{selectedEventForStream?.titulo}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stream-link">Enlace o ID de Transmisión</Label>
              <Input
                id="stream-link"
                placeholder="Ej. m3u8, Playback ID de Mux..."
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStreamDialogOpen(false)} className="hover:bg-[#A4D4B4]/10 active:scale-95 transition-all" style={{ borderColor: '#A4D4B4', color: '#293241' }}>Cancelar</Button>
            <Button onClick={handleSaveStreamLink} className="text-white font-bold hover:opacity-90 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #EE6C4D 0%, #e05a3c 100%)', border: 'none' }}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}