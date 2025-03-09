import ISqlGenericRepository from "../../Infraestructure/Repositories/Generic/ISqlGenericRepository";






/** Interfaz para repositorio de usuarios */
export default interface IUsuariosSqlRepository extends ISqlGenericRepository<"usuarios", "id_usuario"> {

} 