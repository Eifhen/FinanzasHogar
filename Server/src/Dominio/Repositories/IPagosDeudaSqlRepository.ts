import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de pagos deuda*/
export default interface IPagosDeudaSqlRepository extends ISqlGenericRepository<DataBase, "pagosDeuda", "id"> {

} 