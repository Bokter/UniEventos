import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Share2, ArrowLeft, User, Star, Video, VideoOff } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { EventMap } from "../components/EventMap";
import { LiveStreamPlayer } from "../components/LiveStreamPlayer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { obtenerUsuario } from "../services/auth.service";
import { eventosApi } from "../services/api.service";
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
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [streamLink, setStreamLink] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const data = await eventosApi.getById(id);
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

        // Fetch favorites to set initial state
        if (usuario) {
          const userFavorites = await favoritosApi.getAll();
          const isFav = userFavorites.some((f: any) => String(f.id) === String(id));
          setIsFavorite(isFav);
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
      <div className="min-h-screen bg-white">
        <Navbar showSearch={false} />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground animate-pulse">Cargando detalles del evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar showSearch={false} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl mb-4" style={{ fontWeight: 600 }}>Evento no encontrado</h1>
          <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  // Mapper helpers for backend names
  const titulo = event.titulo || event.title;
  const descripcion = event.descripcion || event.description;
  const categoria = event.categoria || event.category;
  const fechaInicio = event.fecha_inicio ? new Date(event.fecha_inicio) : new Date(event.dateStart);
  const fechaFin = event.fecha_fin ? new Date(event.fecha_fin) : new Date(event.dateEnd);
  const lugarNombre = event.lugar?.nombre || event.location?.name;
  const lat = event.lugar?.lat || event.location?.lat;
  const lng = event.lugar?.lng || event.location?.lng;
  const imagenPortada = event.imagen_portada || event.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
  
  const organizadores = event.organizadores || event.organizers || [];
  const isOrganizer = !!usuario && organizadores.some((o: any) => String(o.id) === String(usuario.id));

  const handleStartStream = () => {
    if (!usuario || !isOrganizer) {
      toast.error("Solo el organizador del evento puede iniciar una transmisión");
      return;
    }
    setShowStreamDialog(true);
  };

  const handleSaveStreamLink = async () => {
    if (!event || !usuario) return;
    
    // NOTE: Implementation depends on backend endpoint for saving stream link
    // For now, we simulate the update or call a hypothetical endpoint if it existed
    toast.success("Enlace de transmisión guardado");
    setShowStreamDialog(false);
    
    // Re-fetch or update local state
    const newStream = { organizerId: String(usuario.id), streamLink };
    const updatedStreams = [...(event.streams || [])];
    const idx = updatedStreams.findIndex(s => String(s.organizerId) === String(usuario.id));
    if (idx >= 0) updatedStreams[idx] = newStream;
    else updatedStreams.push(newStream);
    
    setEvent({ ...event, streams: updatedStreams });
    if (!activeStreamId) setActiveStreamId(String(usuario.id));
  };

  const handleEndStream = async () => {
    if (!usuario || !isOrganizer) return;
    if (!confirm("¿Estás seguro de que quieres finalizar la transmisión?")) return;

    setIsLoadingStream(true);
    // Simulating API call
    setTimeout(() => {
      const updatedStreams = (event.streams || []).filter((s: any) => String(s.organizerId) !== String(usuario.id));
      setEvent({ ...event, streams: updatedStreams });
      if (activeStreamId === String(usuario.id)) {
        setActiveStreamId(updatedStreams.length > 0 ? updatedStreams[0].organizerId : null);
      }
      setIsLoadingStream(false);
      toast.success("Transmisión finalizada");
    }, 1000);
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
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar showSearch={false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        <div className="aspect-[21/9] rounded-lg overflow-hidden mb-6 bg-gray-100">
          <img src={imagenPortada} alt={titulo} className="w-full h-full object-cover" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {event.streams && event.streams.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl" style={{ fontWeight: 600 }}>Live Stream</h2>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    EN VIVO
                  </span>
                </div>

                {event.streams.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.streams.map((stream: any) => {
                      const org = organizadores.find((o: any) => String(o.id) === String(stream.organizerId));
                      return (
                        <button
                          key={stream.organizerId}
                          onClick={() => setActiveStreamId(stream.organizerId)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeStreamId === stream.organizerId
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                          Stream de {org?.nombre_completo || org?.name || 'Organizador'}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeStreamId && (
                  <LiveStreamPlayer
                    playbackId={event.streams.find((s: any) => s.organizerId === activeStreamId)?.streamLink || ""}
                    status="active"
                  />
                )}
              </div>
            )}

            <div className="mb-4">
              <CategoryBadge category={categoria} className="mb-3" />
              <h1 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: 700 }}>{titulo}</h1>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }} className="capitalize">
                    {format(fechaInicio, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(fechaInicio, 'h:mm a', { locale: es })} - {format(fechaFin, 'h:mm a', { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }}>{lugarNombre}</div>
                  <div className="text-sm text-muted-foreground">Ubicación del evento en el campus</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }}>Organizado por</div>
                  <div className="text-sm text-muted-foreground">
                    {organizadores.map((o: any) => o.nombre_completo || o.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontWeight: 600 }}>Sobre este evento</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{descripcion}</div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontWeight: 600 }}>Ubicación</h2>
              <EventMap lat={lat} lng={lng} locationName={lugarNombre} />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Button
                variant={isFavorite ? "default" : "outline"}
                className={isFavorite ? "w-full bg-[#1D9E75] hover:bg-[#188c66] text-white" : "w-full"}
                onClick={handleToggleFavorite}
              >
                <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
              </Button>

              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir evento
              </Button>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                <h3 className="text-sm mb-1" style={{ fontWeight: 600 }}>Organizadores</h3>
                {organizadores.map((org: any) => (
                  <div key={org.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                      {(org.nombre_completo || org.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="line-clamp-1">
                        {org.nombre_completo || org.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{org.email}</div>
                    </div>
                  </div>
                ))}
              </div>

              {isOrganizer && (
                <div className="mt-4">
                  {(event.streams && event.streams.some((s: any) => String(s.organizerId) === String(usuario?.id))) ? (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" onClick={() => setShowStreamDialog(true)}>
                        <Video className="h-4 w-4 mr-2" />
                        Ver Configuración
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleEndStream} disabled={isLoadingStream}>
                        <VideoOff className={`h-4 w-4 mr-2 ${isLoadingStream ? "animate-spin" : ""}`} />
                        Finalizar Stream
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={handleStartStream} disabled={isLoadingStream}>
                      <Video className={`h-4 w-4 mr-2 ${isLoadingStream ? "animate-spin" : ""}`} />
                      Iniciar Transmisión
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enlace de Transmisión (Stream)</DialogTitle>
            <DialogDescription>
              Añade el enlace de Mux (Playback ID o Stream URL) para la transmisión en vivo del evento "{titulo}".
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
            <Button variant="outline" onClick={() => setShowStreamDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveStreamLink} className="bg-primary text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}