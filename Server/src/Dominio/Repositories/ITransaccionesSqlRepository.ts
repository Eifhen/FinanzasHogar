import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";



/** Interfaz para repositorio de transacciones de Hogar*/
export default interface ITransaccionesSqlRepository extends ISqlGenericRepository<DataBase, "transacciones", "id"> {

} 