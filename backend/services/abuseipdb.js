const axios = require('axios');

const API_KEY = process.env.ABUSEIPDB_API_KEY;
const BASE_URL = 'https://api.abuseipdb.com/api/v2';

/**
 * Check IP address reputation using AbuseIPDB
 */
async function checkIP(ip) {
  if (!API_KEY || API_KEY === 'your_abuseipdb_api_key_here') {
    throw new Error('AbuseIPDB API key not configured. Please add ABUSEIPDB_API_KEY to backend/.env');
  }

  try {
    const response = await axios.get(`${BASE_URL}/check`, {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
        verbose: '' // Empty string enables verbose mode to get reports
      },
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data.data;

    // Extract categories from reports if verbose mode is enabled
    let categories = [];
    if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
      // Get unique categories from all reports
      const allCategories = new Set();
      data.reports.forEach(report => {
        if (report.categories && Array.isArray(report.categories)) {
          report.categories.forEach(cat => allCategories.add(cat));
        }
      });
      categories = Array.from(allCategories);
    }

    const result = {
      ip: data.ipAddress,
      isPublic: data.isPublic,
      ipVersion: data.ipVersion,
      isWhitelisted: data.isWhitelisted,
      abuseConfidenceScore: data.abuseConfidenceScore || 0,
      countryCode: data.countryCode,
      countryName: data.countryName,
      usageType: data.usageType,
      isp: data.isp,
      domain: data.domain,
      hostnames: data.hostnames || [],
      totalReports: data.totalReports || 0,
      numDistinctUsers: data.numDistinctUsers || 0,
      lastReportedAt: data.lastReportedAt,
      isTor: data.isTor || false,
      categories: categories
    };

    return result;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('AbuseIPDB API rate limit exceeded');
    }
    if (error.response?.status === 401) {
      throw new Error('AbuseIPDB API key invalid');
    }
    throw new Error(`AbuseIPDB API error: ${error.message}`);
  }
}

module.exports = {
  checkIP
};

