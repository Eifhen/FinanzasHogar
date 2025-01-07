
const DateFormat = {
  YYYYMMDD:'YYYY-MM-DD',
  DDMMYYYY:'DD/MM/YYYY',
  MMDDYYYY:'MM-DD-YYYY',
  DDMMMYYYY:'DD MMM YYYY'
} as const;

type DateFormats = (typeof DateFormat)[keyof typeof DateFormat];

export default class DateManager {

  /** Método privado para formatear una fecha a 'YYYY-MM-DD' */
  private static FormatToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  /** Método privado para formatear una fecha a 'DD/MM/YYYY' */
  private static FormatToDDMMYYYY = (date: Date): string => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  /** Método privado para formatear una fecha a 'MM-DD-YYYY' */
  private static FormatToMMDDYYYY = (date: Date): string => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${month}-${day}-${year}`;
  }

  /** Método privado para formatear una fecha a 'DD MMM YYYY' */
  private static FormatToDDMMMYYYY = (date: Date): string => {
    const year = date.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = ('0' + date.getDate()).slice(-2);
    return `${day} ${month} ${year}`;
  }

  /** Método público para formatear una fecha según el formato especificado */
  public static Format = (date: Date, format: DateFormats): string => {
    switch (format) {
      case DateFormat.YYYYMMDD:
        return this.FormatToYYYYMMDD(date);
      case DateFormat.DDMMYYYY:
        return this.FormatToDDMMYYYY(date);
      case DateFormat.MMDDYYYY:
        return this.FormatToMMDDYYYY(date);
      case DateFormat.DDMMMYYYY:
        return this.FormatToDDMMMYYYY(date);
      default:
        throw new Error('Formato de fecha no soportado');
    }
  }

  /** Método para obtener la fecha de hoy en formato Date */
  public static GetToday = (): Date => {
    return new Date();
  }
}

