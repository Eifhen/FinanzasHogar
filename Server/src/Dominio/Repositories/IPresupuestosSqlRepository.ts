import ISqlGenericRepository from "../../Infraestructure/Repositories/Generic/Interfaces/ISqlGenericRepository";




/** Interfaz para repositorio de presupuestos de Hogar*/
export default interface IPresupuestosSqlRepository extends ISqlGenericRepository<"presupuestos", "id_presupuesto"> {

} 