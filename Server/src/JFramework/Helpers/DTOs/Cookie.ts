


/** Configuracion Custom para las cookies */
export type CustomCookieOptions = {
  /** 
   * Indica si la cookie solo puede ser accesible por protocolos HTTP/HTTPS.
   * Esto evita que la cookie sea manipulada o accedida mediante JavaScript
   * en el navegador, aumentando la seguridad contra ataques XSS.
   * 
   * @default true
   */
  httpOnly: boolean;

  /** 
   * Especifica el tiempo de vida de la cookie en milisegundos.
   * Una vez transcurrido este tiempo, la cookie expirará automáticamente
   * y el cliente la eliminará.
   * 
   * @default undefined (cookie sin expiración específica)
   */
  maxAge?: number;

  /** 
   * Define el ámbito de la cookie dentro del dominio. 
   * La cookie será enviada automáticamente solo en las solicitudes que 
   * correspondan a la ruta especificada o sus subrutas.
   * Por ejemplo, un path "/admin" hará que la cookie solo se envíe en 
   * "/admin" y sus subrutas como "/admin/dashboard".
   * 
   * @default "/"
   */
  path?: string;

  /** 
   * Indica si la cookie debe restringirse al mismo origen 
   * o si puede ser enviada en solicitudes entre sitios.
   * 
   * Valores posibles:
   * - 'strict': Solo se envía en solicitudes realizadas dentro del mismo origen.
   * - 'lax': Se permite en solicitudes de navegación cruzada seguras.
   * - 'none': Se permite en cualquier solicitud, incluso entre sitios. 
   * 
   * @default 'strict' (para proteger contra ataques CSRF)
   */
  sameSite: 'strict' | 'lax' | 'none';

  /** 
   * Indica si la cookie solo debe enviarse en conexiones seguras (HTTPS).
   * Esto es particularmente importante en producción para evitar que 
   * la cookie sea enviada a través de HTTP, lo que podría exponerla a ataques.
   * 
   * @default true en producción; false en desarrollo.
   */
  secure?: boolean;

  /** 
   * Determina si la cookie debe estar firmada con una clave secreta.
   * Las cookies firmadas garantizan que su contenido no pueda ser alterado
   * sin conocimiento de la clave, permitiendo al servidor verificar su integridad.
   * 
   * @default false
   */
  signed?: boolean;
};


/** Objecto cookie */
export type Cookie = {
  name: string;
  value: string;
  options: CustomCookieOptions;
}