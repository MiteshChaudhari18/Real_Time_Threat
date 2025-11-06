const axios = require('axios');

const API_KEY = process.env.SHODAN_API_KEY;
const BASE_URL = 'https://api.shodan.io';

/**
 * Lookup IP address information using Shodan
 */
async function lookupIP(ip) {
  if (!API_KEY || API_KEY === 'your_shodan_api_key_here') {
    throw new Error('Shodan API key not configured. Please add SHODAN_API_KEY to backend/.env');
  }

  try {
    const response = await axios.get(`${BASE_URL}/shodan/host/${ip}`, {
      params: {
        key: API_KEY
      },
      timeout: 10000
    });

    const data = response.data;

    const result = {
      ip: data.ip_str,
      country: data.country_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      organization: data.org,
      isp: data.isp,
      os: data.os || 'Unknown',
      ports: data.ports || [],
      services: [],
      vulns: [],
      hostnames: data.hostnames || [],
      lastUpdate: data.last_update
    };

    // Extract services
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(service => {
        result.services.push({
          port: service.port,
          protocol: service.transport || 'tcp',
          product: service.product || 'Unknown',
          version: service.version || null,
          banner: service.data?.substring(0, 200) || null
        });
      });
    }

    // Extract vulnerabilities
    if (data.vulns && Array.isArray(data.vulns)) {
      result.vulns = Object.keys(data.vulns);
    } else if (typeof data.vulns === 'object' && data.vulns !== null) {
      result.vulns = Object.keys(data.vulns);
    }

    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        found: false,
        message: 'IP not found in Shodan database'
      };
    }
    if (error.response?.status === 401) {
      throw new Error('Shodan API key invalid');
    }
    if (error.response?.status === 403) {
      throw new Error('Shodan API access forbidden - check subscription');
    }
    throw new Error(`Shodan API error: ${error.message}`);
  }
}

module.exports = {
  lookupIP
};

