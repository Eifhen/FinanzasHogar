import ISqlGenericRepository from "../../Infraestructure/Repositories/Generic/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de notificaciones*/
export default interface INotificacionesSqlRepository extends ISqlGenericRepository<"notificaciones", "id_notificacion"> {

} 