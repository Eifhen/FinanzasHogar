import ISqlGenericRepository from "../../Infraestructure/Repositories/Generic/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de roles de Hogar*/
export default interface IRolesSqlRepository extends ISqlGenericRepository<"roles", "id_rol"> {

} 