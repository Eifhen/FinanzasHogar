import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";






/** Interfaz para repositorio de categorias */
export default interface ICategoriasSqlRepository extends ISqlGenericRepository<DataBase, "categorias", "id_categoria"> {

} 