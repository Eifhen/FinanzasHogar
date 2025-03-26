import { Kysely } from "kysely";
import { TenantTable } from "./Models/Tenants";
import { TenantDetailTable } from "./Models/TenantsDetail";
import { ProyectTable } from "./Models/Proyects";


/** Representa la base de datos de uso interno */
export interface InternalDatabase {
  
  /** No exponemos la tabla proyectos */
  proyects: ProyectTable,

  /** Tabla de tenants */
  tenants: TenantTable;
  
  /** Tabla de detalles de un tenant */
  tenantDetails: TenantDetailTable;
};


/** Tipo que representa una base de datos SQl de kysely */
export type InternalSQLDatabase = Kysely<InternalDatabase>;
