import { SchemaDefinition } from "@tediousjs/connection-string";


export interface CoerceTypeMap {
    string: string;
    number: number;
    boolean: boolean;
}

export type CoerceType = keyof CoerceTypeMap;

/** Este tipo es una copia del InferSchema de tedious/connection-string
 * ya que tedious no exporta este tipo, me vi en la obligación 
 * de crear una copia yo mismo */
export type InferSchema<T extends SchemaDefinition> = {
	 [K in keyof T]: T[K]['type'] extends CoerceType ? CoerceTypeMap[T[K]['type']] : string;
};

/** Esquema de connección a MSSQL basado en MSSQL_SCHEMA de Tedious
 * ver https://github.com/tediousjs/connection-string/blob/master/src/schema/mssql-schema.ts
 * y ver https://www.npmjs.com/package/@tediousjs/connection-string */
export const mssqlConnectionSchema: SchemaDefinition = {
	'application name': {
		type: 'string',
		aliases: ['app'],
	},
	'applicationintent': {
		type: 'string',
		default: 'ReadWrite',
	},
	'asynchronous processing': {
		type: 'boolean',
		default: false,
		aliases: ['Async'],
	},
	'attachdbfilename': {
		type: 'string',
		aliases: ['extended properties', 'initial file name'],
	},
	'authentication': {
		type: 'string',
	},
	'column encryption setting': {
		type: 'string',
	},
	'connection timeout': {
		type: 'number',
		aliases: ['connect timeout', 'timeout'],
		default: 15,
	},
	'connection lifetime': {
		type: 'number',
		aliases: ['load balance timeout'],
		default: 0,
	},
	'connectretrycount': {
		type: 'number',
		default: 1,
	},
	'connectretryinterval': {
		type: 'number',
		default: 10,
	},
	'context connection': {
		type: 'boolean',
		default: false,
	},
	'current language': {
		aliases: ['language'],
		type: 'string',
	},
	'data source': {
		aliases: ['addr', 'address', 'server', 'network address'],
		type: 'string',
	},
	'encrypt': {
		type: 'boolean',
		default: false,
	},
	'enlist': {
		type: 'boolean',
		default: true,
	},
	'failover partner': {
		type: 'string',
	},
	'initial catalog': {
		type: 'string',
		aliases: ['database'],
	},
	'integrated security': {
		type: 'boolean',
		aliases: ['trusted_connection'],
	},
	'max pool size': {
		type: 'number',
		default: 100,
	},
	'min pool size': {
		type: 'number',
		default: 0,
	},
	'multipleactiveresultsets': {
		type: 'boolean',
		default: false,
	},
	'multisubnetfailover': {
		type: 'boolean',
		default: false,
	},
	'network library': {
		type: 'string',
		aliases: ['network', 'net'],
	},
	'packet size': {
		type: 'number',
		default: 8000,
	},
	'password': {
		type: 'string',
		aliases: ['pwd'],
	},
	'persist security info': {
		type: 'boolean',
		aliases: ['persistsecurityinfo'],
		default: false,
	},
	'poolblockingperiod': {
		type: 'number',
		default: 0,
	},
	'pooling': {
		type: 'boolean',
		default: true,
	},
	'replication': {
		type: 'boolean',
		default: false,
	},
	'transaction binding': {
		type: 'string',
		default: 'Implicit Unbind',
	},
	'transparentnetworkipresolution': {
		type: 'boolean',
		default: true,
	},
	'trustservercertificate': {
		type: 'boolean',
		default: false,
	},
	'type system version': {
		type: 'string',
	},
	'user id': {
		type: 'string',
		aliases: ['uid'],
	},
	'user instance': {
		type: 'boolean',
		default: false,
	},
	'workstation id': {
		type: 'string',
		aliases: ['wsid'],
	},
};