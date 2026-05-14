import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Upload, Check, X as CloseIcon } from "lucide-react";
import L from "leaflet";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CategoryBadge } from "../components/CategoryBadge";
import { useAuth } from "../../context/AuthContext";
import { eventosApi, categoriasApi, lugaresApi, usuariosApi } from "../services/api.service";
import { toast } from "sonner";
import { notificationService } from "../services/notification.service";

// Fix for default marker icon
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (error) {
  console.error("Error configurando iconos de Leaflet:", error);
}

interface LocationMapProps {
  locationCoords: [number, number] | null;
  setLocationCoords: (coords: [number, number]) => void;
}

function LocationMap({ locationCoords, setLocationCoords }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Coordenadas de la Universidad del Norte: 11.019, -74.851
      const map = L.map(mapContainerRef.current).setView([11.019, -74.851], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Límites aproximados del campus de Uninorte
        // (Ajustar si es necesario, estos valores cubren el campus principal)
        const isInsideCampus = 
          lat >= 11.0140 && lat <= 11.0240 &&
          lng >= -74.8550 && lng <= -74.8460;

        if (!isInsideCampus) {
          toast.error("La ubicación del evento debe estar dentro del campus de la Universidad del Norte.");
          return;
        }

        setLocationCoords([lat, lng]);
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Error inicializando mapa:", error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [setLocationCoords]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    if (locationCoords) {
      markerRef.current = L.marker(locationCoords).addTo(mapRef.current);
    }
  }, [locationCoords]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}

