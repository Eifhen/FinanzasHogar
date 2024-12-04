import { Server } from "http";
import WebServerConfig from "../../Infraestructure/Configurations/WebServerConfig";
import AppContainerConfig from "../../Infraestructure/Configurations/AppContainerConfig";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Infraestructure/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Infraestructure/Managers/LoggerManager";
import ErrorHandler from "../../Infraestructure/Shered/ErrorHandling/ErrorHandler";

export default class ServerManager {

  /** Objeto server, este objeto nos sirve para manipular nuestro servidor*/
  private _server?: Server;

  /** Timer de reintentos, nos sirve para definir cuando restablecer nuestro server */
  private _retryTimer: number = Number(process.env.RETRY_TIMER ?? 0);

  /** Objeto de tipo WebServerConfig el cual nos sirve para manipular la configuración del servidor web */
  private _app: WebServerConfig;

  /** Instancia del logger */
  private _logger: ILoggerManager;

  constructor() {

    // Instanciamos el logger
    this._logger = new LoggerManager({
      entityCategory: LoggEntityCategorys.MANAGER,
      entityName: "ServerManager"
    });

    // Agregamos los middlewares a la lista
    this._app = new WebServerConfig().Build({
      middlewares: [
        new AppContainerConfig().GetContainer(),
      ],
      nextMiddlewares:[
        new ErrorHandler().GetInterceptor(),
      ]
    });
  }

  /** Este evento se ejecuta si algún error no fue manejado por la app */
  private OnUncaughtException = () => {
    process.on("uncaughtException", (err: Error) => {

      this._logger.Error(LoggerTypes.FATAL, {
        message: err.message,
        stack: err.stack
      });

       /** Se hace un cleanup de cualquier funcionalidad que se esté ejecutando  */

       /** Se cierra la conección a la BD */

       /** Se envía notificación por EMAIL  */


      if (this._server) {
        /** Cerrar el servidor de manera controlada  */
        this._logger.Message(LoggerTypes.WARN, `El servidor procederá a cerrarse =>`);
        this._server.close(() => {
          this._logger.Message(LoggerTypes.WARN, `El servidor ha sido cerrado =>`);
          process.exit(1); // Salir del proceso con código de error
        });
      } else {
        /** Si no hay servidor, simplemente terminamos el proceso */ 
        this._logger.Message(LoggerTypes.WARN, `Cerrando Proceso =>`);
        process.exit(1);
      }
    })
  }

  /** Este evento se ejecuta si alguna promesa es rechazada y no fue manejada con un catch */
  private OnUnhandledRejection = () => {
    process.on('unhandledRejection', (reason: any, promise: any) => {
      const data = { reason, promise };
      this._logger.Error(LoggerTypes.FATAL, data)
    });
  }

  /** Método que da inicio al servidor web */
  public Start = () => {
    this._logger.Activity("START");

    // Eliminar listeners existentes para evitar duplicados
    process.removeAllListeners("uncaughtException");
    process.removeAllListeners("unhandledRejection");

    // Registrar eventos nuevamente
    this.OnUncaughtException();
    this.OnUnhandledRejection();

    // Cerrar el servidor si ya estaba iniciado
    if (this._server) {
      this._server.close(() => {
        this._logger.Message(LoggerTypes.WARN, "Servidor anterior cerrado.");
      });
    }

    // Iniciar el servidor
    this._server = this._app.Start((port: number) => {
      this._logger.Message(LoggerTypes.INFO, `El servidor está corriendo en el puerto ${port}`);
    });
  }
}

