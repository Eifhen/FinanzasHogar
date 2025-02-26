
// Define las unidades de tiempo
export enum TimeUnits {
  Milliseconds = "milliseconds",
  Seconds = "seconds",
  Minutes = "minutes",
  Hours = "hours",
  Days = "days"
}

export type TimeUnit = `${TimeUnits}`;

/**
 Si necesitas añadir más unidades o métodos adicionales, solo tendrás que 
 ampliar el enum y el objeto conversionFactors.
*/
export class TimeUnitConverter {

  // Factores de conversión a milisegundos para cada unidad.
  private static conversionFactors: Record<TimeUnit, number> = {
    [TimeUnits.Milliseconds]: 1,
    [TimeUnits.Seconds]: 1000,
    [TimeUnits.Minutes]: 60 * 1000,
    [TimeUnits.Hours]: 60 * 60 * 1000,
    [TimeUnits.Days]: 24 * 60 * 60 * 1000,
  };

  /**
   * Convierte un valor de una unidad de tiempo a otra.
   *
   * @param value - Valor a convertir.
   * @param from - Unidad original del valor.
   * @param to - Unidad destino a la que se desea convertir.
   * @returns Valor convertido.
   */
  public static Convert(value: number, from: TimeUnit, to: TimeUnit): number {
    // Primero, pasamos el valor a milisegundos
    const valueInMs = value * this.conversionFactors[from];
    // Luego, convertimos de milisegundos a la unidad deseada
    return valueInMs / this.conversionFactors[to];
  }

  /**
   * Convierte un valor a milisegundos desde la unidad especificada.
   *
   * @param value - Valor a convertir.
   * @param unit - Unidad del valor a convertir.
   * @returns Valor convertido a milisegundos.
   */
  public static ToMilliseconds(value: number, unit: TimeUnit): number {
    return value * this.conversionFactors[unit];
  }

  /**
   * Convierte un valor en milisegundos a la unidad especificada.
   *
   * @param value - Valor en milisegundos.
   * @param unit - Unidad destino.
   * @returns Valor convertido desde milisegundos.
   */
  public static FromMilliseconds(value: number, unit: TimeUnit): number {
    return value / this.conversionFactors[unit];
  }

  /**
  * Obtiene la unidad "óptima" para representar un valor en milisegundos.
  * Evalúa desde la unidad de mayor escala (días) hasta la de menor (milisegundos) y
  * retorna la primera que cumpla con que el valor convertido sea mayor o igual a 1.
  *
  * @param milliseconds - Valor en milisegundos.
  * @returns La unidad de tiempo (como string) adecuada para el valor.
  *
  * @example
  * TimeConverter.getBestUnit(90000) // Devuelve "minutes" ya que 90000ms son 1.5 minutos
  */
  public static MillisecondsToUnit(milliseconds: number): TimeUnit {
    if (milliseconds >= this.conversionFactors[TimeUnits.Days]) {
      return TimeUnits.Days;
    } else if (milliseconds >= this.conversionFactors[TimeUnits.Hours]) {
      return TimeUnits.Hours;
    } else if (milliseconds >= this.conversionFactors[TimeUnits.Minutes]) {
      return TimeUnits.Minutes;
    } else if (milliseconds >= this.conversionFactors[TimeUnits.Seconds]) {
      return TimeUnits.Seconds;
    } else {
      return TimeUnits.Milliseconds;
    }
  }
}

