/* eslint-disable @typescript-eslint/no-this-alias */

import ConfigurationSettings from "../../Configurations/ConfigurationSettings";
import IContainerManager from "../../Configurations/Interfaces/IContainerManager";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import ApplicationException from "../../ErrorHandling/ApplicationException";
import { HttpStatusCode, HttpStatusName } from "../../Utils/HttpCodes";
import { NO_REQUEST_ID, ROOT_CONTAINER_KEY } from "../../Utils/const";
import { Environment } from "../../Utils/Environment";
import { ConnectionEntity } from "./Types/DatabaseType";



interface DatabaseInstanceManagerDependencies {
	configurationSettings: ConfigurationSettings;
	containerManager: IContainerManager;
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

	/** Ajuste de configuración */
	private readonly _configurationSettings: ConfigurationSettings;

	/** Registro de instancias de base de datos. 
	 * Recordar diferenciar entre el key que se guarda en el map y 
	 * el key que se guarda en el contenedor de dependencias.
	 * Este registro almacena un listado de las estrategias de conección utilizadas,
	 * la estrategia de conexión utilizada tiene acceso a la instancia de la base de datos
	 * y mediante la estrategia utilizada podemos cerrar u abrir conexiones */
	private _instanceRegistry = new Map<string, ConnectionEntity>();

	/** Contiene el dato de la identidad del container que 
	 * se recibió cuando se creó la instancia */
	public containerIdentity: string = "";

