import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de notificaciones*/
export default interface INotificacionesSqlRepository extends ISqlGenericRepository<DataBase, "notificaciones", "id_notificacion"> {

} 