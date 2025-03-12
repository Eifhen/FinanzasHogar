import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de Usuario Hogar*/
export default interface IUsuarioHogarSqlRepository extends ISqlGenericRepository<DataBase, "usuariosHogar", "id"> {

} 