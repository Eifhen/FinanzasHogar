/* eslint-disable @typescript-eslint/no-unsafe-call */

import ITransaccionesSqlRepository from "../../Dominio/Repositories/ITransaccionesSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";


interface ITransaccionesRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Transacciones */
export default class TransaccionesSqlRepository extends SqlGenericRepositoryStrategy<"transacciones", "id"> implements ITransaccionesSqlRepository {


	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: ITransaccionesRepositoryDependencies){
		super(deps.database, "transacciones", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "TransaccionesSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}