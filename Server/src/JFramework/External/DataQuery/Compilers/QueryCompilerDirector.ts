import ApplicationContext from "../../../Configurations/ApplicationContext";
import ApplicationException from "../../../ErrorHandling/ApplicationException";
import { InternalServerException } from "../../../ErrorHandling/Exceptions";
import ILoggerManager from "../../../Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../../Managers/LoggerManager";
import { DatabaseType } from "../../DataBases/Types/DatabaseType";
import { AstExpression } from "../Types/AstExpression";
import { CompilerResult, TableColumns } from "../Types/CompilerTypes";
import { IQueryCompiler } from "./Interfaces/IQueryCompiler";
import { PostgresQueryCompiler } from "./PostgresCompiler";


interface QueryCompilerDirectorDependencies {
	dbType: DatabaseType;
	applicationContext: ApplicationContext;
}


/** La idea es que esta clase nos ayude a seleccionar dinámicamente 
 * el tipo de compilador que vamos a utilizar para el query*/
export default class QueryCompilerDirector<DB, TB extends keyof DB> {

	/** Instancia del logger */
	private readonly _logger: ILoggerManager;

	/** Tipo de base de datos */
	private readonly dbType: DatabaseType;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: QueryCompilerDirectorDependencies) {

		/** Instanciamos el logger */
		this._logger = new LoggerManager({
			entityCategory: "STRATEGY DIRECTOR",
			entityName: "QueryCompilerDirector"
		});

		this.dbType = deps.dbType;
		this._applicationContext = deps.applicationContext;
	}


	/** Método que nos permite obtener un compilador dependiendo del tipo de base de datos */
	public GetCompiler(astExpresion: AstExpression): IQueryCompiler<TableColumns<DB, TB>, CompilerResult<DB, TB>> {
		try {
			this._logger.Activity("GetCompiler");

			switch (this.dbType) {
				case "postgre_sql_database":
					return new PostgresQueryCompiler<DB, TB>(astExpresion);

				case "ms_sql_database":
					return new PostgresQueryCompiler<DB, TB>(astExpresion);

				case "mongo_database":
					return new PostgresQueryCompiler<DB, TB>(astExpresion);

				default:
					throw new InternalServerException(
						"GetCompiler",
						"internal-error",
						this._applicationContext,
						__filename
					);
			}
		}
		catch (err: any) {
			this._logger.Error("FATAL", "GetCompiler", err);

			if (err instanceof ApplicationException) {
				throw err;
			}

			throw new InternalServerException(
				"GetCompiler",
				"internal-error",
				this._applicationContext,
				__filename
			);
		}
	}
}