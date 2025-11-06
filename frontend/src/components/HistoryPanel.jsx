import { useState, useEffect } from 'react'
import { FaHistory, FaClock } from 'react-icons/fa'
import { apiGet } from '../utils/api'

function HistoryPanel() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet('/history?limit=20')
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      setError(error.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Clean':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-slate-700 text-slate-400 border-slate-600'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaHistory className="text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Lookup History</h3>
        </div>
        <div className="text-center py-8 text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaHistory className="text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Lookup History</h3>
        </div>
        <button
          onClick={fetchHistory}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No lookup history available</p>
          <p className="text-sm mt-2">Search queries will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-slate-700 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white">{item.query}</div>
                <span className={`px-2 py-1 rounded text-xs border ${getRiskColor(item.riskLevel)}`}>
                  {item.riskLevel}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="uppercase">{item.type}</span>
                <div className="flex items-center gap-1">
                  <FaClock />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
                <span>Score: {item.riskScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryPanel

