


/** Interfaz EmailData para template del email de verificacion */
export interface EmailVerificationData {
  /** titulo de la etiqueta title del head del template html */
  headTitle: string;

  /** Logo de HomeBudget*/
  homeBudgetLogo: string;

  /** Logo del portafolio */
  portfolioLogo: string;

  /** Imagen black wave que va al fondo del template */
  blackWave: string;

  /** Título que se presenta en el card  */
  subject: string;

  /** Parrafo a mostrar */
  paragraph: {
    /** Saludo 1 */
    greating1: string;

    /** Saludo 2 */
    greating2: string;
    
    /** Nombre del receptor del mensaje */
    recipientName: string;

    /** Nombre del negocio */
    bussinessName: string;
    
    /** Predicado */
    argument: string;
  }

  /** Datos del botón */
  button: {
    /** Link a donde redireccionará el botón */
    link: string;

    /** Texto a mostrar en el botón */
    text: string;
  }
}


/** Interfaz EmailData para template del email de recuperación de contraseña */
export interface EmailPasswordRecoveryData {

}