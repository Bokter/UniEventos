import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, Map as MapIcon, Calendar as IconoCalendario } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { HeroOrbs, HeroDotGrid, HeroWave } from "../components/HeroVisualizer";
import { eventosApi, categoriasApi } from "../services/api.service";
import { toast } from "sonner";

/* ── Motion variants ────────────────────────────── */
const heroTextVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const heroContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const cardGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HomePage() {
  const navegar = useNavigate();

  const [vista, setVista] = useState<"cuadricula" | "mapa">("cuadricula");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");
  const [eventos, setEventos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [arModalOpen, setArModalOpen] = useState(false);

  useEffect(() => {
    categoriasApi.getAll().then((data) => setCategorias(data as any[])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      try {
        const categoriaId =
          categoriaSeleccionada !== "todas" ? Number(categoriaSeleccionada) : undefined;
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

  const eventosFiltrados = eventos.filter((evento) => {
    const titulo = evento.titulo || "";
    const descripcion = evento.descripcion || "";

    const coincideBusqueda =
      busqueda === "" ||
      titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      descripcion.toLowerCase().includes(busqueda.toLowerCase());

    const categoriaObj = evento.categoria;
    const categoriaIdEvento = categoriaObj?.id ? String(categoriaObj.id) : null;
    const coincideCategoria =
      categoriaSeleccionada === "todas" || categoriaIdEvento === categoriaSeleccionada;

    const fechaInicioStr = evento.fecha || evento.fecha_inicio || evento.dateStart;
    if (!fechaInicioStr) return coincideBusqueda && coincideCategoria;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaParaParsear = fechaInicioStr.includes("T")
      ? fechaInicioStr
      : `${fechaInicioStr}T12:00:00`;
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

      {/* ── Hero Section ──────────────────────────────── */}
      <div
        className="relative text-white py-14 md:py-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a2130 0%, #293241 55%, #3D5A80 100%)",
        }}
      >
        {/* Layered visualizer elements */}
        <HeroDotGrid />
        <HeroOrbs />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left"
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="max-w-2xl">
            {/* Eyebrow label */}
            <motion.span
              variants={heroTextVariants}
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1.5 rounded-full"
              style={{
                color: "#98C1D9",
                background: "rgba(152,193,217,0.12)",
                border: "1px solid rgba(152,193,217,0.22)",
                fontFamily: "'Lato', sans-serif",
                letterSpacing: "0.18em",
              }}
            >
              Plataforma Universitaria
            </motion.span>

            <motion.h1
              variants={heroTextVariants}
              className="text-4xl md:text-5xl lg:text-6xl mb-5 leading-tight"
              style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800 }}
            >
              Todos los eventos
              <br />
              <span style={{ color: "#EE6C4D" }}>universitarios</span>{" "}
              en un solo lugar
            </motion.h1>

            <motion.p
              variants={heroTextVariants}
              className="text-base md:text-lg mb-10 leading-relaxed"
              style={{ color: "rgba(224,251,252,0.78)", fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
            >
              Descubre, asiste y organiza eventos en tu campus.
              Mantente conectado con tu comunidad universitaria.
            </motion.p>

            <motion.div variants={heroTextVariants}>
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-md shadow-xl mx-auto md:mx-0 transition-all active:scale-95"
                style={{
                  background: "#EE6C4D",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontFamily: "'Urbanist', sans-serif",
                  letterSpacing: "0.02em",
                  border: "none",
                }}
                onClick={() => setArModalOpen(true)}
              >
                Explorar eventos
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Wave divider */}
        <HeroWave />
      </div>

      {/* ── Filter Bar ──────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-200 bg-gray-50">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </SelectItem>
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

      {/* ── Events Grid ──────────────────────────────── */}
      <main id="seccion-eventos" className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2
            className="text-2xl font-bold text-gray-800"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            {isLoading
              ? "Cargando eventos..."
              : `Próximos Eventos (${eventosFiltrados.length})`}
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant={vista === "cuadricula" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setVista("cuadricula")}
              className={vista === "cuadricula" ? "bg-white shadow-sm" : "text-gray-500"}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cuadrícula
            </Button>
            <Button
              variant="ghost"
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${categoriaSeleccionada}-${filtroFecha}-${busqueda}`}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={cardGridVariants}
              initial="hidden"
              animate="show"
            >
              {eventosFiltrados.map((evento, idx) => (
                <motion.div key={evento.id} variants={cardItemVariants}>
                  <EventCard event={evento} index={idx} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-500">
              No se encontraron eventos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </main>

      {/* ── AR Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {arModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[8000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setArModalOpen(false);
            }}
          >
            <motion.div
              className="bg-[#293241] border border-[#EE6C4D] rounded-xl p-8 max-w-[360px] w-full text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
            >
              <div className="text-4xl mb-4">📱</div>
              <h3
                className="font-bold text-xl mb-2 tracking-wide"
                style={{ color: "#EE6C4D", fontFamily: "'Urbanist', sans-serif" }}
              >
                Experiencia Móvil
              </h3>
              <p
                className="font-light leading-relaxed mb-6"
                style={{ color: "#E0FBFC", fontFamily: "'Lato', sans-serif" }}
              >
                El visor AR está optimizado para dispositivos móviles.
                <br />
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
                  onClick={() => (window.location.href = "/ar-viewer.html")}
                  className="px-5 py-2 border-none bg-[#EE6C4D] text-white rounded-lg font-bold hover:bg-[#EE6C4D]/90 transition-colors cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
