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
import { VideoSDKBroadcaster } from "../components/VideoSDKBroadcaster";
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
  // Flujo de transmisión (mismo que en la página de detalle del evento).
  const [externalStreamUrl, setExternalStreamUrl] = useState("");
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [broadcasterData, setBroadcasterData] = useState<{ meetingId: string; token: string } | null>(null);
  const [broadcasterSessionKey, setBroadcasterSessionKey] = useState("");
  const [isBroadcasterOpen, setIsBroadcasterOpen] = useState(false);
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
    setExternalStreamUrl("");
    setStreamDialogOpen(true);
  };

  // Inicia la transmisión igual que en la página de detalle del evento:
  // con cámara (VideoSDK) o con un enlace externo.
  const startStreamFlow = async (url?: string) => {
    const ev = selectedEventForStream;
    if (!ev) return;
    setIsLoadingStream(true);
    setStreamDialogOpen(false);
    try {
      const res = await eventosApi.iniciarStream(ev.id, url) as any;
      if (res.meetingId && !url) {
        setBroadcasterData({ meetingId: res.meetingId, token: res.token });
        setBroadcasterSessionKey(`${res.meetingId}-${Date.now()}`);
        setIsBroadcasterOpen(true);
      } else {
        toast.success("Transmisión externa iniciada");
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo iniciar la transmisión en vivo");
    } finally {
      setIsLoadingStream(false);
      setExternalStreamUrl("");
    }
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
                  <h1 className="font-h1 mb-1">Mis Eventos</h1>
                  <p className="font-caption">
                    Gestiona y realiza seguimiento de tus eventos
                  </p>
                </div>
              </div>

              {isLoadingEvents ? (
                <div className="dashboard-panel p-12 text-center font-caption">
                  Cargando eventos...
                </div>
              ) : organizerEvents.length > 0 ? (
                <div className="dashboard-panel overflow-x-auto">
                  <Table>
                    <TableHeader className="uni-table-head">
                      <TableRow className="uni-table-row">
                        <TableHead>Título</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizerEvents.map((event) => (
                        <TableRow key={event.id} className="uni-table-row">
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
                              <div className="mt-1 text-xs dashboard-alert-reject p-2 max-w-md break-words whitespace-normal">
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
                                className="dashboard-btn-outline dashboard-btn-edit active:scale-90 transition-all"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {/* Stream Link */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenStreamDialog(event)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="dashboard-btn-outline dashboard-btn-toggle active:scale-90 transition-all"
                                title={event.estado === 'Approved' || event.estado === 'aprobado' ? 'Iniciar transmisión en vivo' : 'Solo eventos aprobados pueden tener transmisión'}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              {/* Cancelar */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(event.id)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="dashboard-btn-outline dashboard-btn-danger-outline active:scale-90 transition-all"
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
                                  className="dashboard-btn-outline dashboard-btn-danger-outline active:scale-90 transition-all"
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
                <div className="dashboard-panel p-12 text-center">
                  <Calendar className="h-12 w-12 dashboard-empty-icon mx-auto mb-4" />
                  <h3 className="font-h3 text-lg mb-2">
                    Aún no tienes eventos
                  </h3>
                  <p className="font-caption mb-6">
                    ¡Publica tu primer evento para empezar!
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <>
              <div className="mb-6">
                <h1 className="font-h1 mb-1">Mis Eventos Favoritos</h1>
                <p className="font-caption">
                  Aquí encontrarás los eventos que has guardado
                </p>
              </div>

              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 uni-shimmer rounded-xl" />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="dashboard-panel p-12 text-center">
                  <Heart className="h-12 w-12 dashboard-empty-icon mx-auto mb-4" />
                  <h3 className="font-h3 text-lg mb-2">
                    Aún no tienes favoritos
                  </h3>
                  <p className="font-caption">
                    Explora eventos y guárdalos para verlos aquí
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h1 className="font-h1 mb-6">Notificaciones</h1>
              <div className="dashboard-panel p-12 text-center">
                <Bell className="h-12 w-12 dashboard-empty-icon mx-auto mb-4" />
                <h3 className="font-h3 text-lg mb-2">
                  Sin notificaciones
                </h3>
                <p className="font-caption">
                  ¡Estás al día!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="font-h1 mb-6">Mi Perfil</h1>
              <div className="dashboard-panel p-6 max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl shrink-0 font-bold"
                    style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
                  >
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-h3 text-xl">{usuario.nombre_completo}</h2>
                    <p className="font-caption">{usuario.email}</p>
                    <p className="font-body text-sm capitalize" style={{ color: "var(--accent-primary)" }}>{usuario.rol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="uni-label">Total de eventos publicados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{organizerEvents.length}</p>
                  </div>
                  <div>
                    <label className="uni-label">Eventos aprobados</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{approvedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de opciones de transmisión (igual que en el detalle del evento) */}
      <Dialog open={streamDialogOpen} onOpenChange={setStreamDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[var(--bg-elevated)] border-[var(--border-default)]">
          <DialogHeader>
            <DialogTitle>¿Cómo deseas transmitir?</DialogTitle>
            <DialogDescription>
              Elige entre usar la cámara de tu dispositivo o un enlace externo para "{selectedEventForStream?.titulo}".
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={() => startStreamFlow()} disabled={isLoadingStream} className="dashboard-btn-primary-filled h-12">
              <Video className="h-5 w-5 mr-2" />
              Usar cámara (VideoSDK)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border-default)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--bg-elevated)] px-2 text-[var(--text-muted)]">O usar enlace externo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">Enlace de YouTube, Twitch, etc.</Label>
              <Input
                id="externalUrl"
                placeholder="https://youtube.com/watch?v=..."
                value={externalStreamUrl}
                onChange={(e) => setExternalStreamUrl(e.target.value)}
                className="bg-[var(--bg-base)] border-[var(--border-default)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStreamDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!externalStreamUrl) {
                  toast.error("Ingresa una URL válida");
                  return;
                }
                startStreamFlow(externalStreamUrl);
              }}
              disabled={!externalStreamUrl || isLoadingStream}
            >
              Iniciar con enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel del transmisor (VideoSDK) */}
      <Dialog
        open={isBroadcasterOpen}
        onOpenChange={(open) => {
          setIsBroadcasterOpen(open);
          if (!open) setBroadcasterData(null);
        }}
      >
        <DialogContent className="sm:max-w-[700px] border-zinc-800 bg-zinc-950 p-0 overflow-hidden" aria-describedby="broadcaster-dialog-desc-dash">
          <DialogHeader className="sr-only">
            <DialogTitle>Panel de transmisión en vivo</DialogTitle>
            <DialogDescription id="broadcaster-dialog-desc-dash">
              Controla cámara, micrófono y la publicación HLS para los asistentes del evento.
            </DialogDescription>
          </DialogHeader>
          {broadcasterData && selectedEventForStream && (
            <VideoSDKBroadcaster
              key={broadcasterSessionKey}
              sessionKey={broadcasterSessionKey}
              meetingId={broadcasterData.meetingId}
              token={broadcasterData.token}
              eventoId={selectedEventForStream.id}
              onClose={() => {
                setIsBroadcasterOpen(false);
                setBroadcasterData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}