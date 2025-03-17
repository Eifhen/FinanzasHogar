import { Generated, Insertable, Selectable, Updateable } from "kysely";


/** Tabla que representa la solicitud aun hogar */
export interface SolicitudHogarTable {

  /** Id secuencial de la solicitud */
  id_solicitud: Generated<number>;

  /** Id del hogar de la solicitud */
  id_hogar: number;

  /** Id del usuario solicitante */
  id_usuario: number;

  /**  Estado de la solicitud 1 = pendiente, 2 = autorizado, 3 = rechazado */
  estado_solicitud: number;

  /** Fecha de creación de la solicitud */
  fecha_creacion: Date;

  /** Fecha en la que esta solicitud fue respondida */
  fecha_respuesta: Date;

  /** Token asociado a la solicitud */
  token_solicitud: string;

}


/** Tipo para realizar consultas de seleccion */
export type SelectSolicitudHogar = Selectable<SolicitudHogarTable>;

/** Tipo para realizar consultas de inserción */
export type CreateSolicitudHogar = Insertable<Omit<SolicitudHogarTable, "id_solicitud">>;

/** Tipo para realizar consultas de actualización */
export type UpdateSolicitudHogar = Updateable<Omit<SolicitudHogarTable, "id_solicitud">>;