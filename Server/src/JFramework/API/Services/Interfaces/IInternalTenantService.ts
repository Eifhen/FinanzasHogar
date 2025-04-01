import { DatabaseConnectionData } from "../../../Configurations/Types/IConfigurationSettings";
import { SelectTenants } from "../../DataAccess/Models/Tenants";
import { SelectTenantDetails } from "../../DataAccess/Models/TenantsDetail";



export default interface IInternalTenantService {

  /** Obtiene un tenant según su proyectKey y su tenantCode */
  GetTenantByCode(tenantCode: string) : Promise<SelectTenants>;

  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByKey(tenantKey: string) : Promise<SelectTenants>;
  
  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByDomainName(domainName: string) : Promise<SelectTenants>;

  /** Obtiene el detalle de un tenant según su tenantKey */
  GetTenantDetailsByTenantKey(tenantKey: string) : Promise<SelectTenantDetails>;

  /** Obtienes los datos de conexión según el tenant */
  GetTenantConnectionConfig(tenant: SelectTenants, details: SelectTenantDetails) : DatabaseConnectionData
}