
import ApplicationException from "../ErrorHandling/ApplicationException";
import { DEFAULT_INDENT } from "../Utils/const";
import { LoggerType, LoggerTypes } from "./Interfaces/ILoggerManager";


enum COLORS {
	Reset = "\x1b[0m",
	Bright = "\x1b[1m",
	Dim = "\x1b[2m",
	Underscore = "\x1b[4m",
	Blink = "\x1b[5m",
	Reverse = "\x1b[7m",
	Hidden = "\x1b[8m",

	// TextColor
	FgBlack = "\x1b[30m",
	FgGreen = "\x1b[32m",
	FgYellow = "\x1b[33m",
	FgBlue = "\x1b[34m",
	FgMagenta = "\x1b[35m",
	FgCyan = "\x1b[36m",
	FgWhite = "\x1b[37m",
	FgGray = "\x1b[90m",
	FgRed = "\x1b[31m",
	FgFatalError = "\x1b[38;2;213;0;0m",

	// Texto con background color
	BgBlack = "\x1b[40m",
	BgRed = "\x1b[41m",
	BgGreen = "\x1b[42m",
	BgYellow = "\x1b[43m",
	BgBlue = "\x1b[44m",
	BgMagenta = "\x1b[45m",
	BgCyan = "\x1b[46m",
	BgWhite = "\x1b[47m",
	BgGray = "\x1b[100m",
}

/**
 *  Clase que nos permite imprimir en consola un determinado mensaje
 */
export default class Line {

	/**
	 * @description - Función que nos permite darle formato a un determinado objeto
	 * @param obj - Objeto a formatear
	 * @returns  - Retorna objeto formateado como json
	 */
	private static Format(obj: any): string {

		// console.log("OBJ =>", obj);
		
		/** Si es una instancia de Error y No es una instancia de ApplicationException, 
			creamos una representación personalizada. */
		if (obj instanceof Error && !(obj instanceof ApplicationException)) {

			// Extraemos propiedades adicionales (aquellas que no sean name, message y stack)
			const extraProps = Object.getOwnPropertyNames(obj)
			.filter((prop) => !['name', 'message', 'stack'].includes(prop))
			.reduce((acc: Record<string, any>, prop: string) => {
				acc[prop] = (obj as Record<string, any>)[prop];
				return acc;
			}, {} as Record<string, any>);

			// Construimos el objeto de error a imprimir.
			const errorRepresentation = {
				name: obj.name,
				message: obj.message,
				stack: obj.stack,
				...extraProps
			};

			return JSON.stringify(errorRepresentation, null, DEFAULT_INDENT);
		}

		// Para otros tipos de objetos, se usa JSON.stringify normal.
		return JSON.stringify(obj, null, DEFAULT_INDENT);
	}



	/**
	 * @description - Método que permite imprimir en consola un mensaje de log con color
	 * @param type - Tipo de log que se desea imprimir
	 * @param message - Mensaje de log que se desea imprimir
	 * @param obj - Objeto que se desea imprimir
	 */
	public static Print(type: LoggerType, message: string, obj?: any) {

		let msg = ``;

		if (type === LoggerTypes.FATAL) {
			msg = `${COLORS.FgFatalError}[${type}] | ${message}`;
		}

		if (type === LoggerTypes.ERROR) {
			msg = `${COLORS.FgRed}[${type}] | ${message}`;
		}

		if (type === LoggerTypes.WARN) {
			msg = `${COLORS.FgYellow}[${type}]${COLORS.Reset} | ${message}`;
		}

		if (type === LoggerTypes.INFO) {
			msg = `${COLORS.FgBlue}[${type}]${COLORS.Reset} | ${message}`;
		}

		if (obj) {
			console.log(msg, this.Format(obj))
		} else {
			console.log(msg)
		}

	}
}