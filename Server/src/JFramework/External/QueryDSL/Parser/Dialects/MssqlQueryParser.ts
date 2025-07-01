import { SqlQueryParser } from "../Abstract/SqlQueryParser";




export class MssqlQueryParser<T extends string> extends SqlQueryParser<T> {
	parse(): string {
		// implementación para MSSQL
		return '...';
	}

	protected override escapeIdentifier(field: string): string {
		return `[${field}]`; // MSSQL usa corchetes
	}
}
