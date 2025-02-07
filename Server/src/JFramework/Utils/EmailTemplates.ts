







export const EmailTemplateTypes = {

  /** Email de verificación de usuario */
  VERIFICATION_EMAIL: "verification_email",
 
} as const;


export type EmailTemplateType = (typeof EmailTemplateTypes)[keyof typeof EmailTemplateTypes];