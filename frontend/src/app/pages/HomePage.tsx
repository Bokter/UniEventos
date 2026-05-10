import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario } from "lucide-react";

// Importación de componentes existentes
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { eventosApi, categoriasApi } from "../services/api.service";
import { toast } from "sonner";

export function HomePage() {
  const navegar = useNavigate();

  // --- Estados de la página ---
  const [vista, setVista] = useState<'cuadricula' | 'mapa'>('cuadricula');
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");
  const [eventos, setEventos] = useState<any[]>([]);
  const [categoriasLista, setCategoriasLista] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Obtención de eventos desde el backend
  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      try {
        const [eventosData, categoriasData] = await Promise.all([
          eventosApi.getAll(),
          categoriasApi.getAll()
        ]);
        setEventos(eventosData as any[]);
        setCategoriasLista(categoriasData as any[]);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Error al cargar los eventos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventos();
  }, []);

  // --- Lógica de filtrado ---
  const eventosFiltrados = eventos.filter(evento => {
    // 1. Filtro por búsqueda (Título o Descripción)
    // El backend devuelve 'titulo' y 'descripcion'
    const titulo = evento.titulo || evento.title || "";
    const descripcion = evento.descripcion || evento.description || "";

    const coincideBusqueda = busqueda === "" ||
      titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      descripcion.toLowerCase().includes(busqueda.toLowerCase());

    // 2. Filtro por categoría
    // El backend devuelve 'categoria' como objeto {id, nombre, ...}
    const categoriaRaw = evento.categoria || evento.category || "";
    const nombreCategoria = typeof categoriaRaw === 'object' && categoriaRaw !== null ? categoriaRaw.nombre : categoriaRaw;
    const coincideCategoria = categoriaSeleccionada === "todas" || nombreCategoria === categoriaSeleccionada;

    // 3. Filtro por fecha
    // El backend devuelve 'fecha_inicio'
    const fechaInicioStr = evento.fecha_inicio || evento.dateStart;
    if (!fechaInicioStr) return coincideBusqueda && coincideCategoria;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaEvento = new Date(fechaInicioStr);
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

    return coincideBusqueda && coincideCategoria && coincideFecha;
  });

  // --- Navegación ---
  const irAlMapa = () => navegar("/map");

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        showSearch={true}
        onSearchChange={setBusqueda}
        searchValue={busqueda}
      />

      <div className="bg-gradient-to-br from-[#0A2540] via-[#05325E] to-[#0D4E8E] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Todos los eventos universitarios en un solo lugar
            </h1>
            <p className="text-xl text-blue-100/90 mb-10">
              Descubre, asiste y organiza eventos en tu campus. Mantente conectado con tu comunidad universitaria.
            </p>
            <Button
              size="lg"
              className="bg-[#1D9E75] hover:bg-[#188c66] text-white text-lg px-8 py-6 rounded-md transition-all shadow-lg"
              onClick={() => {
                document.getElementById('seccion-eventos')?.scrollIntoView({ behavior: 'smooth' });
              }}
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
                {categoriasLista.map(cat => (
                  <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
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
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cuadrícula
            </Button>
            <Button
              variant={vista === 'mapa' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={irAlMapa}
              className="text-gray-500"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Mapa
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map(evento => (
              <EventCard key={evento.id} event={evento} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-500">No se encontraron eventos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
