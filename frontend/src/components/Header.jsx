import { FaShieldAlt, FaHistory } from 'react-icons/fa'

function Header({ onToggleHistory, showHistory }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-3xl text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Real-Time Threat Intelligence Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                SOC Analyst Tool - Aggregate threat data from multiple sources
              </p>
            </div>
          </div>
          <button
            onClick={onToggleHistory}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showHistory
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FaHistory />
            <span>History</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

