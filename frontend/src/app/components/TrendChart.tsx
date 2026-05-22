import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data?: DataPoint[];
  title?: string;
  subtitle?: string;
  valueLabel?: string;
  color?: "violet" | "rose" | "blue" | "green";
  showGrid?: boolean;
  height?: number;
}

const defaultData: DataPoint[] = [
  { date: "Lun", value: 12 },
  { date: "Mar", value: 28 },
  { date: "Mié", value: 45 },
  { date: "Jue", value: 38 },
  { date: "Vie", value: 67 },
  { date: "Sáb", value: 89 },
  { date: "Dom", value: 56 },
];

const colorSchemes = {
  violet: {
    stroke: "#7C3AED",
    fill: "url(#gradientViolet)",
    gradient: ["rgba(124, 58, 237, 0.4)", "rgba(124, 58, 237, 0)"],
  },
  rose: {
    stroke: "#F43F5E",
    fill: "url(#gradientRose)",
    gradient: ["rgba(244, 63, 94, 0.4)", "rgba(244, 63, 94, 0)"],
  },
  blue: {
    stroke: "#1E40AF",
    fill: "url(#gradientBlue)",
    gradient: ["rgba(30, 64, 175, 0.4)", "rgba(30, 64, 175, 0)"],
  },
  green: {
    stroke: "#10B981",
    fill: "url(#gradientGreen)",
    gradient: ["rgba(16, 185, 129, 0.4)", "rgba(16, 185, 129, 0)"],
  },
};

const CustomTooltip = ({ active, payload, label, valueLabel }: TooltipProps<number, string> & { valueLabel?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg"
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p className="text-xs mb-1" style={{ color: "#94A3B8" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
          {payload[0].value} {valueLabel || "tickets"}
        </p>
      </div>
    );
  }
  return null;
};

export function TrendChart({
  data = defaultData,
  title = "Ventas de Tickets",
  subtitle = "Última semana",
  valueLabel = "tickets",
  color = "violet",
  showGrid = true,
  height = 200,
}: TrendChartProps) {
  const scheme = colorSchemes[color];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map((d) => d.value));
  const avgValue = Math.round(total / data.length);

  return (
    <div
      className="w-full rounded-xl p-6"
      style={{ background: "#1E293B", border: "1px solid rgba(148, 163, 184, 0.1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-lg mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F8FAFC" }}
          >
            {title}
          </h3>
          <p className="text-xs" style={{ color: "#64748B" }}>
            {subtitle}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: `linear-gradient(135deg, ${scheme.stroke} 0%, ${scheme.stroke}99 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {total}
          </p>
          <p className="text-xs" style={{ color: "#64748B" }}>
            Total {valueLabel}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: scheme.stroke }} />
          <span className="text-xs" style={{ color: "#94A3B8" }}>
            Máx: <span style={{ color: "#F8FAFC", fontWeight: 500 }}>{maxValue}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#64748B" }} />
          <span className="text-xs" style={{ color: "#94A3B8" }}>
            Prom: <span style={{ color: "#F8FAFC", fontWeight: 500 }}>{avgValue}</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(124, 58, 237, 0.4)" />
                <stop offset="95%" stopColor="rgba(124, 58, 237, 0)" />
              </linearGradient>
              <linearGradient id="gradientRose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(244, 63, 94, 0.4)" />
                <stop offset="95%" stopColor="rgba(244, 63, 94, 0)" />
              </linearGradient>
              <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(30, 64, 175, 0.4)" />
                <stop offset="95%" stopColor="rgba(30, 64, 175, 0)" />
              </linearGradient>
              <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="95%" stopColor="rgba(16, 185, 129, 0)" />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.1)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              dx={-10}
            />
            <Tooltip
              content={<CustomTooltip valueLabel={valueLabel} />}
              cursor={{ stroke: "rgba(148, 163, 184, 0.2)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={scheme.stroke}
              strokeWidth={2}
              fill={scheme.fill}
              dot={false}
              activeDot={{
                r: 5,
                fill: scheme.stroke,
                stroke: "#1E293B",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
