import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-text-secondary mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.value} {p.name}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AreaChartComponent({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  color = '#7C3AED',
  label = 'value',
  loading = false,
  gradient = true,
}) {
  const gradientId = `gradient-${dataKey}`

  if (loading) return <div className="skeleton w-full h-48 rounded-lg" />

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#8B8B9A', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8B8B9A', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={label}
          stroke={color}
          strokeWidth={2}
          fill={gradient ? `url(#${gradientId})` : 'none'}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
