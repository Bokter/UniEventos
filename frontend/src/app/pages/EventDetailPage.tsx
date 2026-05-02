import { useParams, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Heart, Share2, ArrowLeft, User, Star, Video, VideoOff, Copy } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { EventMap } from "../components/EventMap";
// import { LiveStreamPlayer } from "../components/LiveStreamPlayer"; // Comentado - Implementar integración Mux
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockEvents, mockFavoriteEvents, toggleFavorite } from "../data/mockData";
import { obtenerUsuario } from "../services/auth.service";
// import { projectId, publicAnonKey } from "/utils/supabase/info"; // Comentado - Implementar integración Mux
import { toast } from "sonner";

interface StreamData {
  streamId: string;
  streamKey?: string;
  playbackId: string;
  status: string;
  organizerId: string;
  isMock?: boolean;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(() => {
    return mockFavoriteEvents.some(e => e.id === id);
  });
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [showStreamDialog, setShowStreamDialog] = useState(false);

  const event = mockEvents.find(e => e.id === id);

  // Check if there's an active stream
  // COMENTADO - Implementar integración con Mux
  /*
  useEffect(() => {
    if (!id) return;

    const checkStream = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a05bd8dc/events/${id}/stream`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStreamData(data);
        }
      } catch (error) {
        console.error("Error checking stream:", error);
      }
    };

    checkStream();
    // Poll every 10 seconds for stream status updates
    const interval = setInterval(checkStream, 10000);

    return () => clearInterval(interval);
  }, [id]);
  */

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar showSearch={false} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl mb-4">Evento no encontrado</h1>
          <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  const usuario = obtenerUsuario();

  // Es organizador si el id del usuario actual coincide con el del organizador del evento
  const isOrganizer = !!usuario && String(usuario.id) === String(event.organizer.id);

  const handleStartStream = async () => {
    if (!usuario || !isOrganizer) {
      toast.error("Solo el organizador del evento puede iniciar una transmisión");
      return;
    }

    setIsLoadingStream(true);

    // COMENTADO - Implementar integración con Mux
    // Simulación de inicio de transmisión para UI
    setTimeout(() => {
      toast.info("⚙️ Función de transmisión en desarrollo. Configurar Mux API para activar.");
      setIsLoadingStream(false);
      setShowStreamDialog(true);
    }, 1000);

    /*
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a05bd8dc/events/${id}/stream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organizerId: currentUser.id }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create stream';
        
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setStreamData(data);
      setShowStreamDialog(true);
      
      if (data.isMock) {
        toast.success("¡Transmisión demo creada! (Modo demostración - configura Mux para transmisiones reales)");
      } else {
        toast.success("¡Transmisión creada exitosamente!");
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear la transmisión";
      toast.error(errorMessage);
    } finally {
      setIsLoadingStream(false);
    }
    */
  };

  const handleEndStream = async () => {
    if (!usuario || !isOrganizer) {
      toast.error("Solo el organizador del evento puede finalizar una transmisión");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres finalizar la transmisión?")) {
      return;
    }

    setIsLoadingStream(true);

    // COMENTADO - Implementar integración con Mux
    setTimeout(() => {
      setStreamData(null);
      setShowStreamDialog(false);
      toast.success("Transmisión finalizada (Simulación)");
      setIsLoadingStream(false);
    }, 1000);

    /*
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a05bd8dc/events/${id}/stream`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to end stream');
      }

      setStreamData(null);
      setShowStreamDialog(false);
      toast.success("Transmisión finalizada");
    } catch (error) {
      console.error("Error ending stream:", error);
      toast.error("Error al finalizar la transmisión");
    } finally {
      setIsLoadingStream(false);
    }
    */
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleToggleFavorite = () => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    if (!id) return;
    const isNowFavorite = toggleFavorite(id);
    setIsFavorite(isNowFavorite);

    if (isNowFavorite) {
      toast.success("Evento agregado a favoritos");
    } else {
      toast.success("Evento eliminado de favoritos");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar showSearch={false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        {/* Cover Image */}
        <div className="aspect-[21/9] rounded-lg overflow-hidden mb-6">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Live Stream Player - Show if stream is active */}
            {/* COMENTADO - Implementar integración con Mux */}
            {streamData && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl" style={{ fontWeight: 600 }}>Live Stream</h2>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    EN VIVO
                  </span>
                </div>
                {/* <LiveStreamPlayer playbackId={streamData.playbackId} status={streamData.status} /> */}
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center max-w-md px-4">
                    <div className="mb-4 text-4xl">🎥</div>
                    <p className="text-lg font-semibold mb-2">Transmisión en Vivo</p>
                    <p className="text-sm text-gray-400">
                      Implementar integración con Mux para transmisiones en vivo.
                      Configurar MUX_TOKEN_ID y MUX_TOKEN_SECRET en Supabase.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <CategoryBadge category={event.category} className="mb-3" />
              <h1 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: 700 }}>
                {event.title}
              </h1>
            </div>

            {/* Event Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }} className="capitalize">
                    {format(event.dateStart, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(event.dateStart, 'h:mm a', { locale: es })} - {format(event.dateEnd, 'h:mm a', { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }}>{event.location.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Ubicación del evento en el campus
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div style={{ fontWeight: 600 }}>Organizado por</div>
                  <div className="text-sm text-muted-foreground">
                    {event.organizer.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontWeight: 600 }}>Sobre este evento</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Map */}
            <div className="mb-6">
              <h2 className="text-xl mb-3" style={{ fontWeight: 600 }}>Ubicación</h2>
              <EventMap
                lat={event.location.lat}
                lng={event.location.lng}
                locationName={event.location.name}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Favorite Button */}
              <Button
                variant={isFavorite ? "default" : "outline"}
                className={isFavorite ? "w-full bg-[#1D9E75] hover:bg-[#188c66] text-white" : "w-full"}
                onClick={handleToggleFavorite}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 mr-2 fill-current" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir evento
              </Button>

