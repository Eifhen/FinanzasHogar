import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de hogares */
export default interface IHogaresSqlRepository extends ISqlGenericRepository<DataBase, "hogares", "id_hogar"> {

} 