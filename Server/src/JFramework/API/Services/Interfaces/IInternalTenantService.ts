import { DatabaseConnectionData } from "../../../Configurations/Types/IConfigurationSettings";
import { SelectTenants } from "../../DataAccess/Models/TenantsTable";
import { SelectTenantConnection } from "../../DataAccess/Models/TenantsConnectionsTable";
import { SelectTenantDetails } from "../../DataAccess/Models/TenantsDetailTable";
import { SelectTenantConnectionView } from "../../DataAccess/Models/Views/TenantConnectionView";



export default interface IInternalTenantService {

  /** Obtiene un tenant según su proyectKey y su tenantCode */
  GetTenantByCode(tenantCode: string): Promise<SelectTenants>;

  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByKey(tenantKey: string): Promise<SelectTenants>;

  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByDomainName(domainName: string): Promise<SelectTenants>;

  /** Obtiene el detalle de un tenant según su tenantKey */
  GetTenantDetailsByTenantKey(tenantKey: string): Promise<SelectTenantDetails>;
  
  /** Obtienes los datos de conexión según el tenant */
  GetTenantConnectionConfig(connectionData: SelectTenantConnectionView): Promise<DatabaseConnectionData>;

  /** Obtiene la configuración de conección del tenant (tenant_connections) */
  GetTenantConnectionByKey(tenantKey: string) : Promise<SelectTenantConnection>;

  /** Obtiene el tenant y su configuración de conexión, (tenant_connection_view) */
  GetTenantConnectionViewByKey(tenantKey: string) : Promise<SelectTenantConnectionView>;

  /** Encripta y Desencripta una cadena de conexión, 
  * este método es para fines de pruebas*/
  EncryptDecryptConnectionString(connectionString: string, decrypt: boolean): Promise<string>;
}