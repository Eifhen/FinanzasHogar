import { Insertable, InsertResult, Kysely, Selectable, Transaction, Updateable } from "kysely";
import ApplicationContext from "../../Context/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../../Helpers/ApplicationPromise";
import IPaginationArgs from "../../Helpers/Interfaces/IPaginationArgs";
import IPaginationResult from "../../Helpers/Interfaces/IPaginationResult";
import ILoggerManager from "../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Managers/LoggerManager";
import { ClassInstance } from "../../Utils/Types/CommonTypes";
import IGenericRepository from "../Interfaces/IGenericRepository";
import SqlGenericRepositoryStrategy from "../Strategies/SqlGenericRepositoryStrategy";
import { DatabaseType } from "../Types/DatabaseType";








export default class GenericRepository<
	DataBaseEntity extends object,
	TableName extends Extract<keyof DataBaseEntity, string>,
	PrimaryKey extends Extract<keyof DataBaseEntity[TableName], string>
> implements IGenericRepository<
	DataBaseEntity,
	TableName,
	PrimaryKey,
	any, // InsertType
	any, // InsertOutput
	any, // UpdateType
	any, // UpdateOutput
	any, // DeleteOutput
	any, // GeneralOutput
	any // TransactionType
> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Instancia de la base de datos */
	public _database: DataBaseEntity;

	/** Nombre de la tabla a trabajar */
	public _tableName: TableName;

	/** Primary Key de la entidad que se está trabajando */
	public _primaryKey: PrimaryKey;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;
	
	/** Manejador de promesas */
	private readonly _applicationPromise: ApplicationPromise;

	/** Estrategia de repositorio */
	private _repositoryStrategy?: IGenericRepository<
		DataBaseEntity, 
		TableName, 
		PrimaryKey, 	
		any, // InsertType
		any, // InsertOutput
		any, // UpdateType
		any, // UpdateOutput
		any, // DeleteOutput
		any, // GeneralOutput
		any // TransactionType>;
	>;

	constructor(
		database: DataBaseEntity,
		tableName: TableName,
		primaryKey: PrimaryKey,
		applicationContext: ApplicationContext
	) {
		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "REPOSITORY",
			entityName: "GenericRepository"
		});

		this._database = database;
		this._tableName = tableName;
		this._primaryKey = primaryKey;
		this._applicationContext = applicationContext;
		this._applicationPromise = new ApplicationPromise(this._applicationContext);

		/** Seteamos la estrategia de repositorio */
		this.SetRepositoryStrategy();
	}

	/** Permite setear el repositorio genérico con el que se va atrabajar */
	private SetRepositoryStrategy(): void {
		this._logger.Activity("SetRepositoryStrategy");

		switch (this._applicationContext.settings.databaseConnectionData.type) {
			case DatabaseType.ms_sql_database: {
				this._repositoryStrategy = new SqlGenericRepositoryStrategy<
					DataBaseEntity, 
					TableName, 
					PrimaryKey
				>(
					this._database as Kysely<DataBaseEntity>,
					this._tableName,
					this._primaryKey,
					this._applicationContext
				);

				break;
			}
			case DatabaseType.mongo_database:
				throw new Error("Estrategía de repositorio No implementada");
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

	public async Delete(id: DataBaseEntity[TableName][PrimaryKey]): IApplicationPromise<any> {
		throw new Error("Method not implemented.");
	}

	public async Paginate(params: IPaginationArgs, filter?: Partial<DataBaseEntity[TableName]>): IApplicationPromise<IPaginationResult<DataBaseEntity[TableName]>> {
		throw new Error("Method not implemented.");
	}

	public async SetTransaction(transaction: ClassInstance<DataBaseEntity>): Promise<void> {
		throw new Error("Method not implemented.");
	}

}