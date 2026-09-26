module.exports = {
  apps: [
    {
      name: 'pyxie',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=768',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
