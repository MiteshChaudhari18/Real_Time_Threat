import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaServer, FaShieldAlt } from 'react-icons/fa'

function SourceCard({ title, data, type }) {
  if (data.error) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-red-500/50">
        <div className="flex items-center gap-2 mb-4">
          <FaTimesCircle className="text-red-500" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-red-400 text-sm">{data.error}</p>
      </div>
    )
  }

  if (!data.found && type === 'virustotal') {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <FaShieldAlt className="text-blue-500" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm">{data.message || 'No data available'}</p>
      </div>
    )
  }

  const renderContent = () => {
    switch (type) {
      case 'virustotal':
        return (
          <>
            <div className="space-y-3">
              {data.malicious !== undefined && (
                <div>
                  <div className="text-sm text-slate-400">Detection Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {data.detectionRate}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {data.malicious}/{data.total} engines detected
                  </div>
                </div>
              )}
              {data.country && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>{data.country}</span>
                </div>
              )}
              {(data.organization || data.network) && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaServer className="text-blue-500" />
                  <span className="truncate">{data.organization || data.network}</span>
                </div>
              )}
            </div>
          </>
        )

      case 'shodan':
        if (data.found === false) {
          return <p className="text-slate-400 text-sm">{data.message}</p>
        }
        return (
          <>
            <div className="space-y-3">
              {data.country && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaMapMarkerAlt className="text-green-500" />
                  <span>{data.city ? `${data.city}, ` : ''}{data.country}</span>
                </div>
              )}
              {data.organization && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaServer className="text-green-500" />
                  <span className="truncate">{data.organization}</span>
                </div>
              )}
              {data.ports && data.ports.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-1">Open Ports</div>
                  <div className="flex flex-wrap gap-1">
                    {data.ports.slice(0, 10).map((port, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                      >
                        {port}
                      </span>
                    ))}
                    {data.ports.length > 10 && (
                      <span className="text-xs text-slate-500">
                        +{data.ports.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {data.vulns && data.vulns.length > 0 && (
                <div className="text-red-400 text-sm">
                  ⚠️ {data.vulns.length} vulnerabilities found
                </div>
              )}
            </div>
          </>
        )

      case 'abuseipdb':
        return (
          <>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-400">Abuse Confidence</div>
                <div className="text-2xl font-bold text-white">
                  {data.abuseConfidenceScore}/100
                </div>
              </div>
              {data.countryName && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaMapMarkerAlt className="text-purple-500" />
                  <span>{data.countryName}</span>
                </div>
              )}
              {data.totalReports > 0 && (
                <div className="text-sm text-slate-300">
                  {data.totalReports} reports from {data.numDistinctUsers} users
                </div>
              )}
              {data.isTor && (
                <div className="text-red-400 text-sm">⚠️ Tor Exit Node</div>
              )}
              {data.abuseConfidenceScore === 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <FaCheckCircle />
                  <span className="text-sm">No abuse reports</span>
                </div>
              )}
            </div>
          </>
        )

      default:
        return <p className="text-slate-400 text-sm">No data available</p>
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <FaShieldAlt className="text-blue-500" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {renderContent()}
    </div>
  )
}

export default SourceCard