              {/* Organizer Card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm mb-3" style={{ fontWeight: 600 }}>
                  Organizador
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                    {event.organizer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 600 }} className="line-clamp-1">
                      {event.organizer.name}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {event.organizer.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stream Controls */}
              {isOrganizer && (
                <div className="mt-4">
                  {streamData ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowStreamDialog(true)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Ver Configuración
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleEndStream}
                        disabled={isLoadingStream}
                      >
                        {isLoadingStream ? (
                          <VideoOff className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <VideoOff className="h-4 w-4 mr-2" />
                        )}
                        Finalizar Stream
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleStartStream}
                      disabled={isLoadingStream}
                    >
                      {isLoadingStream ? (
                        <Video className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4 mr-2" />
                      )}
                      Iniciar Transmisión
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stream Dialog */}
      {showStreamDialog && (
        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configuración de Transmisión</DialogTitle>
              <DialogDescription>
                Esta es la interfaz donde se mostrará la configuración RTMP para OBS/Streamlabs cuando se integre Mux.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                <div className="text-4xl mb-3">🎥</div>
                <p className="font-semibold text-blue-900 mb-2">
                  Integración Mux Pendiente
                </p>
                <p className="text-sm text-blue-700">
                  Para habilitar transmisiones en vivo:
                </p>
                <ol className="text-sm text-blue-700 text-left mt-3 space-y-1 list-decimal list-inside">
                  <li>Crear cuenta en Mux.com</li>
                  <li>Obtener MUX_TOKEN_ID y MUX_TOKEN_SECRET</li>
                  <li>Configurar secretos en Supabase</li>
                  <li>Descomentar código de integración en EventDetailPage.tsx</li>
                  <li>Implementar endpoints de backend para Mux API</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Información que se mostrará:</strong>
                  <br />
                  • Stream URL (RTMP): rtmps://global-live.mux.com:443/app
                  <br />
                  • Stream Key: [Generado por Mux]
                  <br />
                  • Playback ID: [Generado por Mux]
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowStreamDialog(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* COMENTADO - Dialog original con configuración de stream */}
      {/* 
      {showStreamDialog && streamData && (
        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Stream Configuration</DialogTitle>
              <DialogDescription>
                Use esta información para configurar tu software de transmisión (OBS, Streamlabs, etc.)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="stream-url">Stream URL (RTMP)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="stream-url"
                    value="rtmps://global-live.mux.com:443/app"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard("rtmps://global-live.mux.com:443/app")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="stream-key">Stream Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="stream-key"
                    value={streamData.streamKey || ""}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(streamData.streamKey || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Instrucciones:</strong>
                  <br />
                  1. Abre tu software de transmisión (OBS, Streamlabs, etc.)
                  <br />
                  2. Configura el servidor/URL RTMP con la Stream URL
                  <br />
                  3. Ingresa el Stream Key en tu software
                  <br />
                  4. Inicia la transmisión desde tu software
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Importante:</strong> No compartas tu Stream Key con nadie. Cualquiera con esta clave puede transmitir a tu evento.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowStreamDialog(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndStream}
                disabled={isLoadingStream}
              >
                {isLoadingStream ? (
                  <VideoOff className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <VideoOff className="h-4 w-4 mr-2" />
                )}
                Finalizar Transmisión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      */}
    </div>
  );
}