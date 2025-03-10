/* eslint-disable @typescript-eslint/no-unsafe-call */

import IUsuarioHogarSqlRepository from "../../Dominio/Repositories/IUsuarioHogarSqlRepository";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import ILoggerManager, { LoggEntityCategorys } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { ApplicationSQLDatabase } from "../DataBase";
import SqlGenericRepositoryStrategy from "../../JFramework/DataBases/Strategies/SqlGenericRepositoryStrategy";


interface IUsuarioHogarRepositoryDependencies {
	database: ApplicationSQLDatabase;
	applicationContext: ApplicationContext;
}

/** Repositorio para la entidad Usuarios */
export default class UsuarioHogarSqlRepository extends SqlGenericRepositoryStrategy<"usuariosHogar", "id"> implements IUsuarioHogarSqlRepository {


	/** Instancia del logger */
	private _logger: ILoggerManager;
		
	constructor(deps: IUsuarioHogarRepositoryDependencies){
		super(deps.database, "usuariosHogar", "id", deps.applicationContext);

		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.REPOSITORY,
			entityName: "UsuarioHogarSqlRepository",
			applicationContext: deps.applicationContext
		});
	}

}