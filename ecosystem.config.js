module.exports = {
  apps: [
    {
      name: "ice-craft",
      script: "src/app.ts",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",

      watch: ["src"],
      ignore_watch: ["node_modules"],

      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
