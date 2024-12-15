

/**
  LogLevels
  ----------------- 
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  FATAL: 60,
*/

module.exports = {
  apps : [
    {
      name: "HomeBudgetCluster",
      script: './src/API/startup.ts',
      watch: true,

      ignore_watch:["./src/API/Logs"],
      instances: 1, // 0 all available clusters
      /**
        PM2 will see that i want to increment the PORT variable for each instance The first instance 
        will have process.env.PORT = 3000 and the second process.env.PORT = 3001 
      */
      increment_var : 'PORT', 
      exec_mode: 'cluster',
      interpreter: 'ts-node',
      args: '',
      env: {
        PORT: 5000,
        NODE_ENV: "development",
        API_KEY: "KS2222222223",
        RETRY_TIMER: 5000,
        API_VERSION: 1,
        API_BASE_ROUTE: `/api/v${1}`,
        CONTROLLERS: "../../API/Controllers/*.ts", 
        LOG_LEVEL: 30,
        DB_USERNAME: "eifhen",
        DB_PASSWORD: "thetrue123",
        DB_DOMAIN: "JIMENEZG",
        DB_SERVER: "JIMENEZG",
        DB_NAME: "FinanzasHogar",
        DB_PORT: "1433",
        DB_INSTANCE: "MSSQLSERVER"

      },
      env_production: {
        PORT: 5000,
        NODE_ENV: "production",
        API_KEY: "KS2222222223",
        RETRY_TIMER: 5000,
        API_VERSION: 1,
        API_BASE_ROUTE: `/api/v${1}`,
        CONTROLLERS: "../../API/Controllers/*.ts", 
        LOG_LEVEL: 30,
        DB_USERNAME: "",
        DB_PASSWORD: "",
        DB_SERVER: "",
        DB_NAME: "",
        DB_PORT: "",
      },
      // Configuración de logs
      out_file: './src/API/Logs/out.log', // Logs de stdout
      error_file: './src/API/Logs/error.log', // Logs de stderr
      merge_logs: false, // Combina stdout y stderr
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Formato de fecha
    }, 
    // {
    //   script: './service-worker/',
    //   watch: ['./service-worker']
    // }
  ],
  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
