module.exports = {
  apps: [{
    name: 'spiral-mcp',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'file:/app/dev.db'
    }
  }]
};
