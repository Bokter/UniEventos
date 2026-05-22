import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { Calendar, Bell, User, Pencil, X, Video, Heart, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { EventCard } from "../components/EventCard";
import { TrendChart } from "../components/TrendChart";
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

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
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
      
      try {
        const followers = await favoritosApi.getInteresados(eventId) as string[];
        const coOrganizers = (event?.coorganizadores || []).map(c => c.email);
        const allEmails = Array.from(new Set([...followers, ...coOrganizers]));

        if (allEmails.length > 0 && event) {
          toast.info(`Notificando a ${allEmails.length} personas (seguidores y colaboradores)...`);
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

  void handleLogout;

  const approvedCount = organizerEvents.filter(e => e.estado === 'Approved' || e.estado === 'aprobado').length;
  const pendingCount = organizerEvents.filter(e => e.estado === 'Pending' || e.estado === 'pendiente').length;

  // Mock data for trend chart
  const trendData = [
    { date: "Lun", value: 12 },
    { date: "Mar", value: 28 },
    { date: "Mié", value: 45 },
    { date: "Jue", value: 38 },
    { date: "Vie", value: 67 },
    { date: "Sáb", value: 89 },
    { date: "Dom", value: 56 },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      <Navbar showSearch={false} />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido principal */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          {activeTab === 'events' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                    Mis Eventos
                  </h1>
                  <p style={{ color: '#94A3B8' }}>
                    Gestiona y realiza seguimiento de tus eventos
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-4" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                      <Calendar className="h-5 w-5" style={{ color: '#A78BFA' }} />
                    </div>
                    <div>
                      <p className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                        {organizerEvents.length}
                      </p>
                      <p className="text-sm" style={{ color: '#64748B' }}>Total eventos</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <TrendingUp className="h-5 w-5" style={{ color: '#34D399' }} />
                    </div>
                    <div>
                      <p className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                        {approvedCount}
                      </p>
                      <p className="text-sm" style={{ color: '#64748B' }}>Aprobados</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <Bell className="h-5 w-5" style={{ color: '#FBBF24' }} />
                    </div>
                    <div>
                      <p className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                        {pendingCount}
                      </p>
                      <p className="text-sm" style={{ color: '#64748B' }}>Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              {organizerEvents.length > 0 && (
                <div className="mb-6">
                  <TrendChart 
                    data={trendData} 
                    title="Actividad de Eventos" 
                    subtitle="Interacciones esta semana"
                    valueLabel="interacciones"
                    color="violet"
                  />
                </div>
              )}

              {isLoadingEvents ? (
                <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)', color: '#94A3B8' }}>
                  Cargando eventos...
                </div>
              ) : organizerEvents.length > 0 ? (
                <div className="rounded-xl overflow-x-auto" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                        <TableHead style={{ color: '#94A3B8' }}>Título</TableHead>
                        <TableHead style={{ color: '#94A3B8' }}>Categoría</TableHead>
                        <TableHead style={{ color: '#94A3B8' }}>Fecha</TableHead>
                        <TableHead style={{ color: '#94A3B8' }}>Estado</TableHead>
                        <TableHead className="text-right" style={{ color: '#94A3B8' }}>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizerEvents.map((event) => (
                        <TableRow key={event.id} style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                          <TableCell>
                            <Link
                              to={`/event/${event.id}`}
                              className="hover:underline transition-all"
                              style={{ fontWeight: 600, color: '#F8FAFC' }}
                            >
                              {event.titulo}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.categoria as any} />
                          </TableCell>
                          <TableCell style={{ color: '#94A3B8' }}>
                            {event.fecha ? (() => {
                              const [y, m, d] = event.fecha.split('-').map(Number);
                              return format(new Date(y, m - 1, d), 'dd/MM/yyyy');
                            })() : '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={event.estado as any} />
                            {(event.estado === 'Rejected' || event.estado === 'rechazado') && event.observacion_admin && (
                              <div className="mt-1 text-xs rounded p-2 max-w-md break-words whitespace-normal"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#F87171' }}>
                                <span style={{ fontWeight: 600 }}>Observación del admin: </span>
                                {event.observacion_admin}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(event.id)}
                                disabled={event.estado !== 'Draft' && event.estado !== 'borrador' && event.estado !== 'Rejected' && event.estado !== 'rechazado'}
                                title={event.estado === 'Draft' || event.estado === 'borrador' || event.estado === 'Rejected' || event.estado === 'rechazado' ? 'Editar evento' : 'Solo puedes editar eventos en borrador o rechazados'}
                                className="transition-all"
                                style={{ borderColor: 'rgba(30, 64, 175, 0.4)', color: '#60A5FA', background: 'rgba(30, 64, 175, 0.1)' }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenStreamDialog(event)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="transition-all"
                                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)' }}
                                title={event.estado === 'Approved' || event.estado === 'aprobado' ? 'Añadir enlace de transmisión' : 'Solo eventos aprobados pueden tener transmisión'}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(event.id)}
                                disabled={event.estado !== 'Approved' && event.estado !== 'aprobado'}
                                className="transition-all"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)' }}
                                title={event.estado === 'Approved' || event.estado === 'aprobado' ? 'Cancelar evento' : 'Solo puedes cancelar eventos aprobados'}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {(event.estado === 'borrador' || event.estado === 'cancelado') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEliminar(event.id)}
                                  className="transition-all"
                                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)' }}
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
                <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#64748B' }} />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600, color: '#F8FAFC' }}>
                    Aún no tienes eventos
                  </h3>
                  <p style={{ color: '#94A3B8' }} className="mb-6">
                    ¡Publica tu primer evento para empezar!
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                  Mis Eventos Favoritos
                </h1>
                <p style={{ color: '#94A3B8' }}>
                  Aquí encontrarás los eventos que has guardado
                </p>
              </div>

              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 rounded-xl animate-pulse" style={{ background: 'rgba(30, 41, 59, 0.5)' }} />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <Heart className="h-12 w-12 mx-auto mb-4" style={{ color: '#64748B' }} />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600, color: '#F8FAFC' }}>
                    Aún no tienes favoritos
                  </h3>
                  <p style={{ color: '#94A3B8' }}>
                    Explora eventos y guárdalos para verlos aquí
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                Notificaciones
              </h1>
              <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <Bell className="h-12 w-12 mx-auto mb-4" style={{ color: '#64748B' }} />
                <h3 className="text-lg mb-2" style={{ fontWeight: 600, color: '#F8FAFC' }}>
                  Sin notificaciones
                </h3>
                <p style={{ color: '#94A3B8' }}>
                  ¡Estás al día!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                Mi Perfil
              </h1>
              <div className="rounded-xl p-6 max-w-2xl" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #1E40AF 100%)', color: '#FFFFFF' }}>
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: '#F8FAFC' }}>{usuario.nombre_completo}</h2>
                    <p style={{ color: '#94A3B8' }}>{usuario.email}</p>
                    <p className="text-sm capitalize font-medium" style={{ color: '#A78BFA' }}>{usuario.rol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm" style={{ color: '#64748B' }}>Total de eventos publicados</label>
                    <p className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                      {organizerEvents.length}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: '#64748B' }}>Eventos aprobados</label>
                    <p className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                      {approvedCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para añadir el enlace del stream */}
      <Dialog open={streamDialogOpen} onOpenChange={setStreamDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#F8FAFC' }}>Enlace de Transmisión (Stream)</DialogTitle>
            <DialogDescription style={{ color: '#94A3B8' }}>
              Añade el enlace de YouTube, Twitch u otra plataforma para la transmisión en vivo del evento "{selectedEventForStream?.titulo}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stream-link" style={{ color: '#F8FAFC' }}>Enlace o ID de Transmisión</Label>
              <Input
                id="stream-link"
                placeholder="Ej. m3u8, Playback ID de Mux..."
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
                style={{ background: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(148, 163, 184, 0.15)', color: '#F8FAFC' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStreamDialogOpen(false)} 
              className="transition-all"
              style={{ borderColor: 'rgba(148, 163, 184, 0.2)', color: '#94A3B8' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveStreamLink} 
              className="transition-all btn-shimmer"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', color: '#FFFFFF', border: 'none' }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
