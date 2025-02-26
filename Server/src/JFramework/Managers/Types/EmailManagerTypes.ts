import { EmailTemplateType } from "./EmailTemplates";


/** Representa un objeto que contiene todo lo necesario para enviar un email */
export interface EmailData<TemplateData> {
  /** Título del email a enviar */
  title: string;
  
  /** Email del Destinatario */
  recipientEmail: string;

  /** Información relevante al template que se está utilizando para el email */
  template: EmailTemplate<TemplateData>;

  /** Adjuntos si los hay */
  attatchments?: EmailAttatchment[];
}


/** Representa el template que se va a enviar por email */
export interface EmailTemplate<TemplateData> {
  /** Nombre del template */
  name: EmailTemplateType;

  /** Data que se va a inyectar en el template */
  data: TemplateData;

}


/** Interfaz que representa un documento adjunto para enviar por email */
export interface EmailAttatchment {
  /** Nombre del archivo */
  filename: string;

  /** path completo del archivo 
   * @example: .src/imagenes/portafolio.png */
  path: string;

  /** Id unico */
  cid: string;
}

