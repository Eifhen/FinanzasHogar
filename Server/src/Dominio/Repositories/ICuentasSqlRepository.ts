import { DataBase } from "../../Infraestructure/DataBase/DataBase";
import ISqlGenericRepository from "../../JFramework/External/DataBases/Interfaces/ISqlGenericRepository";






/** Interfaz para repositorio de cuentas */
export default interface ICuentasSqlRepository extends ISqlGenericRepository<DataBase, "cuentas", "id"> {

} 
