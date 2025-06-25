/* eslint-disable @typescript-eslint/no-this-alias */

import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { HttpStatusCode, HttpStatusName } from "../../Utils/HttpCodes";
import { NO_REQUEST_ID } from "../../Utils/const";
import IDatabaseConnectionStrategy from "./Interfaces/IDatabaseConnectionStrategy";



interface DatabaseInstanceManagerDependencies {
	configurationSettings: ConfigurationSettings;
}


/** Clase que nos permite almacenar una instancia de base de datos 
 * en memoria según los tenants se vayan conectando, la idea es que 
 * todas las conexiones creadas deben pasar por aqui. 
 * Esta clase se encarga de la conexión y desconexión a una determinada 
 * instancia de la base de datos. 
 * - Punto único de registro/inyección de pools.*/
export default class DatabaseInstanceManager {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Container scoped de la request en curso, 
	 * también puede referirse al container root, 
	 * dependiendo de donde esta clase es llamada*/
	private _container?: IContainerManager;

	/** Ajuste de configuración */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Registro de instancias de base de datos. 
	 * Recordar diferenciar entre el key que se guarda en el map y 
	 * el key que se guarda en el contenedor de dependencias.
	 * Este registro almacena un listado de las estrategias de conección utilizadas,
	 * la estrategia de conexión utilizada tiene acceso a la instancia de la base de datos
	 * y mediante la estrategia utilizada podemos cerrar u abrir conexiones */
	private instanceRegistry = new Map<string, IDatabaseConnectionStrategy<any, any>>();

