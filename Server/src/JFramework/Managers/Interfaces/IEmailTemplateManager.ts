import { EmailTemplateType } from "../../Utils/EmailTemplates";
import { EmailTemplate } from "../Types/EmailManagerTypes";







export interface IEmailTemplateManager  {

  /** Obtiene el template especificado */
  GetTemplate : <TemplateData>(templateName:EmailTemplateType, templateData:TemplateData) => string;
}