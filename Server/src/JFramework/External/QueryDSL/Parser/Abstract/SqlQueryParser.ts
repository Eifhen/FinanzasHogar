


import { QueryParser } from './QueryParser';





export abstract class SqlQueryParser<T extends string> extends QueryParser<T, string> {
	protected escapeIdentifier(field: string): string {
		return `"${field}"`; // puede ser sobreescrito en subclases
	}
}
