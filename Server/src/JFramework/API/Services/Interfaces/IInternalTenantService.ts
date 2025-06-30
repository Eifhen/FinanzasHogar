import { DatabaseConnectionData } from "../../../Configurations/Types/IConfigurationSettings";
import { SelectTenants } from "../../DataAccess/Models/TenantsTable";
import { SelectTenantConnection } from "../../DataAccess/Models/TenantsConnectionsTable";
import { SelectTenantDetails } from "../../DataAccess/Models/TenantsDetailTable";
import { SelectTenantConnectionView } from "../../DataAccess/Models/Views/TenantConnectionView";
import { ApiResponse } from "../../../Helpers/ApplicationResponse";
import TenantDTO from "../../DataAccess/DTOs/TenantDTO";




export default interface IInternalTenantService {

  /** Obtiene todos los tenants */
  GetAllTenants(): ApiResponse<SelectTenants[]>;

  /** Obtiene un tenant según su proyectKey y su tenantCode */
  GetTenantByCode(tenantCode: string): ApiResponse<SelectTenants>;

  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByKey(tenantKey: string): ApiResponse<SelectTenants>;

  /** Obtiene un tenant según su proyectKey y su tenantKey */
  GetTenantByDomainName(domainName: string): ApiResponse<SelectTenants>;

  /** Obtiene el detalle de un tenant según su tenantKey */
  GetTenantDetailsByTenantKey(tenantKey: string): ApiResponse<SelectTenantDetails>; 
  
  /** Obtienes los datos de conexión según el tenant */
  GetTenantConnectionConfig(connectionData: SelectTenantConnectionView): Promise<DatabaseConnectionData>;

  /** Obtiene la configuración de conección del tenant (tenant_connections) */
  GetTenantConnectionByKey(tenantKey: string) : ApiResponse<SelectTenantConnection>;

  /** Obtiene el tenant y su configuración de conexión, (tenant_connection_view) */
  GetTenantConnectionViewByKey(tenantKey: string) : ApiResponse<SelectTenantConnectionView>;

  /** Permite registrar un tenant en la base de datos */
  AddTenant(tenant: TenantDTO) : ApiResponse<TenantDTO>;

  /** Permite eliminar un tenant en base a su clave */
  DeleteTenantByKey(tenantKey: string) : ApiResponse<boolean>;

  /** Permite actualizar un tenant */
  UpdateTenant(tenant: TenantDTO) : ApiResponse<TenantDTO>;

  /** Encripta y Desencripta una cadena de conexión, 
  * este método es para fines de pruebas*/
  EncryptDecryptConnectionString(connectionString: string, decrypt: boolean): ApiResponse<string>;
}