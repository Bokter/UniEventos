import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Share2, ArrowLeft, User, Star, Video, VideoOff, Glasses } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
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

        if (usuario && data.streams) {
          const userStream = data.streams.find((s: any) => String(s.organizerId) === String(usuario.id));
          if (userStream) {
            setStreamLink(userStream.streamLink);
          }
        }

        if (data.streams && data.streams.length > 0) {
          setActiveStreamId(data.streams[0].organizerId);
        }

        if (usuario && usuario.rol !== 'admin') {
          const userFavorites = await favoritosApi.getAll() as any[];
          const isFav = userFavorites.some((f: any) => String(f.id) === String(id));
          setIsFavorite(isFav);
        }

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
      <div className="min-h-screen" style={{ background: '#0F172A' }}>
        <Navbar showSearch={false} />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="animate-pulse" style={{ color: '#94A3B8' }}>Cargando detalles del evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen" style={{ background: '#0F172A' }}>
        <Navbar showSearch={false} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl mb-4" style={{ fontWeight: 600, color: '#F8FAFC' }}>Evento no encontrado</h1>
          <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  const titulo = event.titulo || event.title;
  const descripcion = event.descripcion || event.description;
  const categoria = event.categoria || event.category;
  
  const parseSafeDate = (dateVal: any) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date();
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

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      <Navbar showSearch={false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="mb-4 transition-all"
          style={{ color: '#94A3B8' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        <div className="aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden mb-6 relative"
          style={{ background: '#1E293B' }}>
          <img src={imagenPortada} alt={titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {event.transmisiones && event.transmisiones.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#F8FAFC' }}>
                    Transmisiones en vivo
                  </h2>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }}></span>
                    EN VIVO
                  </span>
                </div>

                {event.transmisiones.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.transmisiones.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveStreamId(t.id)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={activeStreamId === t.id
                          ? { background: 'rgba(124, 58, 237, 0.2)', color: '#A78BFA', border: '1px solid rgba(124, 58, 237, 0.3)' }
                          : { background: 'rgba(51, 65, 85, 0.5)', color: '#94A3B8', border: '1px solid rgba(148, 163, 184, 0.1)' }
                        }
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

            <div className="mb-4">
              <CategoryBadge category={categoria} className="mb-3" />
              <h1 className="text-3xl md:text-4xl mb-4" 
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>
                {titulo}
              </h1>
            </div>

            <div className="space-y-3 mb-6 pb-6"
              style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#7C3AED' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }} className="capitalize">
                    {format(fechaInicio, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>
                    {format(fechaInicio, 'h:mm a', { locale: es })} - {format(fechaFin, 'h:mm a', { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5" style={{ color: '#F43F5E' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{lugarNombre}</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>Ubicación del evento en el campus</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5" style={{ color: '#1E40AF' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Organizado por</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>
                    {allOrganizers.map((o: any) => o.nombre_completo || o.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#F8FAFC' }}>
                Sobre este evento
              </h2>
              <div className="leading-relaxed whitespace-pre-wrap" style={{ color: '#94A3B8' }}>{descripcion}</div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#F8FAFC' }}>
                Ubicación
              </h2>
              <EventMap lat={lat} lng={lng} locationName={lugarNombre} />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {usuario?.rol !== 'admin' && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  className="w-full transition-all"
                  onClick={handleToggleFavorite}
                  style={isFavorite 
                    ? { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', border: 'none' }
                    : { borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)' }
                  }
                >
                  <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full transition-all" 
                onClick={handleShare}
                style={{ borderColor: 'rgba(30, 64, 175, 0.4)', color: '#60A5FA', background: 'rgba(30, 64, 175, 0.1)' }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir evento
              </Button>

              <Button
                className="w-full btn-shimmer transition-all"
                onClick={() => window.open(`/ar-viewer.html?eventoId=${id}`, '_blank')}
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', color: '#FFFFFF', border: 'none' }}
              >
                <Glasses className="h-4 w-4 mr-2" />
                Ver evento en AR
              </Button>

              <div className="rounded-xl p-4 space-y-4"
                style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <h3 className="text-sm mb-1" style={{ fontWeight: 600, color: '#F8FAFC' }}>Organizadores</h3>
                {allOrganizers.map((org: any) => (
                  <div key={org.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #1E40AF 100%)', color: '#FFFFFF' }}>
                      {(org.nombre_completo || org.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }} className="line-clamp-1">
                        {org.nombre_completo || org.name}
                      </div>
                      <div className="text-xs line-clamp-1" style={{ color: '#64748B' }}>{org.email}</div>
                    </div>
                  </div>
                ))}
              </div>


              {isOrganizer && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#F8FAFC' }}>Tu transmisión</h3>
                  {myStream ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full transition-all" 
                        onClick={handleStartStream}
                        style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#A78BFA', background: 'rgba(124, 58, 237, 0.1)' }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Cambiar Enlace
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={handleEndStream} 
                        disabled={isLoadingStream}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      >
                        <VideoOff className={`h-4 w-4 mr-2 ${isLoadingStream ? "animate-spin" : ""}`} />
                        Finalizar Mi Stream
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full transition-all" 
                      onClick={handleStartStream}
                      style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#A78BFA', background: 'rgba(124, 58, 237, 0.1)' }}
                    >
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
        <DialogContent className="sm:max-w-[425px]" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#F8FAFC' }}>Iniciar Transmisión</DialogTitle>
            <DialogDescription style={{ color: '#94A3B8' }}>
              Pega el enlace de YouTube o Twitch para tu transmisión del evento "{titulo}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stream-url" style={{ color: '#F8FAFC' }}>URL del Stream</Label>
              <Input
                id="stream-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
                style={{ background: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(148, 163, 184, 0.15)', color: '#F8FAFC' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowStreamDialog(false)}
              style={{ borderColor: 'rgba(148, 163, 184, 0.2)', color: '#94A3B8' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveStreamLink} 
              disabled={isLoadingStream}
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', color: '#FFFFFF' }}
            >
              {isLoadingStream ? "Guardando..." : "Guardar Enlace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
