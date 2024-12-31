import { ConnectionConfiguration } from "tedious";

/** 
  Si la connección no funciona revisar las credenciales de acceso y 
  que el Sql Agent esté corriendo
*/

/** Archivo de configuración de la conección a sql */
export const sqlDBConfig: ConnectionConfiguration = {
  server: process.env.DB_SERVER ?? "",
  options: {
    database: process.env.DB_NAME ?? "",
    instanceName: process.env.DB_INSTANCE ?? "",
    // port: Number(process.env.DB_PORT ?? 0),
    trustServerCertificate: true,
    // Aborta cualquier transacción automaticamente si ocurre un error en sql.
    abortTransactionOnError: true,
    // The number of milliseconds before the attempt to connect is considered failed (default: 15000).
    connectTimeout: 3000,
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USERNAME ?? "",
      password: process.env.DB_PASSWORD ?? "",
      //domain: process.env.DB_DOMAIN ?? "",
    },
  },
}