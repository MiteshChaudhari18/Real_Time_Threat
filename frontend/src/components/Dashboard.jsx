import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaDownload } from 'react-icons/fa'
import RiskCard from './RiskCard'
import SourceCard from './SourceCard'
import ThreatChart from './ThreatChart'

function Dashboard({ threatData, onGenerateReport }) {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'text-red-500 bg-red-500/10 border-red-500/50'
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50'
      case 'Low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/50'
      case 'Clean':
        return 'text-green-500 bg-green-500/10 border-green-500/50'
      default:
        return 'text-slate-400 bg-slate-700 border-slate-600'
    }
  }

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return <FaExclamationTriangle className="text-red-500" />
      case 'Clean':
        return <FaCheckCircle className="text-green-500" />
      default:
        return <FaInfoCircle className="text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview Card */}
      <div className={`bg-slate-800 rounded-lg shadow-lg p-6 border-2 ${getRiskColor(threatData.aggregated.riskLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getRiskIcon(threatData.aggregated.riskLevel)}
            <div>
              <h2 className="text-2xl font-bold">Risk Assessment</h2>
              <p className="text-sm text-slate-400">Query: {threatData.query}</p>
            </div>
          </div>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload />
            <span>Generate PDF Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <RiskCard
            title="Risk Level"
            value={threatData.aggregated.riskLevel}
            subtitle="Overall threat level"
          />
          <RiskCard
            title="Risk Score"
            value={`${threatData.aggregated.riskScore}/100`}
            subtitle="Calculated risk score"
          />
          <RiskCard
            title="Detections"
            value={threatData.aggregated.detections}
            subtitle="Total malicious detections"
          />
          <RiskCard
            title="Sources"
            value={threatData.aggregated.totalSources}
            subtitle="APIs queried"
          />
        </div>

        {threatData.aggregated.threats && threatData.aggregated.threats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-semibold mb-3">Identified Threats:</h3>
            <ul className="space-y-2">
              {threatData.aggregated.threats.map((threat, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{threat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Charts */}
      <ThreatChart threatData={threatData} />

      {/* Source Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {threatData.sources.virustotal && (
          <SourceCard
            title="VirusTotal"
            data={threatData.sources.virustotal}
            type="virustotal"
          />
        )}
        {threatData.sources.shodan && (
          <SourceCard
            title="Shodan"
            data={threatData.sources.shodan}
            type="shodan"
          />
        )}
        {threatData.sources.abuseipdb && (
          <SourceCard
            title="AbuseIPDB"
            data={threatData.sources.abuseipdb}
            type="abuseipdb"
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard

