import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";







/** Interfaz para repositorio de deudas */
export default interface IDeudasSqlRepository extends ISqlGenericRepository<DataBase,"deudas", "id"> {

} 




