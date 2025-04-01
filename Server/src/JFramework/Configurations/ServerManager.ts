import { Application } from "express";
import IStartup, { IStartupDependencies } from "./Interfaces/IStartup"
import { Server } from "http";
import express from 'express';
import LoggerManager from "../Managers/LoggerManager";
import ILoggerManager from "../Managers/Interfaces/ILoggerManager";
import { EXIT_CODES } from "../Utils/exit_codes";
import ServiceManager, { IServiceManagerDependencies } from "./ServiceManager";
import IContainerManager from "./Interfaces/IContainerManager";
import ContainerManager from "./ContainerManager";
import ServerConfigurationManager, { IServerConfigurationDependencies } from "./ServerConfigurationManager";
import IInternalServiceManager from "./Interfaces/IInternalServiceManager";
import { InternalServiceManager, InternalServiceManagerDependencies } from "./InternalServiceManager";
import IServiceManager from "./Interfaces/IServiceManager";
import ConfigurationSettings from "../Configurations/ConfigurationSettings";
import { ClassConstructor } from "../Utils/Types/CommonTypes";
import IServerConfigurationManager from "./Interfaces/IServerConfigurationManager";


interface ServerManagerDependencies {

	/** Recibe un constructor de la interfaz IStartup */
	startup: ClassConstructor<IStartup>;
}

export default class ServerManager {

	/** Objeto server, este objeto nos sirve para manipular nuestro servidor*/
	private _server?: Server;

	/** Instancia de express */
	private readonly _app: Application;

	/** Instancia del startup */
	private readonly _startup: IStartup;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Manejador de contenedores */
	private readonly _containerManager: IContainerManager;

	/** Manejador de servicios internos */
	private readonly _internalServiceManager: IInternalServiceManager;

	/** Manejador de servicios */
	private readonly _serviceManager: IServiceManager;

	/**  Manejador de configuración del servidor */
	private readonly _serverConfigurationManager: IServerConfigurationManager;

	/** Objeto de configuración del sistema */
	private readonly _configurationSettings: ConfigurationSettings;


