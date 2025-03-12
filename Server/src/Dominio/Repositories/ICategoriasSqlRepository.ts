import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";






/** Interfaz para repositorio de categorias */
export default interface ICategoriasSqlRepository extends ISqlGenericRepository<DataBase, "categorias", "id_categoria"> {

} 