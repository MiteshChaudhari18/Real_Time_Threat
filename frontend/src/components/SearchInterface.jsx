import { useState } from 'react'
import { FaSearch, FaServer, FaGlobe, FaFingerprint } from 'react-icons/fa'

function SearchInterface({ onSearch, loading, error }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('ip')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), type)
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'ip':
        return <FaServer className="text-blue-500" />
      case 'domain':
        return <FaGlobe className="text-green-500" />
      case 'hash':
        return <FaFingerprint className="text-purple-500" />
      default:
        return <FaSearch />
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Threat Intelligence Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="ip"
              checked={type === 'ip'}
              onChange={(e) => setType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-slate-300">IP Address</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="domain"
              checked={type === 'domain'}
              onChange={(e) => setType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-slate-300">Domain</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="hash"
              checked={type === 'hash'}
              onChange={(e) => setType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-slate-300">File Hash</span>
          </label>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {getTypeIcon()}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                type === 'ip'
                  ? 'Enter IP address (e.g., 8.8.8.8)'
                  : type === 'domain'
                  ? 'Enter domain (e.g., example.com)'
                  : 'Enter file hash (MD5, SHA1, or SHA256)'
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FaSearch />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}
      </form>

      <div className="mt-4 text-sm text-slate-400">
        <p>💡 Tip: This tool queries VirusTotal, Shodan, and AbuseIPDB for comprehensive threat analysis.</p>
      </div>
    </div>
  )
}

export default SearchInterface

