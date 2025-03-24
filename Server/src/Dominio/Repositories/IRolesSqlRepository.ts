import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de roles de Hogar*/
export default interface IRolesSqlRepository extends ISqlGenericRepository<DataBase, "roles", "id_rol"> {

} 