import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de presupuesto categoria de Hogar*/
export default interface IPresupuestoCategoriaSqlRepository extends ISqlGenericRepository<DataBase, "presupuestoCategoria", "id"> {

} 