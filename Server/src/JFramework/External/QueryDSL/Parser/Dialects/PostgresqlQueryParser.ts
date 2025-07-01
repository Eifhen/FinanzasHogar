import { SqlQueryParser } from "../Abstract/SqlQueryParser";



export class PostgresQueryParser<T extends string> extends SqlQueryParser<T> {
	parse(): string {
		// implementa el parseo a SQL específico de PostgreSQL aquí
		return '...';
	}

	protected override escapeIdentifier(field: string): string {
		return `"${field}"`; // PostgreSQL usa comillas dobles
	}
}
