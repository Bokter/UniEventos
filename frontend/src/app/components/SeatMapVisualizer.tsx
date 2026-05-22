import { useState } from "react";

interface Zone {
  id: string;
  name: string;
  path: string;
  color: string;
  hoverColor: string;
  capacity: number;
  available: number;
  price?: number;
}

interface SeatMapVisualizerProps {
  zones?: Zone[];
  onZoneClick?: (zone: Zone) => void;
  showLegend?: boolean;
  title?: string;
}

const defaultZones: Zone[] = [
  {
    id: "vip",
    name: "VIP",
    path: "M 150 80 L 350 80 L 380 140 L 120 140 Z",
    color: "rgba(124, 58, 237, 0.4)",
    hoverColor: "rgba(124, 58, 237, 0.7)",
    capacity: 50,
    available: 12,
    price: 150000,
  },
  {
    id: "preferencial",
    name: "Preferencial",
    path: "M 100 160 L 400 160 L 430 240 L 70 240 Z",
    color: "rgba(244, 63, 94, 0.4)",
    hoverColor: "rgba(244, 63, 94, 0.7)",
    capacity: 100,
    available: 45,
    price: 80000,
  },
  {
    id: "general-a",
    name: "General A",
    path: "M 50 260 L 240 260 L 240 340 L 30 340 Z",
    color: "rgba(30, 64, 175, 0.4)",
    hoverColor: "rgba(30, 64, 175, 0.7)",
    capacity: 150,
    available: 89,
    price: 40000,
  },
  {
    id: "general-b",
    name: "General B",
    path: "M 260 260 L 450 260 L 470 340 L 260 340 Z",
    color: "rgba(30, 64, 175, 0.4)",
    hoverColor: "rgba(30, 64, 175, 0.7)",
    capacity: 150,
    available: 67,
    price: 40000,
  },
  {
    id: "lateral-izq",
    name: "Lateral Izquierda",
    path: "M 20 160 L 60 160 L 40 320 L 10 320 Z",
    color: "rgba(16, 185, 129, 0.4)",
    hoverColor: "rgba(16, 185, 129, 0.7)",
    capacity: 80,
    available: 34,
    price: 50000,
  },
  {
    id: "lateral-der",
    name: "Lateral Derecha",
    path: "M 440 160 L 480 160 L 490 320 L 460 320 Z",
    color: "rgba(16, 185, 129, 0.4)",
    hoverColor: "rgba(16, 185, 129, 0.7)",
    capacity: 80,
    available: 28,
    price: 50000,
  },
];

export function SeatMapVisualizer({
  zones = defaultZones,
  onZoneClick,
  showLegend = true,
  title = "Mapa del Venue",
}: SeatMapVisualizerProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone.id === selectedZone ? null : zone.id);
    onZoneClick?.(zone);
  };

  const getZoneColor = (zone: Zone) => {
    if (selectedZone === zone.id) {
      return zone.hoverColor;
    }
    if (hoveredZone === zone.id) {
      return zone.hoverColor;
    }
    return zone.color;
  };

  const getAvailabilityColor = (available: number, capacity: number) => {
    const ratio = available / capacity;
    if (ratio > 0.5) return "#10B981"; // Green - lots available
    if (ratio > 0.2) return "#F59E0B"; // Yellow - limited
    return "#EF4444"; // Red - almost sold out
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="w-full rounded-xl p-6" style={{ background: "#1E293B", border: "1px solid rgba(148, 163, 184, 0.1)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F8FAFC" }}>
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
          <span>Disponible</span>
          <div className="w-2 h-2 rounded-full ml-2" style={{ background: "#F59E0B" }} />
          <span>Limitado</span>
          <div className="w-2 h-2 rounded-full ml-2" style={{ background: "#EF4444" }} />
          <span>Agotándose</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* SVG Map */}
        <div className="flex-1">
          <svg viewBox="0 0 500 380" className="w-full h-auto" style={{ maxHeight: "300px" }}>
            {/* Stage */}
            <rect x="140" y="20" width="220" height="40" rx="4" fill="rgba(124, 58, 237, 0.2)" stroke="#7C3AED" strokeWidth="2" />
            <text x="250" y="46" textAnchor="middle" fill="#A78BFA" fontSize="14" fontWeight="600" fontFamily="Space Grotesk">
              ESCENARIO
            </text>

            {/* Zones */}
            {zones.map((zone) => (
              <g key={zone.id}>
                <path
                  d={zone.path}
                  fill={getZoneColor(zone)}
                  stroke={hoveredZone === zone.id || selectedZone === zone.id ? "#F8FAFC" : "rgba(148, 163, 184, 0.3)"}
                  strokeWidth={hoveredZone === zone.id || selectedZone === zone.id ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => handleZoneClick(zone)}
                />
              </g>
            ))}

            {/* Zone Labels */}
            {zones.map((zone) => {
              // Calculate center of each zone for label placement
              const pathParts = zone.path.split(/[MLZ\s]+/).filter(Boolean);
              const coords = [];
              for (let i = 0; i < pathParts.length; i += 2) {
                if (pathParts[i] && pathParts[i + 1]) {
                  coords.push({ x: parseFloat(pathParts[i]), y: parseFloat(pathParts[i + 1]) });
                }
              }
              const centerX = coords.reduce((sum, c) => sum + c.x, 0) / coords.length;
              const centerY = coords.reduce((sum, c) => sum + c.y, 0) / coords.length;

              return (
                <text
                  key={`label-${zone.id}`}
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="500"
                  fontFamily="Outfit"
                  className="pointer-events-none"
                >
                  {zone.name}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Zone Info Panel */}
        {showLegend && (
          <div className="w-64 space-y-2">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedZone === zone.id ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  background: hoveredZone === zone.id || selectedZone === zone.id ? "rgba(51, 65, 85, 0.8)" : "rgba(51, 65, 85, 0.4)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => handleZoneClick(zone)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: "#F8FAFC" }}>
                    {zone.name}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: getAvailabilityColor(zone.available, zone.capacity) }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: "#94A3B8" }}>
                  <span>{zone.available} disponibles</span>
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>{formatPrice(zone.price)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
