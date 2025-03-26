import { Kysely } from "kysely";
import { TenantTable } from "./Models/Tenants";
import { TenantDetailTable } from "./Models/TenantsDetail";
import { ProyectTable } from "./Models/Proyects";


/** Representa la base de datos de uso interno */
export interface InternalDatabase {
  
  /** No exponemos la tabla proyectos */
  gj_proyects: ProyectTable,

  /** Tabla de tenants */
  gj_tenants: TenantTable;
  
  /** Tabla de detalles de un tenant */
  gj_tenant_details: TenantDetailTable;
};


/** Tipo que representa una base de datos SQl de kysely */
export type InternalSQLDatabase = Kysely<InternalDatabase>;
