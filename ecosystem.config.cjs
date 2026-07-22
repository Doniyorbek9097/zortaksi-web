module.exports = {
  apps: [
    {
      name: 'zortaksi-web',
      cwd: __dirname,
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0',
      },
      max_memory_restart: '600M',
      time: true,
    },
  ],
};
