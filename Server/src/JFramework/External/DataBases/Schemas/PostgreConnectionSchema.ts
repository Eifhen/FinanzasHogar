import { SchemaDefinition } from "@tediousjs/connection-string";




/** Esquema de connección a MSSQL basado en MSSQL_SCHEMA de Tedious
 * ver https://github.com/tediousjs/connection-string/blob/master/src/schema/mssql-schema.ts
 * y ver https://www.npmjs.com/package/@tediousjs/connection-string */
export const postgresqlConnectionSchema: SchemaDefinition = {
	'host': {
		type: 'string',
		aliases: ['server', 'address'],
	},
	'port': {
		type: 'number',
		default: 5432,
	},
	'user id': {
		type: 'string',
		aliases: ['uid', 'user'],
	},
	'password': {
		type: 'string',
		aliases: ['pwd'],
	},
	'database': {
		type: 'string',
	},
	'connection timeout': {
		type: 'number',
		aliases: ['timeout'],
		default: 15,
	},
	'max pool size': {
		type: 'number',
		default: 10,
	},
	'min pool size': {
		type: 'number',
		default: 0,
	},
	'ssl': {
		type: 'boolean',
		default: false,
	},
};