	constructor(deps: DatabaseInstanceManagerDependencies) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "MANAGER",
			entityName: "DatabaseInstanceManager"
		});

		this._configurationSettings = deps.configurationSettings;

		this.containerIdentity = deps.containerManager._identifier;

		/** Registramos la instancia */
		this.RegisterInstanceManager(deps.containerManager);
	}


	/** Registramos el DatabaseInstanceManager en el contenedor de dependencias y lo seteamos */
	public RegisterInstanceManager(rootContainer: IContainerManager) {
		try {
			this._logger.Activity("RegisterManager");

			/** Si el contenedor actual es root, entonces retornamos */
			if (rootContainer._identifier !== ROOT_CONTAINER_KEY) {
				this._logger.Message("ERROR", `
					Error: El contenedor ingresado no es el root ${rootContainer._identifier}, 
					la instancia no será registrada.
				`);

				return;
			}

			/** Obtenemos la instancia actual de la clase */
			const instance = this;

			/** registramos la instancia en el contenedor de dependencias */
			rootContainer.AddInstance<DatabaseInstanceManager>("databaseInstanceManager", instance);

			/** Logueamos la operación */
			this._logger.Message("INFO", `
				La instancia de DatabaseInstanceManager ha sido registrada 
				en el contenedor ${rootContainer._identifier}
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
	 * @param {IContainerManager} container - Contenedor de dependencias en el cual se insertará la instancia
	 
	 * @param {string} databaseInstanceName - Indica el nombre de la instancia de la 
	 * base de datos en el contenedor de dependencias
	 * 
	 * @param {string} strategyRegistryName - Indica el nombre de la instancia de la estrategia de 
	 * base de datos en el instanceRegistry aqui deberiamos poner el tenantKey como identificador
	 * o algún otro identificador en caso de que la aplicación no esté usando tenants
	 * 
	 * @param {IDatabaseConnectionStrategy<any, any>} strategyInstance - Instancia de la estrategia 
	 * utilizada que se va a almacenar en el registro de instancias 
	 * 
	 * @param {any} databaseInstance - Instancia de la base de datos ej: instancia de mongodb o kysely
	 * 
	 * @param {DatabaseType} - tipo de base de datos ej: ms_sql_database" | "postgre_sql_database" | "mongo_database 
	 * */
	public SetDatabaseInstance(
		container: IContainerManager,
		entity: ConnectionEntity,
		databaseInstance?: any,
	) {
		try {
			this._logger.Activity("SetDatabaseInstance");

			/** Validar que la instancia que se intenta agregar no esté ya registrada */
			if (this._instanceRegistry.has(entity.options.databaseRegistryName)) {
				this._logger.Message("WARN", `
					La instancia de la estrategia de conexión con la clave ${entity.options.databaseRegistryName} ya 
					está registrada en el registro de instancias | El container actual es ${container._identifier} |
					Tipo de base de datos: ${entity.options.databaseType}
				`);
				return;
			}

			/** Agregamos la instancia al registro */
			this._instanceRegistry.set(entity.options.databaseRegistryName, entity);

			/** Obtenemos la instancia de la base de datos y 
			 * la inyectamos en el contenedor de dependencias */
			const dbInstance = databaseInstance ?? entity.strategy!.GetInstance();

			/** Agregamos la instancia al container */
			container.AddInstance(entity.options.databaseContainerInstanceName, dbInstance);

			/** Agregamos el tipo de base de datos al contenedor de dependencias */
			container.AddValue(entity.options.databaseTypeContainerName, entity.options.databaseType);

			/** Logueamos  */
			this._logger.Message("INFO", `
				La instancia de la estrategia de conexión ${entity.options.databaseRegistryName} fue registrada exitosamente en 
				contenedor de instancias
				- STRATEGY INSTANCE CONTAINER NAME = ${entity.options.databaseRegistryName}
				- DATABASE INSTANCE DEPENDENCY CONTAINER NAME = ${entity.options.databaseContainerInstanceName}
				- DATABASE TYPE = ${entity.options.databaseType}
			`);
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
	public GetEntity(key: string): ConnectionEntity {
		try {
			this._logger.Activity("GetDatabaseInstance");

			const entity = this._instanceRegistry.get(key);

			/** Validar que la instancia que se intenta buscar esté ya registrada */
			if (!entity) {
				throw new ApplicationException(
					"GetDatabaseInstance",
					HttpStatusName.InternalServerError,
					`La instancia con el key ${key} no está registrada`,
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Retornamos la entidad de conexión la cual contiene 
			 * la estrategia de conexión */
			return entity;

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

	/** Valida si un key se encuentra registrado */
	public CheckInstance(key: string): boolean {
		try {
			this._logger.Activity("CheckInstance");

			/** Obtenemos el numero de las instancias registradas */
			const instanceNumber = this._instanceRegistry.size;

			/** En development mostramos los nombres de las instancias registradas */
			if (this._configurationSettings.environment === Environment.DEVELOPMENT) {
				const registeredInstances = [...this._instanceRegistry.keys()].join(", ");
				this._logger.Message("INFO", `Instancias actualmente registradas: [${instanceNumber}] =>`, registeredInstances);
			}
			else {
				this._logger.Message("INFO", `Instancias actualmente registradas: ${instanceNumber}`);
			}

			return this._instanceRegistry.has(key);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "CheckInstance", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new ApplicationException(
				"CheckInstance",
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

			const entity = this._instanceRegistry.get(key);

			/** Validar que la instancia que se intenta buscar esté ya registrada */
			if (!entity) {
				throw new ApplicationException(
					"DisconnectInstance",
					HttpStatusName.InternalServerError,
					`La instancia de la estrategia de conexión con el key ${key} no está registrada`,
					HttpStatusCode.InternalServerError,
					NO_REQUEST_ID,
					__filename,
				);
			}

			/** Nos desconectamos */
			await entity.strategy?.CloseConnection();

			/** Removemos el key del registro de instancias */
			this._instanceRegistry.delete(key);

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

	/** Permite desconectar todas las instancias de la base de datos 
	 * y limpia el registro de instancias */
	public async DisconnectAllInstances(): Promise<void> {
		try {
			this._logger.Activity("DisconnectAllInstances");

			this._logger.Message("INFO", `Instancias actualmente registradas`, ...this._instanceRegistry.keys());

			/** Nos desconectamos de todas las instancias registradas una por una */
			const promises = Array.from(this._instanceRegistry.entries()).map(
				async ([key, entity]) => {
					try {
						await entity.strategy?.CloseConnection();
						this._logger.Message("INFO", `Te has desconectado de la instancia ${key} exitosamente`);
					} catch (err) {
						this._logger.Message("ERROR", `Ha ocurrido un error al desconectar la instancia ${key}`, err);
					}
				}
			);

			await Promise.all(promises);
			this._instanceRegistry.clear();

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

}