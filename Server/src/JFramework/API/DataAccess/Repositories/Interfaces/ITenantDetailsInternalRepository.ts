import ISqlGenericRepository from "../../../../External/DataBases/Interfaces/ISqlGenericRepository";
import { InternalDatabase } from "../../InternalDatabase";




export default interface ITenantDetailsInternalRepository extends ISqlGenericRepository<InternalDatabase, "tenantDetails", "id"> {

}