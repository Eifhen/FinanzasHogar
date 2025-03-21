import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de usuarios */
export default interface IUsuariosSqlRepository extends ISqlGenericRepository<DataBase, "usuarios", "id_usuario"> {

} 