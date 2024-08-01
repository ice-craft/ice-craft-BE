module.exports = {
  apps: [
    {
      name: "ice-craft",
      script: "src/app.ts",
      instances: 0,
      exec_mode: "cluster",
      autorestart: true,

      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
