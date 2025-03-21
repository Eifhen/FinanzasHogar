import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de metas */
export default interface IMetasSqlRepository extends ISqlGenericRepository<DataBase, "metas", "id"> {

} 