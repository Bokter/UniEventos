import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";
import L from "leaflet";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CategoryBadge } from "../components/CategoryBadge";
import { EventCategory, mockEvents } from "../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

// Fix for default marker icon
// TODO: Manejar error si Leaflet no puede cargar iconos desde unpkg.com
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

    // TODO: Manejar errores de carga de Leaflet y tiles de OpenStreetMap
    try {
      // Initialize map
      const map = L.map(mapContainerRef.current).setView([40.7580, -73.9855], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        setLocationCoords([e.latlng.lat, e.latlng.lng]);
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Error inicializando mapa de ubicación:", error);
      // TODO: Mostrar mensaje de error al usuario
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        console.error("Error limpiando mapa:", error);
      }
    };
  }, [setLocationCoords]);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Remove old marker if exists
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker if location is set
      if (locationCoords) {
        markerRef.current = L.marker(locationCoords).addTo(mapRef.current);
      }
    } catch (error) {
      console.error("Error actualizando marcador:", error);
    }
  }, [locationCoords]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}

export function PublishEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [step, setStep] = useState(1);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("Academic");
  const [dateStart, setDateStart] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);

  const { usuario, isLoading } = useAuth();

  useEffect(() => {
    if (editId) {
      const eventToEdit = mockEvents.find(e => e.id === editId);
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description);
        setCategory(eventToEdit.category);
        setDateStart(format(eventToEdit.dateStart, 'yyyy-MM-dd'));
        setTimeStart(format(eventToEdit.dateStart, 'HH:mm'));
        setDateEnd(format(eventToEdit.dateEnd, 'yyyy-MM-dd'));
        setTimeEnd(format(eventToEdit.dateEnd, 'HH:mm'));
        setLocationName(eventToEdit.location.name);
        setLocationCoords([eventToEdit.location.lat, eventToEdit.location.lng]);
        setCoverImage(eventToEdit.coverImage);
      }
    }
  }, [editId]);

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'organizador') {
    return <Navigate to="/login" replace />;
  }

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description || !category || !dateStart || !timeStart || !dateEnd || !timeEnd) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (step === 2) {
      if (!locationCoords || !locationName) {
        toast.error("Please select a location on the map and provide a location name");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (targetStatus: 'Draft' | 'In review' = 'In review') => {
    if (!locationCoords || !usuario) return;

    if (editId) {
      const eventToEdit = mockEvents.find(e => e.id === editId);
      if (eventToEdit) {
        eventToEdit.title = title;
        eventToEdit.description = description;
        eventToEdit.category = category;
        eventToEdit.dateStart = new Date(`${dateStart}T${timeStart}`);
        eventToEdit.dateEnd = new Date(`${dateEnd}T${timeEnd}`);
        eventToEdit.location = {
          name: locationName,
          lat: locationCoords[0],
          lng: locationCoords[1],
        };
        eventToEdit.coverImage = coverImage || eventToEdit.coverImage;
        // Si estaba rechazado o en borrador, lo pasamos al estado indicado
        eventToEdit.status = targetStatus;
        if (targetStatus === 'In review') {
          eventToEdit.rejectionReason = undefined;
        }
        toast.success(targetStatus === 'Draft' ? "¡Borrador actualizado!" : "¡Evento actualizado y enviado a revisión!");
        navigate("/organizer/dashboard");
      }
    } else {
      const newEvent = {
        id: String(mockEvents.length + 1),
        title,
        description,
        category,
        dateStart: new Date(`${dateStart}T${timeStart}`),
        dateEnd: new Date(`${dateEnd}T${timeEnd}`),
        location: {
          name: locationName,
          lat: locationCoords[0],
          lng: locationCoords[1],
        },
        coverImage: coverImage || 'https://images.unsplash.com/photo-1700671562333-f71286a7c748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1Mzk5MjMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        organizer: {
          id: String(usuario.id),
          name: usuario.nombre_completo,
          email: usuario.email,
        },
        status: targetStatus,
        submittedDate: targetStatus === 'In review' ? new Date() : undefined,
      };

      mockEvents.push(newEvent);
      toast.success(targetStatus === 'Draft' ? "¡Guardado como borrador!" : "¡Evento enviado a revisión!");
      navigate("/organizer/dashboard");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/organizer/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>{editId ? "Editar Evento" : "Publicar Nuevo Evento"}</h1>
        <p className="text-muted-foreground mb-8">
          {editId ? "Actualiza los datos de tu evento" : "Crea y envía un evento para revisión"}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  s <= step
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              <div className="flex flex-col ml-3 mr-8">
                <span className="text-xs text-muted-foreground">Step {s}</span>
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  {s === 1 ? 'Basic info' : s === 2 ? 'Location' : 'Review'}
                </span>
              </div>
              {s < 3 && <div className="w-12 h-0.5 bg-gray-300 mr-8" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Science Fair"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of your event..."
                  className="mt-2 min-h-32"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-start">Start Date *</Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time-start">Start Time *</Label>
                  <Input
                    id="time-start"
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-end">End Date *</Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time-end">End Time *</Label>
                  <Input
                    id="time-end"
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cover-image">Cover Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="max-h-48 mx-auto rounded" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCoverImage("")}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="cover-image" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Event Location *</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Click on the map to select the event location
                </p>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                  <LocationMap
                    locationCoords={locationCoords}
                    setLocationCoords={setLocationCoords}
                  />
                </div>
              </div>

              {locationCoords && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    <span style={{ fontWeight: 600 }}>Selected coordinates:</span>{' '}
                    {locationCoords[0].toFixed(6)}, {locationCoords[1].toFixed(6)}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="location-name">Location Name *</Label>
                <Input
                  id="location-name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Main Campus Hall, Room 205"
                  className="mt-2"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && locationCoords && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-4" style={{ fontWeight: 600 }}>Review Your Event</h2>
                <p className="text-muted-foreground mb-6">
                  Please review all information before submitting for approval
                </p>
              </div>

              {coverImage && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-2xl" style={{ fontWeight: 700 }}>{title}</h3>
                  <CategoryBadge category={category} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-sm text-muted-foreground">Start</p>
                  <p style={{ fontWeight: 600 }}>
                    {format(new Date(`${dateStart}T${timeStart}`), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End</p>
                  <p style={{ fontWeight: 600 }}>
                    {format(new Date(`${dateEnd}T${timeEnd}`), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p style={{ fontWeight: 600 }}>{locationName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organizador</p>
                  <p style={{ fontWeight: 600 }}>{usuario.nombre_completo}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm">
                  <span style={{ fontWeight: 600 }}>Note:</span> Your event will be submitted for review 
                  by the administration. You will be notified once it's approved or if any changes are needed.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => handleSubmit('Draft')} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Guardar como borrador
                </Button>
                <Button onClick={() => handleSubmit('In review')} className="bg-[#1D9E75] hover:bg-[#188c66]">
                  Submit for Review
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}