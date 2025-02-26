


/** Objeto de idioma inglés */
export const EN = {

  "activar": "Activate",
  "activar-cuenta": "Activate Account",
  "apikey-invalido" : "The API Key {0} entered is invalid",
  "apikey-no-definido": "Missing API key. Please provide a valid API key to access this resource.",
  "bienvenido-a": "Welcome to",
  "cuenta-creada-exitosamente": "Your account has been successfully created. Click the link below to activate your account",
  "hola": "Hello",
  "days": "days",
  "hours": "hours",
  "minutes": "Minutes",
  "seconds": "Seconds",
  "milliseconds": "Milliseconds",
  
  /** Status Messages */
  "ok-result": "Successful Request",
  "created": "The resource was created successfully",
  "accepted": "Request accepted",
  "updated": "The resource was updated successfully ",
  "deleted": "The resource was deleted successfully ",
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
  "too-many-requests": "Too many requests from this IP, please try again after {0} {1}",

  /** Errores custom */
  "record-exists": "There is already a record with {0} equal to {1}",
  "record-not-found": "No record found with identifier {0}",
  "null-parameter-exception": "The parameter {0} can't be null.",
  "database-connection-exception" : "An error occurred while connecting to the database", 
  "database-no-instance-exception" : "There is no database instance available at the moment",
  "database-no-dialect-exception": "There is no dialect available at the moment",
  "database-transaction-exception": "An error occurred while performing the transaction.",
  "database-exception": "An error has occurred in the database",
  "rate-limiter-invalid": "RateLimiter for {0} is not a function",

  // Limiters
  "generalLimiter": "You have reached the request limit. Please try again later after {0} {1}",
  "authLimiter" : "Too many login attempts. Please try again after {0} {1}",
  "resourceHeavyLimiter" : "Request limit for this resource exceeded. Please try again after {0} {1}",

} as const;