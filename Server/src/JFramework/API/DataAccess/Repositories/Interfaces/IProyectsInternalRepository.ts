import ISqlGenericRepository from "../../../../External/DataBases/Interfaces/ISqlGenericRepository";
import { InternalDatabase } from "../../InternalDatabase";




export default interface IProyectsInternalRepository extends ISqlGenericRepository<InternalDatabase, "proyects", "id"> {

}