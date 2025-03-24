import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de pagos deuda*/
export default interface IPagosDeudaSqlRepository extends ISqlGenericRepository<DataBase, "pagosDeuda", "id"> {

} 