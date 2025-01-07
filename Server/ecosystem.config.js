

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
      script: './src/API/index.ts',
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
        TOKEN_KEY: "KSJDAKSDQW##1235DSAKDAJDAQWIE23ZZ_AKFJOA",
        API_KEY: "KS2222222223",
        API_KEY_HEADER: "fh-api-key",
        RETRY_TIMER: 5000,
        API_VERSION: 1,
        API_BASE_ROUTE: `/api/v${1}`,
        CONTROLLERS: "../../API/Controllers/*.ts", 
        LOG_LEVEL: 30,
        DATABASE: JSON.stringify({
          USERNAME: "eifhen",
          PASSWORD: "thetrue123",
          DOMAIN: "JIMENEZG",
          SERVER: "JIMENEZG",
          NAME: "FinanzasHogar",
          PORT: "1433",
          INSTANCE: "MSSQLSERVER"
        }),
        IMAGE_PROVIDER: JSON.stringify({
          cloudinary: {
            cloud_name: "deeho16gc",
            api_key: "315486825267688",
            api_secret: "fK6K-Tb05H7WuW0hvewaEM2TbxY",
          }
        })
      },
      env_production: {
        PORT: 5000,
        NODE_ENV: "production",
        TOKEN_KEY: "KSJDAKSDQW##1235DSAKDAJDAQWIE23ZZ_AKFJOA",
        API_KEY: "KS2222222223",
        API_KEY_HEADER: "fh-api-key",
        RETRY_TIMER: 5000,
        API_VERSION: 1,
        API_BASE_ROUTE: `/api/v${1}`,
        CONTROLLERS: "../../API/Controllers/*.ts", 
        LOG_LEVEL: 30,
        DATABASE: JSON.stringify({
          USERNAME: "eifhen",
          PASSWORD: "thetrue123",
          DOMAIN: "JIMENEZG",
          SERVER: "JIMENEZG",
          NAME: "FinanzasHogar",
          PORT: "1433",
          INSTANCE: "MSSQLSERVER"
        }),
        IMAGE_PROVIDER: JSON.stringify({
          CLOUDINARY: {
            CLOUD_NAME: "deeho16gc",
            API_KEY: "315486825267688",
            API_SECRET: "fK6K-Tb05H7WuW0hvewaEM2TbxY",
          }
        })
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