export function PublishEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [selectedCoOrganizers, setSelectedCoOrganizers] = useState<any[]>([]);
  const [streamUrl, setStreamUrl] = useState("");

  
  const [categories, setCategories] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const { usuario, isLoading } = useAuth();

  useEffect(() => {
    // Fetch categories and organizers
    categoriasApi.getAll().then(data => setCategories(data as any[]));
    usuariosApi.getAll().then(data => {
      const users = data as any[];
      setAvailableUsers(users.filter(u => u.rol === 'organizador'));
    });
  }, []);

  useEffect(() => {
    if (editId && categories.length > 0) {
      eventosApi.getById(editId).then((event: any) => {
        setTitle(event.titulo);
        setDescription(event.descripcion);
        
        // Find category ID by name if backend returns name, or use ID directly
        if (event.categoria_id) {
          setCategoryId(String(event.categoria_id));
        } else if (event.categoria) {
          const cat = categories.find(c => c.nombre === event.categoria);
          if (cat) setCategoryId(String(cat.id));
        }

        // El backend envía 'fecha', no 'fecha_inicio'
        if (event.fecha) {
          // Extraemos solo la parte YYYY-MM-DD para evitar errores de timezone
          const dateOnly = event.fecha.split('T')[0];
          setDateStart(dateOnly);
          setTimeStart(event.hora_inicio || "");
          setTimeEnd(event.hora_fin || "");
        }

        if (event.lugar) {
          setLocationName(event.lugar.nombre);
          if (event.lugar.latitud && event.lugar.longitud) {
            setLocationCoords([Number(event.lugar.latitud), Number(event.lugar.longitud)]);
          }
        }
        setCoverImage(event.imagen_portada || "");
        setStreamUrl(event.stream_url || "");

        
        if (event.organizadores) {
          setSelectedCoOrganizers(event.organizadores.filter((o: any) => String(o.id) !== String(usuario?.id)));
        }
      }).catch(() => toast.error("Error al cargar evento para editar"));
    }
  }, [editId, categories, usuario?.id]);

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'organizador') {
    return <Navigate to="/login" replace />;
  }

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description || !categoryId || !dateStart || !timeStart || !timeEnd) {
        toast.error("Por favor, rellene todos los campos obligatorios.");
        return;
      }
    }
    if (step === 2) {
      if (!locationCoords || !locationName) {
        toast.error("Seleccione una ubicación en el mapa e indique el nombre de la ubicación.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (targetStatus: 'Draft' | 'In review') => {
    if (!locationCoords || !usuario || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Create or use place
      const place = (await lugaresApi.create({
        nombre: locationName,
        latitud: locationCoords[0],
        longitud: locationCoords[1]
      })) as any;

      // 2. Prepare event data
      // Garantizar formato HH:MM de 2 dígitos para cumplir el regex del backend
      const padTime = (t: string) => t.split(':').map(p => p.padStart(2, '0')).join(':');

      const eventData = {
        titulo: title,
        descripcion: description,
        categoria_id: Number(categoryId),
        fecha: dateStart,
        hora_inicio: padTime(timeStart),
        hora_fin: padTime(timeEnd),
        lugar_id: place.id,
        imagen_portada: coverImage,
        coorganizadores: selectedCoOrganizers.map(o => ({ id: o.id }))
      };


      let eventResponse: any;
      if (editId) {
        eventResponse = await eventosApi.update(editId, eventData);
      } else {
        eventResponse = await eventosApi.create(eventData);
      }

      const eventId = editId || eventResponse?.id;

      // Registrar o actualizar el stream si se proporcionó
      if (streamUrl && eventId) {
        try {
          await eventosApi.registrarStream(eventId, streamUrl);
        } catch (e) {
          console.error("Error registrando stream:", e);
        }
      } else if (editId && !streamUrl) {
        try {
          await eventosApi.eliminarStream(eventId);
        } catch (e) {
          // Ignorar error si no tenía stream previamente
        }
      }

      // 3. Send to review if requested
      if (targetStatus === 'In review') {
        await eventosApi.enviarRevision(editId || eventResponse?.id);
        
        // Notificar al organizador
        if (usuario) {
          await notificationService.sendEmail({
            usuario: { nombre_completo: usuario.nombre_completo },
            event: { titulo: title, estado: 'En revisión' },
            to_email: usuario.email
          });
        }
      }

      toast.success(targetStatus === 'Draft' ? "¡Guardado como borrador!" : "¡Enviado para revisión!");
      navigate("/organizer/dashboard");
    } catch (error: any) {
      console.error("Error submitting event:", error);
      toast.error(error.message || "Error al guardar el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/organizer/dashboard")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>{editId ? "Editar Evento" : "Publicar Nuevo Evento"}</h1>
        <p className="text-muted-foreground mb-8">
          {editId ? "Actualiza los datos de tu evento" : "Crea y envía un evento para revisión"}
        </p>

        <div className="flex items-center justify-center mb-8 gap-2 sm:gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${s <= step ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                {s < step ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s}
              </div>
              <div className="hidden sm:flex flex-col ml-3 mr-4 lg:mr-8">
                <span className="text-xs text-muted-foreground">Paso {s}</span>
                <span className="text-sm font-semibold">{s === 1 ? 'Información' : s === 2 ? 'Ubicación' : 'Revisión'}</span>
              </div>
              {s < 3 && <div className="w-8 sm:w-12 h-0.5 bg-gray-300 mx-2 sm:mr-8" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Titulo del evento *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Feria anual de ciencias" className="mt-2" required />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción detallada..." className="mt-2 min-h-32" required />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Co-organizadores</Label>
                <Select onValueChange={(userId) => {
                  const user = availableUsers.find(u => String(u.id) === userId);
                  if (user && !selectedCoOrganizers.some(u => String(u.id) === String(user.id))) {
                    setSelectedCoOrganizers([...selectedCoOrganizers, user]);
                  }
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Buscar un co-organizador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.filter(u => String(u.id) !== String(usuario?.id)).map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.nombre_completo} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedCoOrganizers.map(coOrg => (
                    <div key={coOrg.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                      {coOrg.nombre_completo}
                      <button onClick={() => setSelectedCoOrganizers(selectedCoOrganizers.filter(u => u.id !== coOrg.id))} className="ml-1 hover:text-blue-900"><CloseIcon className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="stream-url">Enlace de transmisión (Opcional)</Label>
                <Input 
                  id="stream-url" 
                  value={streamUrl} 
                  onChange={(e) => setStreamUrl(e.target.value)} 
                  placeholder="e.g. https://www.youtube.com/watch?v=... o https://twitch.tv/..." 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Soporta enlaces de YouTube y Twitch.
                </p>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="date-start">Fecha *</Label><Input id="date-start" type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="mt-2" required /></div>
                <div><Label htmlFor="time-start">Hora de inicio *</Label><Input id="time-start" type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="mt-2" required /></div>
                <div><Label htmlFor="time-end">Hora de finalización *</Label><Input id="time-end" type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="mt-2" required /></div>
              </div>

              <div>
                <Label htmlFor="cover-image">Imagen de portada</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="max-h-48 mx-auto rounded" />
                      <Button variant="ghost" size="sm" onClick={() => setCoverImage("")} className="mt-2">Eliminar</Button>
                    </div>
                  ) : (
                    <label htmlFor="cover-image" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sube una imagen para tu evento</p>
                      <input id="cover-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Ubicación del evento *</Label>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300 mt-4 relative z-0">
                  <LocationMap locationCoords={locationCoords} setLocationCoords={setLocationCoords} />
                </div>
              </div>
              <div>
                <Label htmlFor="location-name">Nombre de la ubicación *</Label>
                <Input id="location-name" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Bloque B, Sala 205" className="mt-2" required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>Revisa tu evento</h2>
              {coverImage && <div className="aspect-video rounded-lg overflow-hidden"><img src={coverImage} alt="Cover" className="w-full h-full object-cover" /></div>}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-2xl" style={{ fontWeight: 700 }}>{title}</h3>
                  <CategoryBadge category={categories.find(c => String(c.id) === categoryId)?.nombre || ""} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div><p className="text-sm text-muted-foreground">Fecha y hora</p><p style={{ fontWeight: 600 }}>{dateStart} • {timeStart}</p></div>
                <div><p className="text-sm text-muted-foreground">Ubicación</p><p style={{ fontWeight: 600 }}>{locationName}</p></div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm"><span style={{ fontWeight: 600 }}>Nota:</span> Tu evento será enviado para revisión.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-4">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />Atrás
              </Button>
            ) : <div className="hidden sm:block" />}
            
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                Siguiente<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => handleSubmit('Draft')} variant="outline" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Guardando..." : "Borrador"}
                </Button>
                <Button onClick={() => handleSubmit('In review')} className="bg-[#1D9E75] hover:bg-[#188c66] w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar a revisión"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}