import { useState } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario, Search } from "lucide-react";

// Importación de componentes existentes
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";

// Datos de prueba (MockData)
import { getApprovedEvents } from "../data/mockData";

export function HomePage() {
  const navegar = useNavigate();

  // --- Estados de la página ---
  // vista: controla si mostramos los eventos en cuadricula o mapa
  const [vista, setVista] = useState<'cuadricula' | 'mapa'>('cuadricula');
  // busqueda: texto ingresado por el usuario en el buscador
  const [busqueda, setBusqueda] = useState("");
  // categoriaSeleccionada: filtro por categoría de evento
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  // filtroFecha: filtro por rango de tiempo
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");

  // Obtención de eventos aprobados desde el mockData
  const eventos = getApprovedEvents();

  // --- Lógica de filtrado ---
  // Filtramos los eventos en tiempo real según los estados de búsqueda, categoría y fecha
  const eventosFiltrados = eventos.filter(evento => {
    // 1. Filtro por búsqueda (Título o Descripción)
    const coincideBusqueda = busqueda === "" ||
      evento.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.description.toLowerCase().includes(busqueda.toLowerCase());

    // 2. Filtro por categoría
    const coincideCategoria = categoriaSeleccionada === "todas" || evento.category === categoriaSeleccionada;

    // 3. Filtro por fecha
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaEvento = new Date(evento.dateStart);
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

    // Los filtros son independientes pero se combinan con AND
    return coincideBusqueda && coincideCategoria && coincideFecha;
  });

  // --- Navegación ---
  const irAlMapa = () => navegar("/map");

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de navegación superior */}
      <Navbar
        showSearch={true}
        onSearchChange={setBusqueda}
        searchValue={busqueda}
      />

      {/* SECCIÓN HERO: Fondo con degradado azul oscuro según diseño de Figma */}
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

      {/* BARRA DE FILTROS: Buscador y selectores alineados horizontalmente */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Buscador local para filtrar la lista actual (Comentado temporalmente) */}
            {/* 
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar eventos..."
                className="pl-10 h-12 border-gray-200 focus:ring-primary bg-gray-50"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            */}

            {/* Selector de Categoría (Cultural, Académico, etc.) */}
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-200 bg-gray-50">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Academic">Académico</SelectItem>
                <SelectItem value="Sports">Deportes</SelectItem>
                <SelectItem value="Workshop">Talleres</SelectItem>
              </SelectContent>
            </Select>

            {/* Selector de Fecha para filtrar por rango temporal */}
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

      {/* CONTENIDO PRINCIPAL: Listado de eventos dinámico */}
      <main id="seccion-eventos" className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Próximos Eventos ({eventosFiltrados.length})
          </h2>

          {/* Selector de tipo de vista (Cuadrícula o Mapa) */}
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

        {/* Listado de tarjetas de eventos */}
        {eventosFiltrados.length > 0 ? (
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
