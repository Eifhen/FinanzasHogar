

/** Interfaz que sirve para obtener un template del usuario */
export interface IEmailTemplateManager  {

  /** Obtiene el template especificado */
  GetTemplate <TemplateData>(templateName:string, templateData:TemplateData) : string;
}