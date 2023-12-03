module.exports = {
  apps: [
    {
      name: 'main-app',
      script: './index.js',
      node_args: '--experimental-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    }
  ],
};
