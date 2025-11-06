function RiskCard({ title, value, subtitle }) {
  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <div className="text-slate-400 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  )
}

export default RiskCard

