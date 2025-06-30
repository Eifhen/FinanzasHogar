import SchemaProperty from "../../../Helpers/Decorators/SchemaProperty";
import EntitySchema from "../../../Helpers/DTOs/Data/EntitySchema";
import { z } from "zod";
import { EstadosTenant } from "../../../Utils/estados";
import { DatabaseType } from "../../../External/DataBases/Types/DatabaseType";
import { DEFAULT_CONNECTION_POOL_SIZE, DEFAULT_DATABASE_TIMEOUT } from "../../../Utils/const";
import { CreateTenants } from "../Models/TenantsTable";
import { CreateTenantConnection } from "../Models/TenantsConnectionsTable";
import { CreateTenantDetails } from "../Models/TenantsDetailTable";




/** DTO para manejo de tenant */
export default class TenantDTO extends EntitySchema {

	/** Clave primeria de la tabla de tenants */
	@SchemaProperty(z.bigint().optional())
	public id?: bigint;

	/** Clave de proyecto */
	@SchemaProperty(z.string().nonempty().uuid())
	public proyectKey: string = "";

	/** Identificador key (uuid) del tenant */
	@SchemaProperty(z.string().nonempty().uuid())
	public tenantKey: string = "";

	/** Codigo del tenant */
	@SchemaProperty(z.string().nonempty())
	public tenantCode: string = "";

	/** Nombre del tenant */
	@SchemaProperty(z.string().nonempty())
	public name: string = "";

	/** Descripcion del tenant */
	@SchemaProperty(z.string())
	public description: string = "";

	/** Status del tenant */
	@SchemaProperty(z.number())
	public status: EstadosTenant = EstadosTenant.ACTIVO;

	/** Dominio del tenant */
	@SchemaProperty(z.string().nullable())
	public domain: string = "";

	/** Fecha de creacion */
	@SchemaProperty(z.preprocess((arg) => {
		if (typeof arg === "string" || arg instanceof Date) {
			return new Date(arg);
		}
		return arg;
	}, z.date()))
	public creation_date: Date = new Date();

	/** Parametros de estilo en formato jsonString */
	@SchemaProperty(z.string().nullable())
	public styleParameters: string = "";

	/** URL del logo del tenant */
	@SchemaProperty(z.string().url().nullable())
	public logoURL: string = "";

	/** Tipo de base de datos */
	@SchemaProperty(z.string().nullable())
	public databaseType: DatabaseType = "postgre_sql_database";

	/** Cadena de conexión asociada al tenant */
	@SchemaProperty(z.string().nullable())
	public connectionString: string = "";

	/** Tiempo de espera de conexión cuando ocurre algún error */
	@SchemaProperty(z.number().nullable())
	public connectionTimeOut: number = DEFAULT_DATABASE_TIMEOUT;

	/** Tamaño minimo del connectionPool */
	@SchemaProperty(z.number().nullable())
	public poolMinSize: number = DEFAULT_CONNECTION_POOL_SIZE;

	/** Tamaño máximo del connectionPool */
	@SchemaProperty(z.number().nullable())
	public poolMaxSize: number = DEFAULT_CONNECTION_POOL_SIZE;


	/** Convierte el TenantDTO a un objeto para la tabla tenant */
	public static toTenantModel(tenant: TenantDTO): CreateTenants {
		return {
			id: tenant.id,
			proyect_key: tenant.proyectKey,
			tenant_key: tenant.tenantKey,
			tenant_code: tenant.tenantCode,
			name: tenant.name,
			description: tenant.description,
			status: tenant.status,
			domain: tenant.domain,
			creation_date: tenant.creation_date
		}
	}

	/** Convierte los datos del TenantDTO a un objeto para la tabla tenantConnections */
	public static toTenantConnectionModel(tenant: TenantDTO) : CreateTenantConnection {
		return {
			tenant_key: tenant.tenantKey,
			database_type: tenant.databaseType,
			connection: tenant.connectionString,
			timeout: tenant.connectionTimeOut,
			pool_min: tenant.poolMinSize,
			pool_max: tenant.poolMaxSize,
		}
	}

	/** Convierte los datos del TenantDTO a un objeto para la tabla tenantDetails */
	public static toTenantDetail(tenant: TenantDTO) : CreateTenantDetails {
		return {
			tenant_key: tenant.tenantKey,
			style_parameters: tenant.styleParameters,
			logo: tenant.logoURL
		}
	}

}