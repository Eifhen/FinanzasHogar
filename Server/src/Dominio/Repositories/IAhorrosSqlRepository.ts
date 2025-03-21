import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";



/** Interfaz para repositorio de categorias */
export default interface IAhorrosSqlRepository extends ISqlGenericRepository<DataBase, "ahorros", "id"> {

} 