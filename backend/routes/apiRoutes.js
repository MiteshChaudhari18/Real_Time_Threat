const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const virustotalService = require('../services/virustotal');
const shodanService = require('../services/shodan');
const abuseipdbService = require('../services/abuseipdb');
const LookupHistory = require('../models/LookupHistory');
const { generateThreatReport } = require('../utils/pdfGenerator');

// Rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
});

router.use(limiter);

// Aggregate threat intelligence from all sources
router.post('/threat-intel', async (req, res) => {
  try {
    const { query, type } = req.body; // type: 'ip', 'domain', 'hash'

    if (!query || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: query and type' 
      });
    }

    // Input validation
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return res.status(400).json({ 
        error: 'Query cannot be empty' 
      });
    }

    // Validate type
    if (!['ip', 'domain', 'hash'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: ip, domain, or hash' 
      });
    }

    // Basic format validation
    if (type === 'ip') {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(trimmedQuery)) {
        return res.status(400).json({ 
          error: 'Invalid IP address format' 
        });
      }
    } else if (type === 'domain') {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/;
      if (!domainRegex.test(trimmedQuery)) {
        return res.status(400).json({ 
          error: 'Invalid domain format' 
        });
      }
    } else if (type === 'hash') {
      const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
      if (!hashRegex.test(trimmedQuery)) {
        return res.status(400).json({ 
          error: 'Invalid hash format. Must be MD5 (32 chars), SHA1 (40 chars), or SHA256 (64 chars)' 
        });
      }
    }

    console.log(`🔍 Analyzing ${type}: ${trimmedQuery}`);

    const results = {
      query: trimmedQuery,
      type,
      timestamp: new Date().toISOString(),
      sources: {},
      aggregated: {
        riskLevel: 'Unknown',
        riskScore: 0,
        threats: [],
        detections: 0,
        totalSources: 0
      }
    };

    // Fetch data from all sources in parallel
    const promises = [];

    // VirusTotal check
    if (type === 'ip' || type === 'domain' || type === 'hash') {
      promises.push(
        virustotalService.analyze(trimmedQuery, type)
          .then(data => ({ source: 'virustotal', data }))
          .catch(err => ({ source: 'virustotal', error: err.message }))
      );
    }

    // Shodan check (IPs only)
    if (type === 'ip') {
      promises.push(
        shodanService.lookupIP(trimmedQuery)
          .then(data => ({ source: 'shodan', data }))
          .catch(err => ({ source: 'shodan', error: err.message }))
      );
    }

    // AbuseIPDB check (IPs only)
    if (type === 'ip') {
      promises.push(
        abuseipdbService.checkIP(trimmedQuery)
          .then(data => ({ source: 'abuseipdb', data }))
          .catch(err => ({ source: 'abuseipdb', error: err.message }))
      );
    }

    const sourceResults = await Promise.all(promises);

    // Process results
    let detectionCount = 0;
    let riskScore = 0;
    const threats = [];

    sourceResults.forEach(({ source, data, error }) => {
      if (error) {
        results.sources[source] = { error };
        return;
      }

      results.sources[source] = data;

      // Aggregate risk indicators
      if (source === 'virustotal' && data && data.found !== false) {
        // Count malicious detections
        const malicious = data.malicious || 0;
        const suspicious = data.suspicious || 0;
        const totalThreats = malicious + suspicious;
        
        if (malicious > 0) {
          detectionCount += malicious;
          threats.push(`Detected as malicious by ${malicious} antivirus engines`);
          // More malicious engines = higher risk (capped at 50 points)
          riskScore += Math.min(malicious * 8, 50);
        }
        
        if (suspicious > 0) {
          detectionCount += suspicious;
          threats.push(`Flagged as suspicious by ${suspicious} engines`);
          // Suspicious is less severe than malicious
          riskScore += Math.min(suspicious * 3, 20);
        }

        // Use reputation score if available (negative reputation = higher risk)
        if (data.reputation !== undefined && data.reputation < 0) {
          const repRisk = Math.abs(data.reputation) / 10; // Convert negative rep to positive risk
          riskScore += Math.min(repRisk, 15);
          threats.push(`Negative reputation score: ${data.reputation}`);
        }
      }

      if (source === 'abuseipdb' && data) {
        const abuseScore = data.abuseConfidenceScore || 0;
        
        if (abuseScore > 0) {
          // Abuse confidence directly contributes to risk (0-100 scale)
          riskScore += Math.min(abuseScore, 60); // Cap at 60 to leave room for other factors
          
          if (abuseScore > 75) {
            threats.push(`Very high abuse confidence: ${abuseScore}%`);
          } else if (abuseScore > 50) {
            threats.push(`High abuse confidence: ${abuseScore}%`);
          } else if (abuseScore > 25) {
            threats.push(`Moderate abuse reports: ${abuseScore}%`);
          }
        }

        // Tor exit nodes are high risk
        if (data.isTor) {
          threats.push('⚠️ Tor Exit Node detected');
          riskScore += 30;
        }

        // Check for abuse categories
        if (data.categories && data.categories.length > 0) {
          const categoryNames = {
            3: 'Fraud Orders',
            4: 'DDoS Attack',
            5: 'FTP Brute-Force',
            6: 'Ping of Death',
            7: 'Phishing',
            8: 'Fraud VoIP',
            9: 'Open Proxy',
            10: 'Web Spam',
            11: 'Email Spam',
            12: 'Blog Spam',
            13: 'VPN IP',
            14: 'Port Scan',
            15: 'Hacking',
            16: 'SQL Injection',
            17: 'Spoofing',
            18: 'Brute-Force',
            19: 'Bad Web Bot',
            20: 'Exploited Host',
            21: 'Web App Attack',
            22: 'SSH',
            23: 'IoT Targeted'
          };
          
          const categoryList = data.categories.map(cat => categoryNames[cat] || `Category ${cat}`).join(', ');
          threats.push(`Abuse categories: ${categoryList}`);
          riskScore += data.categories.length * 5;
        }

        // High number of reports indicates serious threat
        if (data.totalReports > 0) {
          if (data.totalReports > 50) {
            threats.push(`⚠️ ${data.totalReports} abuse reports from ${data.numDistinctUsers} users`);
            riskScore += 10;
          } else if (data.totalReports > 10) {
            threats.push(`${data.totalReports} abuse reports reported`);
          }
        }
      }

      if (source === 'shodan' && data && data.found !== false) {
        // Vulnerabilities are high risk
        if (data.vulns && Array.isArray(data.vulns) && data.vulns.length > 0) {
          threats.push(`⚠️ ${data.vulns.length} known vulnerabilities found`);
          riskScore += Math.min(data.vulns.length * 12, 40); // Cap at 40 points
        }

        // Check for risky open ports
        if (data.ports && Array.isArray(data.ports)) {
          const riskyPorts = [22, 23, 135, 139, 445, 1433, 3306, 3389, 5432, 5900, 8080];
          const foundRiskyPorts = data.ports.filter(port => riskyPorts.includes(port));
          
          if (foundRiskyPorts.length > 0) {
            threats.push(`Risky ports open: ${foundRiskyPorts.join(', ')}`);
            riskScore += foundRiskyPorts.length * 2;
          }

          // Many open ports can indicate misconfiguration
          if (data.ports.length > 20) {
            threats.push(`Many open ports detected (${data.ports.length}) - possible misconfiguration`);
            riskScore += 5;
          }
        }

        // Check for suspicious services
        if (data.services && Array.isArray(data.services)) {
          const suspiciousServices = data.services.filter(s => 
            s.product && (
              s.product.toLowerCase().includes('telnet') ||
              s.product.toLowerCase().includes('ftp') ||
              s.product.toLowerCase().includes('vnc') ||
              s.product.toLowerCase().includes('rdp')
            )
          );
          
          if (suspiciousServices.length > 0) {
            threats.push(`Suspicious services detected: ${suspiciousServices.map(s => s.product).join(', ')}`);
            riskScore += suspiciousServices.length * 3;
          }
        }
      }

      results.aggregated.totalSources++;
    });

    // Determine risk level
    if (riskScore >= 80) {
      results.aggregated.riskLevel = 'High';
    } else if (riskScore >= 40) {
      results.aggregated.riskLevel = 'Medium';
    } else if (riskScore > 0) {
      results.aggregated.riskLevel = 'Low';
    } else {
      results.aggregated.riskLevel = 'Clean';
    }

    results.aggregated.riskScore = Math.min(riskScore, 100);
    results.aggregated.detections = detectionCount;
    results.aggregated.threats = threats;

    // Save to database if available
    if (mongoose.connection.readyState === 1) {
      try {
        await LookupHistory.create({
          query: trimmedQuery,
          type,
          riskLevel: results.aggregated.riskLevel,
          riskScore: results.aggregated.riskScore,
          sources: results.sources,
          timestamp: results.timestamp
        });
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error in threat-intel endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to analyze threat intelligence',
      message: error.message 
    });
  }
});

// Get lookup history
router.get('/history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ history: [], message: 'Database not connected' });
    }

    const limit = parseInt(req.query.limit) || 20;
    const history = await LookupHistory.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-sources')
      .lean();

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        totalLookups: 0,
        riskDistribution: {},
        message: 'Database not connected' 
      });
    }

    const totalLookups = await LookupHistory.countDocuments();
    const riskDistribution = await LookupHistory.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const distribution = {};
    riskDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    res.json({
      totalLookups,
      riskDistribution: distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF report
router.post('/generate-report', async (req, res) => {
  try {
    const threatData = req.body;
    
    if (!threatData || !threatData.query) {
      return res.status(400).json({ error: 'Invalid threat data' });
    }

    generateThreatReport(threatData, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

module.exports = router;

