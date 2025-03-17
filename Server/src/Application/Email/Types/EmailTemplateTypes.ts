


/** Templates disponibles */
export const EmailTemplateTypes = {

	/** Email de verificación de usuario */
	VERIFICATION_EMAIL: "verification_email",

	/** Email para recuperación de contraseña */
	PASSWORD_RECOVERY: "password_recovery_email",
 
} as const;


export type EmailTemplateType = (typeof EmailTemplateTypes)[keyof typeof EmailTemplateTypes];