/* eslint-disable @typescript-eslint/no-unsafe-call */

import ISolicitudHogarSqlRepository from "../../Dominio/Repositories/ISolicitudHogarSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";




interface ISolicitudHogarRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Transacciones */
export default class SolicitudHogarSqlRepository extends SqlGenericRepositoryStrategy<"solicitudHogar", "id_solicitud"> implements ISolicitudHogarSqlRepository {


	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: ISolicitudHogarRepositoryDependencies){
		super(deps.database, "solicitudHogar", "id_solicitud", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "SolicitudHogarSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}


