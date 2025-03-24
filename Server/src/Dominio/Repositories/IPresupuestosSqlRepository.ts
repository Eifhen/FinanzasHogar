import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";





/** Interfaz para repositorio de presupuestos de Hogar*/
export default interface IPresupuestosSqlRepository extends ISqlGenericRepository<DataBase, "presupuestos", "id_presupuesto"> {

} 