import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de roles de Hogar*/
export default interface IRolesSqlRepository extends ISqlGenericRepository<DataBase, "roles", "id_rol"> {

} 