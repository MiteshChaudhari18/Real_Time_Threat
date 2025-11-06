#!/usr/bin/env node

/**
 * Setup Script for Real-Time Threat Intelligence Dashboard
 * This script helps set up the project with proper configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🚀 Real-Time Threat Intelligence Dashboard - Setup\n');
  console.log('This script will help you configure the project.\n');

  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const envExamplePath = path.join(__dirname, 'backend', 'env.example');

  // Check if .env already exists
  if (fs.existsSync(backendEnvPath)) {
    const overwrite = await question('backend/.env already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Read env.example
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    // Create default content
    envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (Optional - app works without it)
MONGODB_URI=mongodb://localhost:27017/threat-intel

# API Keys - Get your free keys from:
# VirusTotal: https://www.virustotal.com/gui/join-us
# Shodan: https://account.shodan.io/
# AbuseIPDB: https://www.abuseipdb.com/pricing

VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
SHODAN_API_KEY=your_shodan_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;
  }

  console.log('\n📝 API Keys Configuration');
  console.log('You can skip any key and add it later in backend/.env\n');

  // Get API keys
  const virustotalKey = await question('VirusTotal API Key (or press Enter to skip): ');
  const shodanKey = await question('Shodan API Key (or press Enter to skip): ');
  const abuseipdbKey = await question('AbuseIPDB API Key (or press Enter to skip): ');

  // Replace keys in content
  if (virustotalKey.trim()) {
    envContent = envContent.replace(
      /VIRUSTOTAL_API_KEY=.*/,
      `VIRUSTOTAL_API_KEY=${virustotalKey.trim()}`
    );
  }

  if (shodanKey.trim()) {
    envContent = envContent.replace(
      /SHODAN_API_KEY=.*/,
      `SHODAN_API_KEY=${shodanKey.trim()}`
    );
  }

  if (abuseipdbKey.trim()) {
    envContent = envContent.replace(
      /ABUSEIPDB_API_KEY=.*/,
      `ABUSEIPDB_API_KEY=${abuseipdbKey.trim()}`
    );
  }

  // Write .env file
  const backendDir = path.join(__dirname, 'backend');
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  fs.writeFileSync(backendEnvPath, envContent);
  console.log('\n✅ Configuration saved to backend/.env');

  // Check if dependencies are installed
  console.log('\n📦 Checking dependencies...');
  const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
  const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

  if (!fs.existsSync(backendNodeModules) || !fs.existsSync(frontendNodeModules)) {
    console.log('⚠️  Dependencies not installed.');
    const install = await question('Install dependencies now? (y/n): ');
    if (install.toLowerCase() === 'y') {
      console.log('\n📥 Installing dependencies...');
      console.log('Run: npm run install-all');
    }
  } else {
    console.log('✅ Dependencies are installed');
  }

  console.log('\n✨ Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Verify your API keys in backend/.env');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000');
  console.log('\nFor more information, see SETUP.md\n');

  rl.close();
}

setup().catch(err => {
  console.error('Error during setup:', err);
  rl.close();
  process.exit(1);
});

