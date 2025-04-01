


/** Objeto de idioma inglés */
export const EN_US_SYSTEM = {

	/** Time Units */
	"days": "Days",
	"hours": "Hours",
	"minutes": "Minutes",
	"seconds": "Seconds",
	"milliseconds": "Milliseconds",
	"years": "Years",
	/** END Time Units */

	/** Status Messages */
	"ok-result": "Successful Request",
	"created": "The resource was created successfully.",
	"accepted": "Request accepted",
	"updated": "The resource was updated successfully.",
	"deleted": "The resource was deleted successfully.",
	"no-content": "No content",
	"bad-request": "Bad request",
	"unauthorized": "Unauthorized access",
	"forbidden": "Forbidden access",
	"not-found": "Resource not found",
	"method-not-allowed": "Method not allowed",
	"unprocessable-entity": "Unprocessable entity",
	"internal-error": "Internal server error",
	"not-implemented": "Functionality not implemented",
	"bad-gateway": "Bad gateway",
	"service-unavailable": "Service unavailable",
	"too-many-requests": "Too many requests from this IP, please try again after {0} {1}.",
	/** END Status Messages */

	/** Limiters */
	"generalLimiter": "You have reached the request limit. Please try again later after {0} {1}.",
	"authLimiter": "Too many login attempts. Please try again after {0} {1}.",
	"resourceHeavyLimiter": "Request limit for this resource exceeded. Please try again after {0} {1}.",
	/** END Limiters */

	/** Errores Custom */
	"record-exists": "There is already a record with {0} equal to {1}.",
	"record-not-found": "No record found with identifier {0}.",
	"null-parameter-exception": "The parameter {0} can't be null.",
	"database-connection-exception": "An error occurred while connecting to the database.",
	"database-no-instance-exception": "There is no database instance available at the moment.",
	"database-no-dialect-exception": "There is no dialect available at the moment.",
	"database-transaction-exception": "An error occurred while performing the transaction.",
	"database-exception": "An error has occurred in the database.",
	"rate-limiter-invalid": "RateLimiter for {0} is not a function.",
	"middleware-instance-type-exception": "The entered middleware must be an instance of ApplicationMiddleware.",
	"image-size-exception": "The Image size cannot be larger than {0}.",
	"invalid-csrf-token": "The CSRF token entered is invalid",
	"csrf-token-doesnt-exists": "The CSRF token does not exist",
	"csrf-error": "An error occurred while validating the CSRF token.",
	"invalid-verb": "The HTTP Verb entered is invalid for this request.",
	"out-of-range": "The current request is out of range",
	"connection-env-error": "An error occurred while defining the connection environment type.",
	"connection-config-error": "An error ocurred while setting the connection configuration.",
	"no-tenant": "Error, a valid tenant has not been sent",
	"tenant-error": "An error occurred while searching for the indicated tenant.",
	/** END Errores Custom */

	/** Zod Errors */
	"too_small_array": `The length of field "{0}" must be greater than {1}.`,
	"too_small_set": `The length of field "{0}" must be greater than {1}.`,
	"too_small_number": `The value of field "{0}" must be greater than {1}.`,
	"too_small_bigint": `The value of field "{0}" must be greater than {1}.`,
	"too_small_string": `The "{0}" field must contain at least {1} characters.`,
	"too_small_date": `The date entered in field "{0}" must be greater than {1}.`,

	"too_big_array": `The length of the field "{0}" must not be greater than {1}.`,
	"too_big_set": `The length of the field "{0}" must not be greater than {1}.`,
	"too_big_number": `The value of field "{0}" must not be greater than {1}.`,
	"too_big_bigint": `The value of field "{0}" must not be greater than {1}.`,
	"too_big_string": `The "{0} field must not contain more than {1} characters.`,
	"too_big_date": `The date entered in field "{0}" must not be greater than {1}.`,

	"invalid_date": `The date entered in field "{0}" is invalid.`,
	"invalid_string": `The string entered in field "{0}" is invalid.`,
	"invalid_literal": `The value entered for field "{0}" is invalid. The value {1} was expected, but the value {2} was received.`,
	"invalid_type": `The data type entered in field "{0}" is invalid. Type {1} was expected but type {2} was received.`,
	"invalid_union": `An error occurred in field "{0}".`,
	"invalid_arguments": `The arguments passed to the function "{0}" are invalid.`,
	"invalid_return_type": `The return value of function "{0}" is invalid.`, 
	"invalid_enum_value": `The value entered in field "{0}" is invalid. The value {1} was entered and a value from the list was expected: {2}.`,
	"invalid_intersection_types": `Could not merge intersection results on field "{0}".`,
	"invalid_union_discriminator": `Invalid discriminator value in field "{0}". Expected {1}.`,
	"invalid_custom": `The field "{0}" is invalid.`,
	
	"not_finite": `The value of the field "{0}", must be a finite number.`,
	"not_multiple_of": `The value entered in field "{0}" must not be a multiple of {1}.`,
	"unrecognized_keys": `The field "{0}" must not have any additional properties: [{1}].`,
	/** END Zod Errors */

} as const;