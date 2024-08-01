module.exports = {
  apps: [
    {
      name: "ice-craft-cluster",
      script: "src/app.ts",
      instances: 0,
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "ice-craft-fork",
      script: "src/app.ts",
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
