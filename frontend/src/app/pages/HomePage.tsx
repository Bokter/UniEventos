/* @logic — do not touch */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario, Smartphone, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { LiveActivityFeed } from "../components/visual/LiveActivityFeed";
import { CampusHeatStrip } from "../components/visual/CampusHeatStrip";
import { SkeletonCard } from "../components/visual/SkeletonCard";
import { EmptyState } from "../components/visual/EmptyState";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { eventosApi, categoriasApi } from "../services/api.service";
import { toast } from "sonner";

export function HomePage() {
  const navegar = useNavigate();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar showSearch={true} onSearchChange={setBusqueda} searchValue={busqueda} />

      <section className="hero-dark-grid py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-display mb-6" style={{ color: "var(--text-primary)" }}>
              Todos los eventos universitarios en un solo lugar
            </h1>
            <p
              className="font-body text-base md:text-lg mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: "var(--text-secondary)" }}
            >
              Descubre, asiste y organiza eventos en tu campus. Mantente conectado con tu comunidad universitaria.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 h-14 flex items-center justify-center mx-auto lg:mx-0 transition-all hover:bg-[#d45d3f] active:scale-95"
              style={{
                background: "var(--accent-primary)",
                color: "var(--text-primary)",
                fontWeight: 600,
                border: "none",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-glow)",
              }}
              onClick={() => {
                if (isMobile) {
                  window.location.href = '/ar-viewer.html';
                } else {
                  setArModalOpen(true);
                }
              }}
            >
              Explorar eventos
            </Button>
          </div>
          <LiveActivityFeed
            eventosData={isLoading ? [] : eventosFiltrados}
            className="w-full"
          />
        </div>
      </section>

      <div
        className="border-b sticky top-16 z-40 uni-surface rounded-none border-x-0"
        style={{ borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-mid)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <CampusHeatStrip eventos={eventos} className="mb-6" />
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-[var(--color-gray)]/30 bg-[var(--color-light)]">
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
              <SelectTrigger className="w-full md:w-[200px] h-12 border-[var(--color-gray)]/30 bg-[var(--color-light)]">
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
          <h2 className="font-h2">
            {isLoading ? "Cargando eventos..." : `Próximos Eventos (${eventosFiltrados.length})`}
          </h2>
          <div
            className="flex p-1 rounded-lg"
            style={{ background: "rgba(152, 193, 217, 0.2)", borderRadius: "var(--radius-sm)" }}
          >
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
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map(evento => <EventCard key={evento.id} event={evento} />)}
          </div>
        ) : (
          <EmptyState
            title="Sin resultados"
            description="No se encontraron eventos que coincidan con tu búsqueda."
          />
        )}
      </main>

      {/* Modal de advertencia AR */}
      {arModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[8000] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setArModalOpen(false); }}
        >
          <div className="glass-panel relative rounded-2xl p-8 max-w-[400px] w-full text-center shadow-2xl border border-white/10 flex flex-col items-center">
            {/* Botón Cerrar (X) */}
            <button
              type="button"
              onClick={() => setArModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icono flotante */}
            <div className="flex justify-center mb-6">
              <div 
                className="p-4 rounded-full float-orb"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid rgba(232, 82, 58, 0.3)",
                  color: "var(--accent-primary)",
                  boxShadow: "var(--shadow-glow)"
                }}
              >
                <Smartphone className="h-8 w-8 text-[var(--accent-primary)] animate-pulse" />
              </div>
            </div>

            {/* Títulos */}
            <h3 className="font-h2 mb-2 text-xl font-bold" style={{ color: "var(--accent-primary)" }}>
              Experiencia Móvil
            </h3>
            <p className="font-caption leading-relaxed mb-6 text-sm text-[var(--text-secondary)]">
              Para una mejor experiencia de Realidad Aumentada, escanea este código QR con tu dispositivo móvil.
            </p>

            {/* Contenedor del QR */}
            <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-lg border border-gray-200 hover:scale-105 transition-transform duration-300">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/ar-viewer.html`
                )}&color=0d1117&bgcolor=ffffff&qzone=2`}
                alt="QR Code" 
                className="w-48 h-48 block rounded-lg"
              />
            </div>

            {/* URL con click para copiar */}
            <div className="w-full mb-6 text-center">
              <p className="font-caption text-xs mb-2 text-[var(--text-muted)]">
                O visita esta URL en tu dispositivo móvil:
              </p>
              <div 
                className="font-data text-xs p-3 rounded-lg border text-center break-all select-all cursor-pointer active:scale-98 hover:bg-white/5 transition-all duration-200"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-accent)"
                }}
                onClick={() => {
                  const url = `${window.location.origin}/ar-viewer.html`;
                  navigator.clipboard.writeText(url);
                  toast.success("¡Enlace copiado al portapapeles!");
                }}
                title="Click para copiar enlace"
              >
                {`${window.location.origin}/ar-viewer.html`}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 w-full justify-center">
              <button 
                type="button" 
                onClick={() => setArModalOpen(false)} 
                className="uni-btn-ghost flex-1 py-3 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/ar-viewer.html'; }}
                className="uni-btn-primary flex-1 py-3 text-sm font-semibold"
                style={{ width: "auto" }}
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