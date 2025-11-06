# 🚀 Project Setup Guide

Complete setup instructions for the Real-Time Threat Intelligence Dashboard.

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- API keys for:
  - [VirusTotal](https://www.virustotal.com/gui/join-us) (Free tier available)
  - [Shodan](https://account.shodan.io/) (Free tier available)
  - [AbuseIPDB](https://www.abuseipdb.com/pricing) (Free tier available)
- MongoDB (optional - app works without it)

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root project
- Backend
- Frontend

### Step 2: Configure API Keys

1. **Copy the environment file:**
   ```bash
   # The .env file is already created in backend/
   # Just edit it with your API keys
   ```

2. **Edit `backend/.env` and add your API keys:**
   ```env
   VIRUSTOTAL_API_KEY=your_actual_virustotal_key
   SHODAN_API_KEY=your_actual_shodan_key
   ABUSEIPDB_API_KEY=your_actual_abuseipdb_key
   ```

   **Important:** Replace the placeholder values with your actual API keys.

### Step 3: Start MongoDB (Optional)

If you want to use the history tracking feature:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or install MongoDB locally
# Ubuntu/Debian:
sudo apt install mongodb

# macOS:
brew install mongodb-community

# Windows:
# Download from https://www.mongodb.com/try/download/community
```

Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/threat-intel
```

### Step 4: Start the Application

**Option A: Development Mode (Both Frontend & Backend)**
```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

**Option B: Run Separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## ✅ Verification

### Test Backend
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","message":"Threat Intelligence API is running"}
```

### Test Frontend
1. Open `http://localhost:3000`
2. Try a test search:
   - **IP Address**: `8.8.8.8` (Google DNS)
   - **Domain**: `example.com`
   - **File Hash**: Any MD5/SHA1/SHA256 hash

## 🔑 Getting API Keys

### VirusTotal
1. Go to https://www.virustotal.com/gui/join-us
2. Sign up for a free account
3. Navigate to API key section in your profile
4. Copy your API key
5. Add to `backend/.env` as `VIRUSTOTAL_API_KEY`

### Shodan
1. Go to https://account.shodan.io/
2. Create a free account
3. Your API key is displayed on the dashboard
4. Free tier: 100 queries/month
5. Add to `backend/.env` as `SHODAN_API_KEY`

### AbuseIPDB
1. Go to https://www.abuseipdb.com/pricing
2. Sign up for a free account
3. Navigate to API section
4. Copy your API key
5. Free tier: 1,000 queries/day
6. Add to `backend/.env` as `ABUSEIPDB_API_KEY`

## 🐛 Troubleshooting

### API Keys Not Working
- Verify keys are correct (no extra spaces)
- Check API key permissions
- Verify rate limits not exceeded
- Test keys directly with curl

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in backend/.env
```

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in `backend/.env`
- Verify `FRONTEND_URL` is set correctly

### MongoDB Connection Issues
- The app works without MongoDB (history tracking disabled)
- Check MongoDB is running if using database
- Verify `MONGODB_URI` in `backend/.env`

## 📝 Project Structure

```
RealTimeTread/
├── backend/
│   ├── .env              # Environment variables (API keys)
│   ├── server.js         # Express server
│   ├── routes/           # API routes
│   ├── services/         # API integrations
│   └── models/           # MongoDB models
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   └── utils/        # Utilities
│   └── vite.config.js    # Vite configuration
└── package.json          # Root package.json
```

## 🚀 Next Steps

- See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) for production deployment
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide
- See [README.md](./README.md) for full documentation

---

**Need Help?** Check the troubleshooting section or review the logs.

