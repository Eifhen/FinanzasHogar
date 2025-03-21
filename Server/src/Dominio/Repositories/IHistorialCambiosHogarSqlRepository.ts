import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";








/** Interfaz para repositorio de historial cambios hogar */
export default interface IHistorialCambiosHogarSqlRepository extends ISqlGenericRepository<DataBase, "historialCambiosHogar", "id_historial"> {

} 