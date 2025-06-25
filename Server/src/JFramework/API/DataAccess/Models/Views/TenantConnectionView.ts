import { Selectable } from "kysely";
import { DatabaseType } from "../../../../External/DataBases/Types/DatabaseType";
import { EstadosTenant } from "../../../../Utils/estados";






export default interface TenantConnectionView {
  /** Id secuencial del tenant */
  tenant_id: number;

  /** Clave del proyecto al que pertenece este tenant */
  proyect_key: string;

  /** Clave unica del tenant */
  tenant_key: string;

  /** Código único del tenant, este código se utiliza en el formulario de 
   * login para luego con él obtener el tenant_key */
  tenant_code: string;

  /** Nombre del tenant */
  name: string;

  /** Descripción del tenant */
  description: string;

  /** Estado actual del tenant activo = 1; inactivo = 2 */
  status: EstadosTenant;

  /** Nombre del dominio del tenant */
  domain: string;

  /** Fecha de creación del tenant */
  creation_date: Date;

  /** Id del registro en la tabla tennant_connections */
  tenant_connection_id: number;

  /** Tipo de base de datos: sql o mongodb */
  database_type: DatabaseType;

  /** ConnectionString de la base de datos del tenant cifrada */
  connection: string;

  /** ConnectionTimeOut de la bsase de datos del tenant */
  timeout: number;

  /** Tamaño minimo del pool de conexiones */
  pool_min: number;

  /** Tamaño maximo del pool */
  pool_max: number;
}

/** Tipo para consultas de selección */
export type SelectTenantConnectionView = Selectable<TenantConnectionView>;