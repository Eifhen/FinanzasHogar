import { Transaction } from "kysely";
import { IApplicationPromise } from "../../../Helpers/ApplicationPromise";
import SqlTransactionManager from "../Generic/SqlTransactionManager";
import ISqlGenericRepository from "./ISqlGenericRepository";


export default interface ISqlTransactionManager<DataBaseEntity extends object> {
  
  /** Método que da inicio a la transacción, recibe una promesa que recibe 
   * una instancia del transactionManager y el objeto de la transaccion*/
  Start<ReturnType = any>(
    action: (
      builder: SqlTransactionManager, 
      transaction: Transaction<DataBaseEntity>
    ) => Promise<ReturnType>
  ): IApplicationPromise<ReturnType>


  /** Setea los repositorios que se van a usar en la transacción */
  SetWorkingRepositorys (transaction: Transaction<DataBaseEntity>, repositorys: ISqlGenericRepository<any, any, any>[]) : Promise<void>
}