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
        className="text-white py-12 md:py-20"
        style={{
          background: 'linear-gradient(135deg, #1d2635 0%, #293241 60%, #3D5A80 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 leading-tight" style={{ letterSpacing: '0.02em' }}>
              Todos los eventos universitarios en un solo lugar
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-10" style={{ color: 'rgba(229,229,229,0.85)', fontWeight: 300 }}>
              Descubre, asiste y organiza eventos en tu campus. Mantente conectado con tu comunidad universitaria.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 h-14 flex items-center justify-center rounded-md shadow-lg mx-auto md:mx-0 transition-all hover:bg-[#d45d3f] active:scale-95"
              style={{
                background: '#EE6C4D',
                color: '#FFFFFF',
                fontWeight: 700,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
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
          className="fixed inset-0 bg-black/60 z-[8000] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setArModalOpen(false); }}
        >
          <div className="bg-[#293241] border border-[#EE6C4D] rounded-xl p-8 max-w-[360px] w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-[#EE6C4D] font-bold text-xl mb-2 tracking-wide">
              Experiencia Móvil
            </h3>
            <p className="text-[#E0FBFC] font-light leading-relaxed mb-6">
              El visor AR está optimizado para dispositivos móviles.<br />
              Para la mejor experiencia, ábrelo desde tu celular.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setArModalOpen(false)}
                className="px-5 py-2 border border-[#98C1D9] bg-transparent text-[#98C1D9] rounded-lg hover:bg-[#98C1D9]/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => window.location.href = '/ar-viewer.html'}
                className="px-5 py-2 border-none bg-[#EE6C4D] text-white rounded-lg font-bold hover:bg-[#EE6C4D]/90 transition-colors cursor-pointer"
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