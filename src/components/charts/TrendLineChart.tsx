import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartGrid, chartMutedText, chartSingleSeries, chartSurface } from '../../lib/chartColors'

interface Point {
  x: string
  y: number
}

export default function TrendLineChart({ data, unit = '' }: { data: Point[]; unit?: string }) {
  if (data.length < 2) {
    return <div className="h-40 flex items-center justify-center text-sm text-base-500">Necesitas más registros para ver la tendencia.</div>
  }
  return (
    <div className="h-40 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartSingleSeries} stopOpacity={0.35} />
              <stop offset="100%" stopColor={chartSingleSeries} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tick={{ fill: chartMutedText, fontSize: 11 }} axisLine={{ stroke: chartGrid }} tickLine={false} minTickGap={24} />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ background: chartSurface, border: `1px solid ${chartGrid}`, borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: chartMutedText }}
            formatter={(v: number) => [`${v}${unit}`, '']}
          />
          <Area type="monotone" dataKey="y" stroke={chartSingleSeries} strokeWidth={2} fill="url(#trendFill)" dot={{ r: 3, fill: chartSingleSeries, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
