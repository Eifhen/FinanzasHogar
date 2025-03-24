import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de notificaciones*/
export default interface INotificacionesSqlRepository extends ISqlGenericRepository<DataBase, "notificaciones", "id_notificacion"> {

} 