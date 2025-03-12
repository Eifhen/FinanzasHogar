import { DataBase } from "../../Infraestructure/DataBase";
import ISqlGenericRepository from "../../JFramework/DataBases/Interfaces/ISqlGenericRepository";






/** Interfaz para repositorio de cuentas */
export default interface ICuentasSqlRepository extends ISqlGenericRepository<DataBase, "cuentas", "id"> {

} 
