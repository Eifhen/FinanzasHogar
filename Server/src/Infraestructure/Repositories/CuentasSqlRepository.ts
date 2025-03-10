/* eslint-disable @typescript-eslint/no-unsafe-call */

import ICuentasSqlRepository from "../../Dominio/Repositories/ICuentasSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";




interface ICuentasRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad cuentas */
export default class CuentasSqlRepository extends SqlGenericRepositoryStrategy<"cuentas", "id"> implements ICuentasSqlRepository {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	constructor(deps: ICuentasRepositoryDependencies) {
		super(deps.database, "cuentas", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "CuentasSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}