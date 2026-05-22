import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario, Sparkles } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { eventosApi, categoriasApi } from "../services/api.service";
import { toast } from "sonner";

export function HomePage() {
  const navegar = useNavigate();

  const [vista, setVista] = useState<'cuadricula' | 'mapa'>('cuadricula');
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");
  const [eventos, setEventos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [arModalOpen, setArModalOpen] = useState(false);

  useEffect(() => {
    categoriasApi.getAll().then(data => setCategorias(data as any[])).catch(() => { });
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      try {
        const categoriaId = categoriaSeleccionada !== "todas" ? Number(categoriaSeleccionada) : undefined;
        const data = await eventosApi.getAll(categoriaId);
        setEventos(data as any[]);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Error al cargar los eventos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventos();
  }, [categoriaSeleccionada]);

  const eventosFiltrados = eventos.filter(evento => {
    const titulo = evento.titulo || "";
    const descripcion = evento.descripcion || "";

    const coincideBusqueda = busqueda === "" ||
      titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      descripcion.toLowerCase().includes(busqueda.toLowerCase());

    const categoriaObj = evento.categoria;
    const categoriaIdEvento = categoriaObj?.id ? String(categoriaObj.id) : null;
    const coincideCategoria = categoriaSeleccionada === "todas" || categoriaIdEvento === categoriaSeleccionada;

    const fechaInicioStr = evento.fecha || evento.fecha_inicio || evento.dateStart;
    if (!fechaInicioStr) return coincideBusqueda && coincideCategoria;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaParaParsear = fechaInicioStr.includes('T') ? fechaInicioStr : `${fechaInicioStr}T12:00:00`;
    const fechaEvento = new Date(fechaParaParsear);
    fechaEvento.setHours(0, 0, 0, 0);

    let coincideFecha = true;
    if (filtroFecha === "hoy") {
      coincideFecha = fechaEvento.getTime() === hoy.getTime();
    } else if (filtroFecha === "semana") {
      const unaSemanaDespues = new Date(hoy);
      unaSemanaDespues.setDate(hoy.getDate() + 7);
      coincideFecha = fechaEvento >= hoy && fechaEvento <= unaSemanaDespues;
    } else if (filtroFecha === "mes") {
      const unMesDespues = new Date(hoy);
      unMesDespues.setMonth(hoy.getMonth() + 1);
      coincideFecha = fechaEvento >= hoy && fechaEvento <= unMesDespues;
    }

    return coincideBusqueda && coincideFecha;
  });

  const irAlMapa = () => navegar("/map");

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      <Navbar showSearch={true} onSearchChange={setBusqueda} searchValue={busqueda} />

      {/* Hero Section - Dark Theme */}
      <div
        className="py-16 md:py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #F43F5E 0%, transparent 70%)' }} />
          <div className="absolute top-40 right-40 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #1E40AF 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
              <Sparkles className="h-4 w-4" style={{ color: '#A78BFA' }} />
              <span className="text-sm" style={{ color: '#A78BFA', fontWeight: 500 }}>
                Eventos universitarios
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              style={{ 
                fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
                fontWeight: 700, 
                letterSpacing: '-0.02em',
                color: '#F8FAFC'
              }}>
              Todos los eventos en{' '}
              <span className="gradient-text-violet-rose">un solo lugar</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: '#94A3B8', fontWeight: 400 }}>
              Descubre, asiste y organiza eventos en tu campus. Mantente conectado con tu comunidad universitaria.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 h-14 flex items-center justify-center rounded-xl btn-shimmer transition-all"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                border: 'none',
              }}
              onClick={() => {
                const el = document.getElementById('seccion-eventos');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explorar eventos
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-16 z-40 glass-darker"
        style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full md:w-[200px] h-12 transition-all"
                style={{ 
                  background: 'rgba(30, 41, 59, 0.8)', 
                  borderColor: 'rgba(148, 163, 184, 0.15)',
                  color: '#F8FAFC'
                }}>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent style={{ background: '#1E293B', borderColor: 'rgba(148, 163, 184, 0.15)' }}>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="w-full md:w-[200px] h-12 transition-all"
                style={{ 
                  background: 'rgba(30, 41, 59, 0.8)', 
                  borderColor: 'rgba(148, 163, 184, 0.15)',
                  color: '#F8FAFC'
                }}>
                <IconoCalendario className="h-4 w-4 mr-2" style={{ color: '#7C3AED' }} />
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent style={{ background: '#1E293B', borderColor: 'rgba(148, 163, 184, 0.15)' }}>
                <SelectItem value="todas">Cualquier fecha</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <main id="seccion-eventos" className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl"
            style={{ 
              fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
              fontWeight: 700, 
              color: '#F8FAFC' 
            }}>
            {isLoading ? "Cargando eventos..." : `Próximos Eventos (${eventosFiltrados.length})`}
          </h2>
          <div className="flex p-1 rounded-lg" style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
            <Button
              variant={vista === 'cuadricula' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVista('cuadricula')}
              style={vista === 'cuadricula' ? {
                background: 'rgba(124, 58, 237, 0.2)',
                color: '#A78BFA'
              } : {
                color: '#64748B'
              }}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />Cuadrícula
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={irAlMapa}
              style={{ color: '#64748B' }}
            >
              <MapIcon className="h-4 w-4 mr-2" />Mapa
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-xl animate-pulse"
                style={{ background: 'rgba(30, 41, 59, 0.5)' }} />
            ))}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map(evento => <EventCard key={evento.id} event={evento} />)}
          </div>
        ) : (
          <div className="text-center py-20 rounded-xl"
            style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '2px dashed rgba(148, 163, 184, 0.15)' 
            }}>
            <p className="text-xl" style={{ color: '#64748B' }}>
              No se encontraron eventos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </main>

      {/* AR Modal */}
      {arModalOpen && (
        <div
          className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setArModalOpen(false); }}
        >
          <div className="rounded-xl p-8 max-w-[360px] w-full text-center"
            style={{ 
              background: '#1E293B', 
              border: '1px solid rgba(124, 58, 237, 0.3)',
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.2)'
            }}>
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl mb-2"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, 
                color: '#A78BFA' 
              }}>
              Experiencia Móvil
            </h3>
            <p className="leading-relaxed mb-6" style={{ color: '#94A3B8', fontWeight: 400 }}>
              El visor AR está optimizado para dispositivos móviles.<br />
              Para la mejor experiencia, ábrelo desde tu celular.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setArModalOpen(false)}
                className="px-5 py-2 rounded-lg transition-all"
                style={{ 
                  border: '1px solid rgba(30, 64, 175, 0.4)', 
                  background: 'rgba(30, 64, 175, 0.1)', 
                  color: '#60A5FA' 
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => window.location.href = '/ar-viewer.html'}
                className="px-5 py-2 rounded-lg transition-all btn-shimmer"
                style={{ 
                  background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)', 
                  color: '#FFFFFF', 
                  fontWeight: 600,
                  border: 'none'
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
