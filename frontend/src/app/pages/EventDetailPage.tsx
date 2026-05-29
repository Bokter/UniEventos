import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Share2, ArrowLeft, User, Star, Video, VideoOff, Glasses } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventHeroCard } from "../components/visual/EventHeroCard";
import type { EstadoPill } from "../components/visual/StatusPill";
import { Button } from "../components/ui/button";
import { EventMap } from "../components/EventMap";
import { LiveStreamPlayer } from "../components/LiveStreamPlayer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { obtenerUsuario } from "../services/auth.service";
import { eventosApi, favoritosApi } from "../services/api.service";
import { toast } from "sonner";


export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [streamLink, setStreamLink] = useState("");
  const [activeStreamId, setActiveStreamId] = useState<number | null>(null);


  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const data = await eventosApi.getById(id) as any;
        setEvent(data);

        // Check if current user is an organizer to set initial stream link
        if (usuario && data.streams) {
          const userStream = data.streams.find((s: any) => String(s.organizerId) === String(usuario.id));
          if (userStream) {
            setStreamLink(userStream.streamLink);
          }
        }

        // Set first active stream if available
        if (data.streams && data.streams.length > 0) {
          setActiveStreamId(data.streams[0].organizerId);
        }

        // Fetch favorites to set initial state (solo para no-admins)
        if (usuario && usuario.rol !== 'admin') {
          const userFavorites = await favoritosApi.getAll() as any[];
          const isFav = userFavorites.some((f: any) => String(f.id) === String(id));
          setIsFavorite(isFav);
        }

        // Set first active stream if available
        if (data.transmisiones && data.transmisiones.length > 0) {
          setActiveStreamId(data.transmisiones[0].id);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Error al cargar los detalles del evento");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, usuario?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <Navbar showSearch={false} />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="font-caption animate-pulse">Cargando detalles del evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <Navbar showSearch={false} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-h1 mb-4">Evento no encontrado</h1>
          <Button onClick={() => navigate("/")} className="dashboard-btn-primary-filled">Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  // Mapper helpers for backend names
  const titulo = event.titulo || event.title;
  const descripcion = event.descripcion || event.description;
  const categoria = event.categoria || event.category;
  // Helper para parsear fechas de forma segura
  const parseSafeDate = (dateVal: any) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date(); // Fallback a hoy si es inválida
    return d;
  };

  const fechaBase = event.fecha || event.dateStart;
  const horaInicioStr = event.hora_inicio || '00:00:00';
  const horaFinStr = event.hora_fin || '00:00:00';

  const fechaInicio = parseSafeDate(event.fecha ? `${event.fecha}T${horaInicioStr}` : (event.dateStart || new Date()));
  const fechaFin = parseSafeDate(event.fecha ? `${event.fecha}T${horaFinStr}` : (event.dateEnd || new Date()));
  const lugarNombre = event.lugar?.nombre || event.location?.name;
  const lat = Number(event.lugar?.latitud || event.lugar?.lat || event.location?.lat || 0);
  const lng = Number(event.lugar?.longitud || event.lugar?.lng || event.location?.lng || 0);
  const imagenPortada = event.imagen_portada || event.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';

  const organizadores = event.organizadores || event.organizers || (event.organizador ? [event.organizador] : []);
  // Ensure unique organizers by ID to avoid duplicate key warnings
  const allOrganizersMap = new Map();
  [...organizadores, ...(event.coorganizadores || [])].forEach(o => {
    if (o && o.id) allOrganizersMap.set(String(o.id), o);
  });
  const allOrganizers = Array.from(allOrganizersMap.values());
  const isOrganizer = !!usuario && allOrganizers.some((o: any) => String(o.id) === String(usuario.id));
  const myStream = event.transmisiones?.find((t: any) => String(t.organizador?.id) === String(usuario?.id));

  const handleStartStream = () => {
    if (!usuario || !isOrganizer) {
      toast.error("Solo los organizadores pueden iniciar una transmisión");
      return;
    }
    setStreamLink(myStream?.stream_url || "");
    setShowStreamDialog(true);
  };

  const handleSaveStreamLink = async () => {
    if (!id || !streamLink) return;
    setIsLoadingStream(true);
    try {
      await eventosApi.registrarStream(id, streamLink);
      toast.success("Transmisión iniciada/actualizada");
      setShowStreamDialog(false);
      // Reload event data
      const data = await eventosApi.getById(id);
      setEvent(data);
    } catch (error) {
      toast.error("Error al registrar transmisión");
    } finally {
      setIsLoadingStream(false);
    }
  };

  const handleEndStream = async () => {
    if (!id || !confirm("¿Estás seguro de que quieres finalizar tu transmisión?")) return;
    setIsLoadingStream(true);
    try {
      await eventosApi.eliminarStream(id);
      toast.success("Transmisión finalizada");
      // Reload event data
      const data = await eventosApi.getById(id);
      setEvent(data);
      if (activeStreamId === myStream?.id) setActiveStreamId(null);
    } catch (error) {
      toast.error("Error al finalizar transmisión");
    } finally {
      setIsLoadingStream(false);
    }
  };


  const handleToggleFavorite = async () => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    if (!id) return;

    try {
      if (isFavorite) {
        await favoritosApi.remove(id);
        setIsFavorite(false);
        toast.success("Eliminado de favoritos");
      } else {
        await favoritosApi.add(id);
        setIsFavorite(true);
        toast.success("Agregado a favoritos");
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: descripcion,
          url: window.location.href,
        });
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const estadoStr = String(event.estado || "").toLowerCase();
  let estadoHero: EstadoPill = "proximo";
  const now = new Date();
  if (estadoStr === "terminado" || estadoStr === "cancelado") estadoHero = "terminado";
  else if (now >= fechaInicio && now <= fechaFin) estadoHero = "en_curso";
  else if (now < fechaInicio) estadoHero = "por_iniciar";
  else if (now > fechaFin) estadoHero = "terminado";

  const fechaInicioLabel = format(fechaInicio, "EEEE, d 'de' MMMM yyyy · HH:mm", { locale: es });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar showSearch={false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 uni-btn-ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        <EventHeroCard
          imagenPortada={imagenPortada}
          titulo={titulo}
          categoria={categoria}
          fechaInicio={fechaInicioLabel}
          estado={estadoHero}
          horaInicio={horaInicioStr}
          horaFin={horaFinStr}
          className="mb-8"
        />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {event.transmisiones && event.transmisiones.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="font-h3 text-xl">Transmisiones en vivo</h2>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit"
                    style={{
                      background: "color-mix(in srgb, var(--status-red) 30%, var(--bg-elevated))",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse status-dot-pulse" style={{ background: "var(--accent-primary)" }}></span>
                    EN VIVO
                  </span>
                </div>

                {event.transmisiones.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.transmisiones.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveStreamId(t.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 ${activeStreamId === t.id
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] text-[var(--text-primary)]'
                          : 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]'
                          }`}
                      >
                        En vivo: {t.organizador?.nombre_completo || 'Organizador'}
                      </button>
                    ))}
                  </div>
                )}

                <LiveStreamPlayer
                  url={event.transmisiones.find((t: any) => t.id === (activeStreamId || event.transmisiones[0].id))?.stream_url || ""}
                />
              </div>
            )}



            <div className="space-y-3 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div className="font-body capitalize" style={{ fontWeight: 600 }}>
                    {format(fechaInicio, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                  <div className="font-caption text-sm">
                    {format(fechaInicio, 'h:mm a', { locale: es })} - {format(fechaFin, 'h:mm a', { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div className="font-body" style={{ fontWeight: 600 }}>{lugarNombre}</div>
                  <div className="font-caption text-sm">Ubicación del evento en el campus</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div className="font-body" style={{ fontWeight: 600 }}>Organizado por</div>
                  <div className="font-caption text-sm">
                    {allOrganizers.map((o: any) => o.nombre_completo || o.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-h3 text-xl mb-3">Sobre este evento</h2>
              <div className="font-body leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{descripcion}</div>
            </div>

            <div className="mb-6">
              <h2 className="font-h3 text-xl mb-3">Ubicación</h2>
              <EventMap lat={lat} lng={lng} locationName={lugarNombre} />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {usuario?.rol !== 'admin' && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  className={isFavorite ? "w-full dashboard-btn-success" : "w-full dashboard-btn-outline dashboard-btn-edit event-detail-sidebar-btn"}
                  onClick={handleToggleFavorite}
                >
                  <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
                </Button>
              )}

              <Button variant="outline" className="w-full dashboard-btn-outline dashboard-btn-edit event-detail-sidebar-btn" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir evento
              </Button>

              <Button
                className="w-full dashboard-btn-primary-filled"
                onClick={() => window.open(`/ar-viewer.html?eventoId=${id}`, '_blank')}
              >
                <Glasses className="h-4 w-4 mr-2" />
                Ver evento en AR
              </Button>

              <div className="event-detail-panel space-y-4">
                <h3 className="font-h3 text-sm mb-1">Organizadores</h3>
                {allOrganizers.map((org: any) => (
                  <div key={org.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
                    >
                      {(org.nombre_completo || org.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body line-clamp-1" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {org.nombre_completo || org.name}
                      </div>
                      <div className="font-caption text-xs line-clamp-1">{org.email}</div>
                    </div>
                  </div>
                ))}
              </div>


              {isOrganizer && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-h3 text-sm mb-2">Tu transmisión</h3>
                  {myStream ? (
                    <>
                      <Button variant="outline" className="w-full dashboard-btn-outline dashboard-btn-edit event-detail-sidebar-btn" onClick={handleStartStream}>
                        <Video className="h-4 w-4 mr-2" />
                        Cambiar Enlace
                      </Button>
                      <Button variant="destructive" className="w-full dashboard-btn-outline dashboard-btn-danger-outline event-detail-sidebar-btn" onClick={handleEndStream} disabled={isLoadingStream}>
                        <VideoOff className={`h-4 w-4 mr-2 ${isLoadingStream ? "animate-spin" : ""}`} />
                        Finalizar Mi Stream
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full dashboard-btn-outline dashboard-btn-toggle event-detail-sidebar-btn" onClick={handleStartStream}>
                      <Video className="h-4 w-4 mr-2" />
                      Iniciar Mi Transmisión
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent className="sm:max-w-[425px] border-[var(--border-default)]">
          <DialogHeader>
            <DialogTitle>Iniciar Transmisión</DialogTitle>
            <DialogDescription>
              Pega el enlace de YouTube o Twitch para tu transmisión del evento "{titulo}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stream-url" className="uni-label">URL del Stream</Label>
              <Input
                id="stream-url"
                className="uni-input mt-0"
                placeholder="https://www.youtube.com/watch?v=..."
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStreamDialog(false)} className="dashboard-btn-outline dashboard-btn-edit">Cancelar</Button>
            <Button onClick={handleSaveStreamLink} disabled={isLoadingStream} className="dashboard-btn-primary-filled">
              {isLoadingStream ? "Guardando..." : "Guardar Enlace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}