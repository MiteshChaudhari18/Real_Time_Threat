import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function ThreatChart({ threatData }) {
  // Calculate risk distribution for visualization
  const riskData = [
    { name: 'Risk Score', value: threatData.aggregated.riskScore },
    { name: 'Remaining', value: 100 - threatData.aggregated.riskScore }
  ]

  const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
    clean: '#10b981',
    remaining: '#475569'
  }

  const getColor = () => {
    const level = threatData.aggregated.riskLevel
    if (level === 'High') return COLORS.high
    if (level === 'Medium') return COLORS.medium
    if (level === 'Low') return COLORS.low
    if (level === 'Clean') return COLORS.clean
    return COLORS.remaining
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Risk Score Visualization</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {riskData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? getColor() : COLORS.remaining}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ThreatChart

