const axios = require('axios');

const API_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE_URL = 'https://www.virustotal.com/api/v3';

/**
 * Analyze an IP, domain, or file hash using VirusTotal v3 API
 */
async function analyze(query, type) {
  if (!API_KEY || API_KEY === 'your_virustotal_api_key_here') {
    throw new Error('VirusTotal API key not configured. Please add VIRUSTOTAL_API_KEY to backend/.env');
  }

  try {
    let endpoint = '';

    switch (type) {
      case 'ip':
        endpoint = `/ip_addresses/${query}`;
        break;
      case 'domain':
        endpoint = `/domains/${query}`;
        break;
      case 'hash':
        endpoint = `/files/${query}`;
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'x-apikey': API_KEY
      },
      timeout: 15000
    });

    const data = response.data.data;

    // Extract relevant information from v3 API response
    const attributes = data.attributes || {};
    const lastAnalysisStats = attributes.last_analysis_stats || {};
    
    const malicious = lastAnalysisStats.malicious || 0;
    const suspicious = lastAnalysisStats.suspicious || 0;
    const total = (lastAnalysisStats.harmless || 0) + malicious + suspicious + (lastAnalysisStats.undetected || 0);
    const totalDetections = malicious + suspicious;

    const result = {
      found: true,
      scanDate: attributes.last_analysis_date || null,
      positives: malicious,
      suspicious: suspicious,
      total: total,
      malicious: malicious,
      detectionRate: total > 0 
        ? ((totalDetections / total) * 100).toFixed(2) 
        : '0.00',
      detections: []
    };

    // Extract detection details from last_analysis_results
    if (attributes.last_analysis_results) {
      Object.entries(attributes.last_analysis_results).forEach(([engine, scanResult]) => {
        if (scanResult.category === 'malicious' || scanResult.category === 'suspicious') {
          result.detections.push({
            engine,
            result: scanResult.result || scanResult.category,
            method: scanResult.method
          });
        }
      });
    }

    // Additional data for IPs/Domains
    if (type === 'ip' || type === 'domain') {
      result.asn = attributes.asn;
      result.country = attributes.country;
      result.network = attributes.network || attributes.as_owner;
      if (attributes.as_owner) {
        result.organization = attributes.as_owner;
      } else if (attributes.network) {
        result.organization = attributes.network;
      }
      
      // For IPs
      if (type === 'ip') {
        result.reputation = attributes.reputation || 0;
        result.lastModificationDate = attributes.last_modification_date;
      }
      
      // For domains
      if (type === 'domain') {
        result.registrar = attributes.registrar;
        result.lastUpdate = attributes.last_update_date;
      }
    }

    // For file hashes
    if (type === 'hash') {
      result.sha256 = attributes.sha256;
      result.sha1 = attributes.sha1;
      result.md5 = attributes.md5;
      result.size = attributes.size;
      result.type = attributes.type_description;
      result.reputation = attributes.reputation || 0;
    }

    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        found: false,
        message: 'No results found in VirusTotal database'
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('VirusTotal API key invalid or unauthorized');
    }
    if (error.response?.status === 429) {
      throw new Error('VirusTotal API rate limit exceeded');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid query format for VirusTotal');
    }
    throw new Error(`VirusTotal API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = {
  analyze
};

