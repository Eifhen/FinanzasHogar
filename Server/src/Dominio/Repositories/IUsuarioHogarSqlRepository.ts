import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de Usuario Hogar*/
export default interface IUsuarioHogarSqlRepository extends ISqlGenericRepository<DataBase, "usuariosHogar", "id"> {

} 