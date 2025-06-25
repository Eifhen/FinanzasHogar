import { Kysely } from "kysely";
import { TenantTable } from "./Models/TenantsTable";
import { TenantDetailTable } from "./Models/TenantsDetailTable";
import { ProyectTable } from "./Models/ProyectsTable";
import { TenantConnectionsTable } from "./Models/TenantsConnectionsTable";
import TenantConnectionView from "./Models/Views/TenantConnectionView";


/** Representa la base de datos de uso interno */
export interface InternalDatabase {
  
  /** No exponemos la tabla proyectos */
  gj_proyects: ProyectTable,

  /** Tabla de tenants */
  gj_tenants: TenantTable;
  
  /** Tabla de detalles de un tenant */
  gj_tenant_details: TenantDetailTable;

  /** Tabla de configuración de conexión al tenant */
  gj_tenant_connections: TenantConnectionsTable;

  /** ------ VISTAS ------ */
  
  /** Vista que relanciona la tabla tenants con la tabla tenant_connections */
  gj_tenant_connection_view: TenantConnectionView;
};


/** Tipo que representa una base de datos SQl de kysely */
export type InternalSQLDatabase = Kysely<InternalDatabase>;
