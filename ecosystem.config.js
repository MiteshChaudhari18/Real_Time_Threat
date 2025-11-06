/**
 * PM2 Ecosystem Configuration
 * For process management on traditional server deployments
 */
module.exports = {
  apps: [{
    name: 'threat-intel-backend',
    script: './backend/server.js',
    cwd: process.cwd(),
    instances: 2, // Cluster mode - use 2 instances
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};

