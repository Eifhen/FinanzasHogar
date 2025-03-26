import ISqlGenericRepository from "../../../../External/DataBases/Interfaces/ISqlGenericRepository";
import { InternalDatabase } from "../../InternalDatabase";





export default interface ITenantsInternalRepository extends ISqlGenericRepository<InternalDatabase, "tenants", "id"> {

}

