import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const RADIAN = Math.PI / 180

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-medium" style={{ color: payload[0].payload.color }}>
          {payload[0].name}
        </p>
        <p className="text-text-secondary">
          {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

const DEFAULT_COLORS = [
  '#7C3AED', '#0D9488', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#10B981', '#6366F1', '#EC4899', '#14B8A6',
]

export default function PieChartComponent({
  data = [],
  colors = DEFAULT_COLORS,
  donut = false,
  loading = false,
  showLegend = true,
}) {
  if (loading) return <div className="skeleton w-full h-64 rounded-lg" />

  const chartData = data.map((item, i) => ({
    ...item,
    color: colors[i % colors.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={donut ? '55%' : 0}
          outerRadius="70%"
          dataKey="value"
          labelLine={false}
          label={!donut ? CustomLabel : false}
          strokeWidth={1}
          stroke="#0A0A0B"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            formatter={(value) => (
              <span style={{ color: '#8B8B9A', fontSize: '11px' }}>{value}</span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
