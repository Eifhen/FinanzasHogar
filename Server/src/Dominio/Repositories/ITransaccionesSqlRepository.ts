import ISqlGenericRepository from "../../Infraestructure/Repositories/Generic/Interfaces/ISqlGenericRepository";


/** Interfaz para repositorio de transacciones de Hogar*/
export default interface ITransaccionesSqlRepository extends ISqlGenericRepository<"transacciones", "id"> {

} 