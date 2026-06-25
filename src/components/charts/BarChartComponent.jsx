import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-text-secondary mb-1">{label}</p>
        <p className="text-violet-light font-medium">{payload[0]?.value} {payload[0]?.name}</p>
      </div>
    )
  }
  return null
}

export default function BarChartComponent({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  color = '#7C3AED',
  activeColor = '#A78BFA',
  label = 'commits',
  loading = false,
  horizontal = false,
}) {
  if (loading) return <div className="skeleton w-full h-52 rounded-lg" />

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1E1E22"
          vertical={!horizontal}
          horizontal={horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: '#8B8B9A', fontSize: 10 }} />
            <YAxis dataKey={xKey} type="category" tick={{ fill: '#8B8B9A', fontSize: 10 }} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: '#8B8B9A', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8B8B9A', fontSize: 10 }} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
        <Bar dataKey={dataKey} name={label} radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === data.length - 1 ? activeColor : color}
              fillOpacity={index === data.length - 1 ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
