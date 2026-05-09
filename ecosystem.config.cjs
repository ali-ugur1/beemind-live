/**
 * BeeMora — PM2 Ecosystem Configuration
 *
 * Kullanım:
 *   pm2 start ecosystem.config.cjs
 *   pm2 reload ecosystem.config.cjs
 *   pm2 stop beemora-api
 *   pm2 logs beemora-api
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'beemora-api',
      script: 'server.js',
      cwd: __dirname,

      // Node.js flags
      node_args: '--max-old-space-size=512',

      // Ortam değişkenleri
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Instance ayarları
      instances: 1, // JSON dosya bazlı storage ile tek instance kullanın
      exec_mode: 'fork',

      // Auto-restart
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 5000,
      max_restarts: 10,

      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 8000,
      shutdown_with_message: true,

      // Log dosyaları
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/beemora-error.log',
      out_file: './logs/beemora-out.log',
      merge_logs: true,
      log_type: 'json',

      // Otomatik log rotation (pm2-logrotate modülü ile)
      // pm2 install pm2-logrotate
      // pm2 set pm2-logrotate:max_size 10M
      // pm2 set pm2-logrotate:retain 7
    },
  ],
};
