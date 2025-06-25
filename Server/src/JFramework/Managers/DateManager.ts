
/* eslint-disable prefer-template */

const DateFormat = {
	YYYYMMDD: 'YYYY-MM-DD',
	DDMMYYYY: 'DD/MM/YYYY',
	MMDDYYYY: 'MM-DD-YYYY',
	DDMMMYYYY: 'DD MMM YYYY'
} as const;

type DateFormats = (typeof DateFormat)[keyof typeof DateFormat];

const DATE_SLICE = -2;
const MONTH_INCREMENT = 1;

export default class DateManager {

	/** Método privado para formatear una fecha a 'YYYY-MM-DD' */
	private static FormatToYYYYMMDD(date: Date, divider:string = "-"): string {
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + MONTH_INCREMENT)).slice(DATE_SLICE);
		const day = ('0' + date.getDate()).slice(DATE_SLICE);
		return `${year}${divider}${month}${divider}${day}`;
	}

	/** Método privado para formatear una fecha a 'DD/MM/YYYY' */
	private static FormatToDDMMYYYY(date: Date, divider:string = "-"): string {
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + MONTH_INCREMENT)).slice(DATE_SLICE);
		const day = ('0' + date.getDate()).slice(DATE_SLICE);
		return `${day}${divider}${month}${divider}${year}`;
	}

	/** Método privado para formatear una fecha a 'MM-DD-YYYY' */
	private static FormatToMMDDYYYY(date: Date, divider:string = "-"): string {
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + MONTH_INCREMENT)).slice(DATE_SLICE);
		const day = ('0' + date.getDate()).slice(DATE_SLICE);
		return `${month}${divider}${day}${divider}${year}`;
	}

	/** Método privado para formatear una fecha a 'DD MMM YYYY' */
	private static FormatToDDMMMYYYY(date: Date, divider:string = "-"): string {
		const year = date.getFullYear();
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const month = monthNames[date.getMonth()];
		const day = ('0' + date.getDate()).slice(DATE_SLICE);
		return `${day}${divider}${month}${divider}${year}`;
	}

	/** Método público para formatear una fecha según el formato especificado */
	public static Format(date: Date, format: DateFormats, divider:string = "-"): string {
		switch (format) {
			case DateFormat.YYYYMMDD:
				return this.FormatToYYYYMMDD(date, divider);
			case DateFormat.DDMMYYYY:
				return this.FormatToDDMMYYYY(date, divider);
			case DateFormat.MMDDYYYY:
				return this.FormatToMMDDYYYY(date, divider);
			case DateFormat.DDMMMYYYY:
				return this.FormatToDDMMMYYYY(date, divider);
			default:
				throw new Error('Formato de fecha no soportado');
		}
	}

	/** Método para obtener la fecha de hoy en formato Date */
	public static GetToday(): Date {
		return new Date();
	}
}

