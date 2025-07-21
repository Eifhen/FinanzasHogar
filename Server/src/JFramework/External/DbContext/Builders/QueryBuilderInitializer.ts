import ApplicationContext from "../../../Configurations/ApplicationContext";
import { DatabaseQueryBuildException, InternalServerException, InvalidParameterException, NotImplementedException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { IQueryCompiler } from "../Compilers/Interfaces/IQueryCompiler";
import { AstParser } from "../Compilers/Parser/AstParser";
import { SqlQueryCompiler } from "../Compilers/SqlQueryCompiler";
import { IDataQueryBuilderInitializer, IDataQueryBuilder } from "./Interfaces/IDataQueryBuilder";
import { InitialStage } from "./Interfaces/IDataQueryBuilderStages";
import { MssqlQueryBuilder } from "./Strategys/MssqlQueryBuilder";
import PostgresQueryBuilder from "./Strategys/PostgresQueryBuilder";
import { QueryBuilderConfigurationOptions, QueryBuilderDependencies, QueryBuilderInitializerDependencies } from "./Types/Types";


export class QueryBuilderInitializer<DB> implements IDataQueryBuilderInitializer<DB> {

	/** Opciones de configuración del queryBuilder */
	private readonly _options: QueryBuilderConfigurationOptions<DB>;

	/** Compilador */
	private readonly _compiler: IQueryCompiler<DB, any, any>;

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	/** AstParser */
	private readonly _parser: AstParser;

	/** Fase inicial del query */
	private readonly _initialStage: IDataQueryBuilder<DB, any, any>;

	constructor(deps: QueryBuilderInitializerDependencies<DB>) {

		this._options = deps.options;
		this._applicationContext = deps.applicationContext;

		/** Agregamos el compiler */
		this._compiler = new SqlQueryCompiler({
			applicationContext: deps.applicationContext
		});

		/** Agregamos el parser */
		this._parser = new AstParser({
			applicationContext: deps.applicationContext
		});

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: "BUILDER",
			entityName: "MssqlQueryBuilderInitializer",
			applicationContext: deps.applicationContext
		});

		/** Seteamos el initialStage */
		this._initialStage = this.SetQueryBuilder({
			compiler: this._compiler,
			parser: this._parser,
			logger: this._logger,
			applicationContext: this._applicationContext,
			options: this._options
		});
	}

	/** Inicializa la estrategía queryBuilder de sql */
	private SetQueryBuilder(deps: QueryBuilderDependencies) : IDataQueryBuilder<DB, any, any> {
		try {	
			switch(this._options.databaseType){
				case "ms_sql_database": 
					return new MssqlQueryBuilder(deps);
				case "postgre_sql_database":
					return new PostgresQueryBuilder(deps);
				case "mongo_database":
					throw new NotImplementedException("SetQueryBuilder", this._applicationContext, __filename);
				default:
					throw new InvalidParameterException("SetQueryBuilder", "databaseType", this._applicationContext, __filename);
			}
		}
		catch(err:any){
			this._logger.Error("FATAL", "SetQueryBuilder", err);
			throw new InternalServerException("SetQueryBuilder", "internal-error", this._applicationContext, __filename);
		}
	}

	public Query<TB extends Extract<keyof DB, string>, TResult extends object = any>(table: TB): InitialStage<DB, TB, TResult> {
		try {
			this._logger.Activity("Query");
			this._initialStage.SetTable(table);
			return this._initialStage as InitialStage<DB, TB, TResult>;
		}
		catch (err: any) {
			this._logger.Error("FATAL", "Query", err);
			throw new DatabaseQueryBuildException(
				"Query",
				"Query",
				this._applicationContext,
				__filename,
				err
			);
		}
	}

}