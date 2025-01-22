import { ConnectionConfiguration } from "tedious";

/** 
  Si la connección no funciona revisar las credenciales de acceso y 
  que el Sql Agent esté corriendo
*/

const dbConfig = JSON.parse(process.env.DATABASE ?? "");

/** Archivo de configuración de la conección a sql */
export const sqlDBConfig: ConnectionConfiguration = {
  server: dbConfig?.SERVER ?? "",
  options: {
    database: dbConfig?.NAME ?? "",
    instanceName: dbConfig?.INSTANCE ?? "",
    // port: Number(process.env.DB_PORT ?? 0),
    trustServerCertificate: true,
    // Aborta cualquier transacción automaticamente si ocurre un error en sql.
    abortTransactionOnError: true,
    // The number of milliseconds before the attempt to connect is considered failed (default: 15000).
    connectTimeout: dbConfig?.CONNECTION_TIMEOUT ?? 3000,
  },
  authentication: {
    type: 'default',
    options: {
      userName: dbConfig?.USERNAME ?? "",
      password: dbConfig?.PASSWORD ?? "",
      //domain: process.env.DB_DOMAIN ?? "",
    },
  },
}