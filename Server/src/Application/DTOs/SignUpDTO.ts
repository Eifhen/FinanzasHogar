import { z } from "zod";




/** NameSpace para el DTO de registro */
export namespace SignUpDTO {

  /** Esquema del SignUpDTO */
  export const Schema = z.object({
    
    /** Nombre del usuario */
    nombre: z.string().min(4),

    /** Apellidos del usuario */
    apellidos: z.string().min(4),

    /** Fecha de nacimiento del usuario */
    fechaNacimiento: z.date(),

    /** Pais del usuario */
    pais: z.string().min(4),

    /** Email del usuario */
    email: z.string().email(),
    
    /** Contraseña del usuario */
    password: z.string().min(10),

  });

  /** Tipo SignUpDTO */
  export type Type = z.infer<typeof Schema>;
}