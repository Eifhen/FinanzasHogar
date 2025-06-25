import ISqlGenericRepository from "../../../../External/DataBases/Interfaces/ISqlGenericRepository";
import { InternalDatabase } from "../../InternalDatabase";
import TenantConnectionView from "../../Models/Views/TenantConnectionView";


export default interface ITenantConnectionsInternalRepository 
extends ISqlGenericRepository<InternalDatabase, "gj_tenant_connections", "id"> {


  /** Obtiene la vista tenant_connection_view filtrando por el key del tenant */
  GetTenantConnectionViewByKey(tenantKey: string) : Promise<TenantConnectionView>;

}