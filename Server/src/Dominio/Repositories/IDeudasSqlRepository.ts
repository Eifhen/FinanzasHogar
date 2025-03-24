import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";







/** Interfaz para repositorio de deudas */
export default interface IDeudasSqlRepository extends ISqlGenericRepository<DataBase,"deudas", "id"> {

} 




