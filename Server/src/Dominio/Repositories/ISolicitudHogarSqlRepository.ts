import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";






/** Interfaz para repositorio de transacciones de Hogar*/
export default interface ISolicitudHogarSqlRepository extends ISqlGenericRepository<DataBase, "solicitudHogar", "id_solicitud"> {

} 