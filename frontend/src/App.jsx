import { useState } from 'react'
import SearchInterface from './components/SearchInterface'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import HistoryPanel from './components/HistoryPanel'
import { apiPost, apiRequest } from './utils/api'

function App() {
  const [threatData, setThreatData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleSearch = async (query, type) => {
    setLoading(true)
    setError(null)
    setThreatData(null)

    try {
      const data = await apiPost('/threat-intel', { query, type })
      setThreatData(data)
    } catch (err) {
      setError(err.message)
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!threatData) return

    try {
      const response = await apiRequest('/generate-report', {
        method: 'POST',
        body: JSON.stringify(threatData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `threat-report-${threatData.query}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Report generation error:', err)
      alert('Failed to generate PDF report')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className={`flex-1 ${showHistory ? 'lg:w-2/3' : 'lg:w-full'}`}>
            <SearchInterface 
              onSearch={handleSearch}
              loading={loading}
              error={error}
            />

            {threatData && (
              <Dashboard 
                threatData={threatData}
                onGenerateReport={handleGenerateReport}
              />
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="lg:w-1/3">
              <HistoryPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

