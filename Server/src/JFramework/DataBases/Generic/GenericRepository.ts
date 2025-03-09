import ApplicationContext from "../../Context/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../Helpers/Interfaces/IPaginationResult";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { ClassInstance } from "../../Utils/Types/CommonTypes";
import IGenericRepository from "../Interfaces/IGenericRepository";
import { DatabaseType } from "../Types/DatabaseType";








export default class GenericRepository<
	DataBaseEntity,
	TableName extends keyof DataBaseEntity,
	PrimaryKey extends keyof DataBaseEntity[TableName]
> implements IGenericRepository<DataBaseEntity, TableName, PrimaryKey> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Nombre de la tabla a trabajar */
	public _tableName: TableName;

	/** Primary Key de la entidad que se está trabajando */
	public _primaryKey: PrimaryKey;

	/** Estrategia de repositorio */
	private _repositoryStrategy?: IGenericRepository<DataBaseEntity, TableName, PrimaryKey>;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** Manejador de promesas */
	private readonly _applicationPromise: ApplicationPromise;

	constructor(
		tableName: TableName,
		primaryKey: PrimaryKey,
		applicationContext: ApplicationContext
	) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "REPOSITORY",
			entityName: "GenericRepository"
		});

		this._tableName = tableName;
		this._primaryKey = primaryKey;
		this._applicationContext = applicationContext;
		this._applicationPromise = new ApplicationPromise(this._applicationContext)
	}
	
	/** Permite setear el repositorio genérico con el que se va atrabajar */
	private SetRepositoryStrategy() {
		this._logger.Activity("SetRepositoryStrategy");

		/** Ejecutamos una estrategía de conección según el tipo de base de datos
		 * especificado en la configuración */
		switch (this._applicationContext.settings.databaseConnectionData.type) {
			case DatabaseType.ms_sql_database:
				this._repositoryStrategy = undefined;
				break;
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de conección No implementada");
		}
	}

	public async GetAll(): IApplicationPromise<DataBaseEntity[TableName][]> {
		throw new Error("Method not implemented.");
	}

	public async FindById(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<DataBaseEntity[TableName]> {
		throw new Error("Method not implemented.");
	}

	public async Create(record: DataBaseEntity[TableName]): IApplicationPromise<DataBaseEntity[TableName]> {
		throw new Error("Method not implemented.");
	}

	public async Update(id: DataBaseEntity[TableName][PrimaryKey], record: DataBaseEntity[TableName]): IApplicationPromise<DataBaseEntity[TableName]> {
		throw new Error("Method not implemented.");
	}

	public async Delete(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<number> {
		throw new Error("Method not implemented.");
	}

	public async Paginate(params: IPaginationArgs, filter?: Partial<DataBaseEntity[TableName]>): IApplicationPromise<IPaginationResult<DataBaseEntity[TableName]>> {
		throw new Error("Method not implemented.");
	}

	public async SetTransaction(transaction: ClassInstance<DataBaseEntity>): Promise<void> {
		throw new Error("Method not implemented.");
	}

}