	constructor(deps: ServerManagerDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "CONFIGURATION",
			entityName: "ApplicationServer"
		});

		/** Instanciamos la app de express */
		this._app = express();

		/** Agregamos el objeto de configuración */
		this._configurationSettings = new ConfigurationSettings();

		/** Agregamos el manejador de contenedores */
		this._containerManager = new ContainerManager();

		// Instanciamos el manejador de servicios
		this._serviceManager = new ServiceManager({
			app: this._app,
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		} as IServiceManagerDependencies);

		/** Instanciamos la configuración del server */
		this._serverConfigurationManager = new ServerConfigurationManager({
			app: this._app,
			serviceManager: this._serviceManager,
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings,
		} as IServerConfigurationDependencies);

		/** Agregamos el manejador de servicios internos */
		this._internalServiceManager = new InternalServiceManager({
			app: this._app,
			serviceManager: this._serviceManager,
			containerManager: this._containerManager,
			configurationSettings: this._configurationSettings
		} as InternalServiceManagerDependencies);

		/** Instanciamos el Startup */
		this._startup = new deps.startup({
			configurationSettings: this._configurationSettings,
			serverConfigurationManager: this._serverConfigurationManager,
			serviceManager: this._serviceManager,
		} as IStartupDependencies);
	}

	/** Este evento se ejecuta si algún error no fue manejado por la app */
	private OnUncaughtException() {
		process.on("uncaughtException", (err: Error) => {

			this._logger.Error("FATAL", "OnUncaughtException", {
				message: err.message,
				stack: err.stack
			});

			/** Se hace un cleanup de cualquier funcionalidad que se esté ejecutando  */
			this.CloseServer(EXIT_CODES.UNCAUGHT_FATAL_EXCEPTION).catch(err => {
				this._logger.Error("FATAL", "CloseServer", err);
			});
		})
	}

	/** Este evento se ejecuta si alguna promesa es rechazada y no fue manejada con un catch */
	private OnUnhandledRejection() {
		process.on('unhandledRejection', (reason: any, promise: any) => {
			// Obtener más detalles de la razón del rechazo
			let reasonDetails;
			if (reason instanceof Error) {
				reasonDetails = {
					...reason,
					message: reason.message,
					stack: reason.stack,
				};
			} else {
				reasonDetails = reason;
			}

			// Loggear la razón y la promesa
			const data = {
				reason: reasonDetails,
				promise
			};

			this._logger.Error("FATAL", "OnUnhandledRejection", data);

			this.CloseServer(EXIT_CODES.UNCAUGHT_FATAL_EXCEPTION).catch(err => {
				this._logger.Error("FATAL", "CloseServer", err);
			});
		});
	}

	/** Este se ejecuta cuando ocurre una señal de terminación */
	private OnTerminationSignal() {

		/** SIGINT (Signal Interrupt)
		 * Se envía cuando el usuario interrumpe el proceso de forma manual 
		 * (por ejemplo, presionando Ctrl+C en la terminal). */
		process.on("SIGINT", () => {
			this.CloseServer(EXIT_CODES.SUCCESS).catch(err => {
				this._logger.Error("FATAL", "CloseServer", err);
			});
		});

		/** SIGTERM (Signal Terminate):
		 * Es una señal de terminación "suave" enviada por el sistema o por 
		 * otros procesos (por ejemplo, mediante un comando kill o en 
		 * entornos de orquestación de contenedores). */
		process.on("SIGTERM", () => {
			this.CloseServer(EXIT_CODES.SIGTERM_EXIT).catch(err => {
				this._logger.Error("FATAL", "CloseServer", err);
			});
		});
	}

	/** Maneja los eventos de termino de proceso */
	private InitializeProcessListeners() {
		/** Eliminar listeners existentes para evitar duplicados */
		process.removeAllListeners("uncaughtException");
		process.removeAllListeners("unhandledRejection");
		process.removeAllListeners("SIGINT");
		process.removeAllListeners("SIGTERM");

		/** Registrar eventos nuevamente */
		this.OnUncaughtException();
		this.OnUnhandledRejection();
		this.OnTerminationSignal();
	}

	/** Cierra el servidor */
	private Close(exitCode: EXIT_CODES) {
		if (this._server) {
			/** Cerrar el servidor de manera controlada  */
			this._logger.Message("WARN", `El servidor procederá a cerrarse =>`);
			this._server.close(() => {
				this._logger.Message("WARN", `El servidor ha sido cerrado =>`);
				process.exit(exitCode); // Salir del proceso con código de error
			});
		} else {
			/** Si no hay servidor, simplemente terminamos el proceso */
			this._logger.Message("WARN", `Cerrando Proceso =>`);
			process.exit(exitCode);
		}
	}

	/** Permite cerrar el servidor */
	private async CloseServer(exitCode: EXIT_CODES) {
		try {
			this._logger.Activity("CloseServer");

			/** Cerramos todos los servicios internos que realizan conecciones */
			await this._internalServiceManager.DisconnectConnectionServices();

			/** Cerramos el servidor */
			this.Close(exitCode);
		}
		catch (err: any) {
			this._logger.Error("FATAL", "CloseServer", err);

			/** Cerramos el servidor */
			this.Close(exitCode);
		}
	}

	/** Este método da inicio al servidor y controla sus operaciones */
	private async OnServerStart() {
		try {
			this._logger.Activity("OnServerStart");

			/** Maneja los eventos que terminan el proceso */
			this.InitializeProcessListeners();

			/** Agregamos la configuración inicial */
			await this._startup.AddConfiguration();

			/** Agregamos todos los servicios que realizan conecciones */
			await this._internalServiceManager.RunConnectionServices();

			/** Agregamos la configuración de seguridad interna */
			await this._internalServiceManager.AddInternalSecurity();

			/** Se agregan servicios internos */
			await this._internalServiceManager.AddInternalStrategies();
			await this._internalServiceManager.AddInternalManagers();
			await this._internalServiceManager.AddInternalRepositories();
			await this._internalServiceManager.AddInternalServices();

			/** Agregamos la configuración de seguridad del negocio */
			await this._startup.AddSecurityConfiguration();

			/** Agregamos los middleware del negocio */
			await this._startup.AddBusinessMiddlewares();

			/** A partir de aquí ya no se agregan middlewares, 
			 * simplemente se llena el contenedor de dependencias */
			await this._startup.AddBusinessRepositories();
			await this._startup.AddBusinessServices();
			
			/** Se agregan endpoints de uso interno */
			await this._internalServiceManager.AddInternalEndpoints();

			/** Se agrega middleware interno para manejo de errores */
			await this._internalServiceManager.AddExceptionManager();

			/** Iniciamos el servidor */
			this._server = this._app.listen(this._configurationSettings.port, () => {
				this._logger.Message("INFO", `El servidor está corriendo en el puerto ${this._configurationSettings.port}`);
			});

		} catch (err: any) {
			this._logger.Error("FATAL", "OnServerStart", err);
			throw err;
		}
	}

	/** Da inicio al servidor */
	public Start() {
		this.OnServerStart()
		.catch(err => {
			/** Si ocurre un error fatal en el servidor, lo cerramos */
			this._logger.Error("FATAL", "OnServerStart", err);

			/** Cerramos el servidor */
			this.CloseServer(EXIT_CODES.FATAL_ERROR).catch(err => {
				/** Si ocurre un error cerrando el servidor */
				this._logger.Error("FATAL", "CloseServer", err);
			});
		});
	}
}