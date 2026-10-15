module.exports = {
  apps: [
    {
      name: 'mary-pwa',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
