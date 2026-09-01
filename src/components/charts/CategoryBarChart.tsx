import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { categoricalDark, chartGrid, chartMutedText, chartSurface } from '../../lib/chartColors'

interface Bar1 {
  label: string
  value: number
}

export default function CategoryBarChart({ data, unit = '' }: { data: Bar1[]; unit?: string }) {
  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-sm text-base-500">Todavía no hay datos suficientes.</div>
  }
  return (
    <div className="h-48 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="0" />
          <XAxis dataKey="label" tick={{ fill: chartMutedText, fontSize: 10 }} axisLine={{ stroke: chartGrid }} tickLine={false} interval={0} angle={-25} textAnchor="end" height={46} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: chartSurface, border: `1px solid ${chartGrid}`, borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: chartMutedText }}
            formatter={(v: number) => [`${v}${unit}`, '']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={categoricalDark[i % categoricalDark.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