	constructor(deps: DatabaseInstanceManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "DatabaseInstanceManager"
		});

		this._configurationSettings = deps.configurationSettings;
	}

	/** Setea el contenedor que se va a utilizar */
	public SetContainer(container: IContainerManager) {
		try {
			this._logger.Activity("SetScopedContainer");

			/** Seteamos el contenedor scoped */
			this._container = container;

			/** Logueamos la operación */
			this._logger.Message("INFO", `El contenedor ${container._identifier} Ha sido insertado`);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "SetScopedContainer", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"SetScopedContainer",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Registramos el DatabaseInstanceManager en el contenedor de dependencias y lo seteamos */
	public RegisterInstanceManager(container: IContainerManager){
		try {
			this._logger.Activity("RegisterManager");

			/** Seteamos el contenedor scoped */
			this._container = container;
			
			const instance = this;

			/** registramos el manejador de instancias en el contenedor de dependencias */
			this._container.AddInstance<DatabaseInstanceManager>("databaseInstanceManager", instance);

			/** Logueamos la operación */
			this._logger.Message("INFO", `
				La instancia de DatabaseInstanceManager ha sido registrada 
				en el contenedor ${container._identifier}
			`);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "SetScopedContainer", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"SetScopedContainer",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Setea la instancia de la base de datos al registro de instancias
	 * 
	 * @param {string} containerInstanceName - Indica el nombre de la instancia de la 
	 * base de datos en el contenedor de dependencias
	 * 
	 * @param {string} strategyRegistryName - Indica el nombre de la instancia de la estrategia de 
	 * base de datos en el instanceRegistry aqui deberiamos poner el tenantKey como identificador
	 * o algún otro identificador en caso de que la aplicación no esté usando tenants
	 * 
	 * @param {IDatabaseConnectionStrategy<any, any>} strategyInstance - Instancia de la estrategia 
	 * utilizada que se va a almacenar en el registro de instancias */
	public SetDatabaseInstance(
		containerInstanceName: string,
		strategyRegistryName: string,
		strategyInstance: IDatabaseConnectionStrategy<any, any>
	) {
		try {
			this._logger.Activity("SetDatabaseInstance");

			/** Validar que la instancia que se intenta agregar no esté ya registrada */
			if (this.instanceRegistry.has(strategyRegistryName)) {
				this._logger.Message("WARN", `
					La instancia con la clave ${strategyRegistryName} ya está registrada en el registro de instancias | 
					El container actual es ${this._container?._identifier}
				`);
				return;
			}

			/** Validamos el container */
			if(!this._container){
				throw new ApplicationException(
					"SetDatabaseInstance",
					HttpStatusName.InternalServerError,
					"Error, por el momento no hay un contenedor inicializado",
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Agregamos la instancia al registro */
			this.instanceRegistry.set(strategyRegistryName, strategyInstance);

			/** Obtenemos la instancia de la base de datos y la inyectamos en el contenedor de dependencias */
			const databaseInstance = strategyInstance.GetInstance();

			/** Agregamos la instancia al container */
			this._container?.AddInstance(containerInstanceName, databaseInstance);

			/** Logueamos  */
			this._logger.Message("INFO", `La instancia ${strategyRegistryName} fue registrada exitosamente`);

		}
		catch (err: any) {
			this._logger.Error("ERROR", "SetScopedContainer", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"SetDatabaseInstance",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Obtiene una instancia de la estrategia de base de datos mediante su key */
	public GetDatabaseInstance(key: string): any {
		try {
			this._logger.Activity("GetDatabaseInstance");

			const strategyInstance = this.instanceRegistry.get(key);

			/** Validar que la instancia que se intenta buscar esté ya registrada */
			if (!strategyInstance) {
				throw new ApplicationException(
					"GetDatabaseInstance",
					HttpStatusName.InternalServerError,
					`La instancia con el key ${key} no está registrada`,
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Obtenemos la instancia de base de datos de la estrategia de conexión */
			const databaseInstance = strategyInstance.GetInstance();

			/** Retornamos la instancia */
			return databaseInstance;

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetDatabaseInstance", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"GetDatabaseInstance",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Permite desconectar una instancia de la estrategia de base de datos según su key */
	public async DisconnectInstance(key: string): Promise<void> {
		try {
			this._logger.Activity("DisconnectInstance");

			const instance = this.instanceRegistry.get(key);

			/** Validar que la instancia que se intenta buscar esté ya registrada */
			if (!instance) {
				throw new ApplicationException(
					"DisconnectInstance",
					HttpStatusName.InternalServerError,
					`La instancia con el key ${key} no está registrada`,
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Nos desconectamos */
			await instance.CloseConnection();

			this._logger.Message("INFO", `Te has desconectado de la instancia ${key} exitosamente`);

		}
		catch (err: any) {
			this._logger.Error("ERROR", "DisconnectInstance", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"DisconnectInstance",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Permite desconectar todas las instancias de la base de datos según el key de la estrategía */
	public async DisconnectAllInstances(): Promise<void> {
		try {
			this._logger.Activity("DisconnectAllInstances");

			/** Nos desconectamos de todas las instancias registradas una por una */
			this.instanceRegistry.forEach((instance, key) => {
				instance.CloseConnection()
				.then(() => {
					this._logger.Message("INFO", `Te has desconectado de la instancia ${key} exitosamente`);
				})
				.catch(err => {
					this._logger.Message("ERROR", `Ha ocurrido un error al desconectar la instancia ${key}`, err);
				});
			});

		}
		catch (err: any) {
			this._logger.Error("ERROR", "DisconnectAllInstances", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"DisconnectAllInstances",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

	/** Permite limpiar el registro de estrategias de conexión */
	public async ClearRegistry(): Promise<void> {
		try {
			this._logger.Activity("ClearRegistry");

			/** Limpiamos el registro de instancias */
			this.instanceRegistry.clear();

			this._logger.Message("INFO", "El registro de instancias ha sido limpiado");
		}
		catch (err: any) {
			this._logger.Error("ERROR", "ClearRegistry", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"ClearRegistry",
				HttpStatusName.InternalServerError,
				err.message,
				HttpStatusCode.InternalServerError,
				NO_REQUEST_ID,
				__filename,
				err
			);
		}
	}

}