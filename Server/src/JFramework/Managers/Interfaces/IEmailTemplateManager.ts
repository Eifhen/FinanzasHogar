import { EmailTemplateType } from "../Types/EmailTemplates";




export interface IEmailTemplateManager  {

  /** Obtiene el template especificado */
  GetTemplate <TemplateData>(templateName:EmailTemplateType, templateData:TemplateData) : string;
}