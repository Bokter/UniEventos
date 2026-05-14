import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario } from "lucide-react";
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
    // Cargar categorías del backend para tener los IDs reales
    categoriasApi.getAll().then(data => setCategorias(data as any[])).catch(() => { });
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      try {
        // Pasar categoria_id numérico al backend si está seleccionada
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
  }, [categoriaSeleccionada]); // Re-fetch cuando cambia la categoría

  // Filtrado local solo para búsqueda y fecha (la categoría ya viene filtrada del backend)
  const eventosFiltrados = eventos.filter(evento => {
    const titulo = evento.titulo || "";
    const descripcion = evento.descripcion || "";

    const coincideBusqueda = busqueda === "" ||
      titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      descripcion.toLowerCase().includes(busqueda.toLowerCase());

    // 2. Filtro por categoría — compara por ID numérico
    const categoriaObj = evento.categoria;
    const categoriaIdEvento = categoriaObj?.id ? String(categoriaObj.id) : null;
    const coincideCategoria = categoriaSeleccionada === "todas" || categoriaIdEvento === categoriaSeleccionada;

    // 3. Filtro por fecha
    // El backend devuelve 'fecha'
    const fechaInicioStr = evento.fecha || evento.fecha_inicio || evento.dateStart;
    if (!fechaInicioStr) return coincideBusqueda && coincideCategoria;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Ajustar si viene como YYYY-MM-DD puro para evitar desfase de timezone
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
    <div className="min-h-screen bg-white">
      <Navbar showSearch={true} onSearchChange={setBusqueda} searchValue={busqueda} />

      <div
        className="text-white py-20"
        style={{
          background: 'linear-gradient(135deg, #1a2535 0%, #242F40 60%, #2e3d55 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-medium mb-6 leading-tight" style={{ letterSpacing: '0.02em' }}>
              Todos los eventos universitarios en un solo lugar
            </h1>
            <p className="text-xl mb-10" style={{ color: 'rgba(229,229,229,0.85)', fontWeight: 300 }}>
              Descubre, asiste y organiza eventos en tu campus. Mantente conectado con tu comunidad universitaria.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-md transition-all shadow-lg"
              style={{
                background: '#CCA43B',
                color: '#242F40',
                fontWeight: 500,
                border: 'none',
              }}
              onClick={() => setArModalOpen(true)}
            >
              Explorar eventos
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-200 bg-gray-50">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {/* Categorías dinámicas del backend — con su ID real */}
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-200 bg-gray-50">
                <IconoCalendario className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Cualquier fecha</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <main id="seccion-eventos" className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLoading ? "Cargando eventos..." : `Próximos Eventos (${eventosFiltrados.length})`}
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant={vista === 'cuadricula' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVista('cuadricula')}
              className={vista === 'cuadricula' ? 'bg-white shadow-sm' : 'text-gray-500'}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />Cuadrícula
            </Button>
            <Button variant="ghost" size="sm" onClick={irAlMapa} className="text-gray-500">
              <MapIcon className="h-4 w-4 mr-2" />Mapa
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />)}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map(evento => <EventCard key={evento.id} event={evento} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-500">No se encontraron eventos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </main>

      {/* Modal de advertencia AR */}
      {arModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setArModalOpen(false); }}
        >
          <div style={{
            background: '#242F40', border: '1px solid #CCA43B',
            borderRadius: '12px', padding: '2rem', maxWidth: '360px',
            margin: '1rem', textAlign: 'center', fontFamily: "'Outfit', sans-serif"
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
            <h3 style={{ color: '#CCA43B', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              Experiencia Móvil
            </h3>
            <p style={{ color: '#E5E5E5', fontWeight: 300, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              El visor AR está optimizado para dispositivos móviles.<br />
              Para la mejor experiencia, ábrelo desde tu celular.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setArModalOpen(false)}
                style={{
                  padding: '0.5rem 1.25rem', border: '1px solid #E5E5E5',
                  background: 'transparent', color: '#E5E5E5', borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif", cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => window.location.href = '/ar-viewer.html'}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none',
                  background: '#CCA43B', color: '#242F40', borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: 'pointer'
                }}
              >
                Continuar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}