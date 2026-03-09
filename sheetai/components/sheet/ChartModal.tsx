'use client'
import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { X, BarChart2, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react'
import { SheetData } from '@/types'

interface ChartModalProps {
  data: SheetData
  onClose: () => void
}

type ChartType = 'bar' | 'line' | 'area' | 'pie'

const CHART_COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#ff7675', '#a29bfe', '#74b9ff', '#55efc4']

export default function ChartModal({ data, onClose }: ChartModalProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')

  const chartData = useMemo(() => {
    const result: Record<string, string | number>[] = []
    const rows = new Set<number>()
    const cols = new Set<number>()

    Object.keys(data).forEach(ref => {
      const match = ref.match(/^([A-Z]+)(\d+)$/)
      if (match) {
        cols.add(match[1].charCodeAt(0) - 64)
        rows.add(parseInt(match[2]))
      }
    })

    const sortedRows = Array.from(rows).sort((a, b) => a - b)
    const sortedCols = Array.from(cols).sort((a, b) => a - b)

    if (sortedRows.length === 0 || sortedCols.length === 0) return []

    const hasHeader = sortedRows[0] === 1 && isNaN(Number(data[`${String.fromCharCode(64 + sortedCols[0])}1`]?.raw))

    sortedRows.forEach((row, ri) => {
      if (ri === 0 && hasHeader) return
      const entry: Record<string, string | number> = {}
      sortedCols.forEach((col, ci) => {
        const ref = `${String.fromCharCode(64 + col)}${row}`
        const val = data[ref]?.raw || ''
        if (ci === 0) {
          entry.name = val || `Row ${row}`
        } else {
          const colLabel = hasHeader
            ? (data[`${String.fromCharCode(64 + col)}1`]?.raw || `Col ${ci}`)
            : `Col ${ci}`
          entry[colLabel] = isNaN(Number(val)) ? 0 : Number(val)
        }
      })
      result.push(entry)
    })

    return result
  }, [data])

  const dataKeys = chartData.length > 0
    ? Object.keys(chartData[0]).filter(k => k !== 'name')
    : []

  const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'bar',  icon: <BarChart2 size={16} />,   label: 'Bar' },
    { type: 'line', icon: <TrendingUp size={16} />,  label: 'Line' },
    { type: 'area', icon: <Activity size={16} />,    label: 'Area' },
    { type: 'pie',  icon: <PieIcon size={16} />,     label: 'Pie' },
  ]

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontFamily: 'var(--font-heading)', fontSize: 13 }}>
          No data to chart. Add data in columns A and B.
        </div>
      )
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 20, left: -10, bottom: 5 },
    }

    const axisStyle = {
      tick: { fill: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 11 },
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 12 }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 12 }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 12 }} />
              <Legend />
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={`${CHART_COLORS[i % CHART_COLORS.length]}33`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'pie':
        const pieData = chartData.map((d, i) => ({
          name: d.name as string,
          value: typeof d[dataKeys[0]] === 'number' ? d[dataKeys[0]] as number : 0,
        }))
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={130} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-fade-up" style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 14, width: 700, maxWidth: '95vw',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            Chart from Data
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Chart type selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {chartTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${chartType === type ? 'var(--accent)' : 'var(--border2)'}`,
                cursor: 'pointer',
                background: chartType === type ? 'var(--accent)' : 'var(--surface2)',
                color: chartType === type ? '#fff' : 'var(--text2)',
                fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12,
                transition: 'all 0.15s',
              } as React.CSSProperties}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ height: 320, background: 'var(--surface2)', borderRadius: 10, padding: '16px 8px' }}>
          {renderChart()}
        </div>
      </div>
    </div>
  )
}
