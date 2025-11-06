# 🛡️ Real-Time Threat Intelligence Dashboard

A comprehensive web dashboard that aggregates and visualizes live cybersecurity threat data from multiple public threat intelligence APIs. This tool helps SOC analysts quickly assess IPs, domains, or file hashes for malicious activity.

## 🎯 Features

- **Multi-Source Threat Intelligence**: Aggregates data from VirusTotal, Shodan, and AbuseIPDB
- **Real-Time Analysis**: Instant threat assessment with risk scoring
- **Beautiful Dashboard**: Modern UI with Tailwind CSS and interactive charts
- **PDF Report Generation**: Download detailed threat reports
- **Lookup History**: Track past searches (requires MongoDB)
- **Risk Visualization**: Visual representation of threat levels

## 🚀 Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **APIs**: VirusTotal, Shodan, AbuseIPDB
- **Database**: MongoDB (optional)
- **Visualization**: Recharts

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional - for history tracking)
- API keys for:
  - [VirusTotal](https://www.virustotal.com/gui/join-us) (Free tier available)
  - [Shodan](https://account.shodan.io/) (Free tier available)
  - [AbuseIPDB](https://www.abuseipdb.com/pricing) (Free tier available)

## 🔧 Installation

### Quick Start (5 minutes)

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Configure API keys**
   
   Create `backend/.env` file:
   ```bash
   # Windows
   copy backend\env.example backend\.env
   
   # Linux/Mac
   cp backend/env.example backend/.env
   ```
   
   Edit `backend/.env` and add your API keys:
   ```env
   VIRUSTOTAL_API_KEY=your_key_here
   SHODAN_API_KEY=your_key_here
   ABUSEIPDB_API_KEY=your_key_here
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to: **http://localhost:3000**

### Detailed Setup

For complete setup instructions, see **[SETUP.md](./SETUP.md)**

For quick reference, see **[QUICK_START.md](./QUICK_START.md)**

### Optional: MongoDB Setup

If you want to use history tracking:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or install MongoDB locally
```

Then update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/threat-intel
```

## 🏃 Running the Application

### Development Mode (Both Frontend & Backend)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## 📖 Usage

1. Open `http://localhost:3000` in your browser
2. Select the query type (IP Address, Domain, or File Hash)
3. Enter your query and click "Search"
4. View the aggregated threat intelligence results
5. Download a PDF report if needed

### Example Queries

- **IP Address**: `8.8.8.8`, `1.1.1.1`
- **Domain**: `example.com`, `google.com`
- **File Hash**: MD5, SHA1, or SHA256 hash

## 🧠 API Endpoints

### POST `/api/threat-intel`
Analyze a threat (IP, domain, or hash)

**Request:**
```json
{
  "query": "8.8.8.8",
  "type": "ip"
}
```

**Response:**
```json
{
  "query": "8.8.8.8",
  "type": "ip",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "aggregated": {
    "riskLevel": "Low",
    "riskScore": 15,
    "threats": [],
    "detections": 0,
    "totalSources": 3
  },
  "sources": {
    "virustotal": { ... },
    "shodan": { ... },
    "abuseipdb": { ... }
  }
}
```

### GET `/api/history`
Get lookup history (requires MongoDB)

### GET `/api/stats`
Get statistics (requires MongoDB)

### POST `/api/generate-report`
Generate PDF threat report

## 📁 Project Structure

```
RealTimeTread/
├── backend/
│   ├── models/
│   │   └── LookupHistory.js      # MongoDB model
│   ├── routes/
│   │   └── apiRoutes.js           # API endpoints
│   ├── services/
│   │   ├── virustotal.js          # VirusTotal integration
│   │   ├── shodan.js              # Shodan integration
│   │   └── abuseipdb.js           # AbuseIPDB integration
│   ├── utils/
│   │   └── pdfGenerator.js        # PDF report generation
│   ├── server.js                  # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── SearchInterface.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── RiskCard.jsx
│   │   │   ├── SourceCard.jsx
│   │   │   └── ThreatChart.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔐 Getting API Keys

### VirusTotal
1. Go to https://www.virustotal.com/gui/join-us
2. Sign up for a free account
3. Navigate to API key section in your profile
4. Copy your API key

### Shodan
1. Go to https://account.shodan.io/
2. Create a free account
3. Your API key is displayed on the dashboard
4. Free tier: 100 queries/month

### AbuseIPDB
1. Go to https://www.abuseipdb.com/pricing
2. Sign up for a free account
3. Navigate to API section
4. Copy your API key
5. Free tier: 1,000 queries/day

## 🎨 Features Explained

### Risk Scoring
The system calculates a risk score (0-100) based on:
- VirusTotal detections (10 points per detection)
- AbuseIPDB confidence score (direct mapping)
- Shodan vulnerabilities (15 points per vulnerability)

### Risk Levels
- **Clean** (0): No threats detected
- **Low** (1-39): Minor indicators
- **Medium** (40-79): Moderate risk
- **High** (80-100): Significant threat

## 🚀 Deployment

### Quick Deployment Guide

For a quick deployment guide, see **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)**

For comprehensive deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Deployment Options

1. **Traditional Server** ⭐ - Node.js + PM2 + Nginx (Recommended)
2. **Cloud Platforms** - Render, Heroku, AWS, Vercel/Netlify

### Quick Start

```bash
# 1. Install dependencies
npm run install-all

# 2. Configure backend
cd backend
cp env.example .env
# Edit .env with your API keys

# 3. Build frontend
cd ../frontend
npm run build

# 4. Start backend
cd ../backend
npm start  # or use PM2 for production
```

### Key Configuration Changes

**Backend** (`backend/.env`):
- Set `FRONTEND_URL` to your frontend domain
- Configure all API keys
- Set MongoDB URI (optional)

**Frontend** (`frontend/.env.production`):
- Set `VITE_API_URL` to your backend API URL

For deployment instructions, see the deployment guides above.

## 🐛 Troubleshooting

**API Rate Limits:**
- Free tiers have rate limits
- The app handles rate limit errors gracefully
- Consider upgrading API plans for production use

**MongoDB Connection:**
- The app works without MongoDB (history tracking disabled)
- Check MongoDB URI in `.env` file
- Ensure MongoDB is running if using database features

**CORS Issues:**
- Backend is configured to allow frontend origin
- Check `backend/server.js` for CORS settings

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for SOC Analysts and Cybersecurity Professionals**

