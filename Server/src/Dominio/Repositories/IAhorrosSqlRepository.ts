import { Insertable, InsertResult, Selectable, Transaction, Updateable } from "kysely";
import { DataBase } from "../../Infraestructure/DataBase";
import IGenericRepository from "../../JFramework/DataBases/Interfaces/IGenericRepository";








/** Interfaz para repositorio de categorias */
export default interface IAhorrosSqlRepository extends IGenericRepository<
  DataBase,
  "ahorros", 
  "id", 
  Insertable<DataBase["ahorros"]>, // InsertType
  InsertResult, // InsertOutput
  Updateable<DataBase["ahorros"]>, // UpdateType
  number, // UpdateOutput
  number, // DeleteOutput
  Selectable<DataBase["ahorros"]>, // GeneralOutput
  Transaction<DataBase> // TransactionType
  > 
{

} 