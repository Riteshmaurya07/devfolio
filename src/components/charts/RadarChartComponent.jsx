import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const defaultData = [
  { skill: 'Frontend', score: 85 },
  { skill: 'Backend', score: 65 },
  { skill: 'DSA', score: 72 },
  { skill: 'System Design', score: 50 },
  { skill: 'DevOps', score: 40 },
  { skill: 'Mobile', score: 30 },
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-text-primary font-medium">{payload[0]?.payload?.skill}</p>
        <p className="text-violet-light">{payload[0]?.value}/100</p>
      </div>
    )
  }
  return null
}

export default function RadarChartComponent({ data = defaultData, loading = false }) {
  if (loading) {
    return <div className="skeleton w-full h-64 rounded-lg" />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#1E1E22" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: '#8B8B9A', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Radar
          name="Skill"
          dataKey="score"
          stroke="#7C3AED"
          fill="#7C3AED"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: '#7C3AED', strokeWidth: 0, r: 3 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
