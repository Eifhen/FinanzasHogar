import { Generated, Insertable, Selectable, Updateable } from "kysely";


/** Representa a la tabla de notificaciones de usuario */
export interface NotificacionesTable {

  /** Id secuencial de la notificacion */
  id_notificacion: Generated<number>;

  /** Clave foranea del usuario asociado */
  id_usuario: number;

  /** Mensaje a notificar */
  mensaje: string;

  /** Tipo de notificacion a enviar  1 system, 2 entity | El tipo de notificación (solicitud, cambios en finanzas, etc.). */
  tipo: number;

  /** Id de la entidad relacionada que envío la notificación */
  id_entidad_relacionada: number;

  /** Nombre de la entidad relacionada */
  entidad_relacionada: string;

  /** Estado de la notificacion 1 = leida, 0 = noleida */
  estado: number;

  /** Fecha de creacion de la notificacion */
  fecha_creacion: Date;

  /** Fecha de lectura de la notificación */
  fecha_lectura: Date;

  /** Link/Enlace asociado a la notificación */
  enlace: string;

}


/** Tipo para realizar consultas de seleccion */
export type SelectNotificaciones = Selectable<NotificacionesTable>;

/** Tipo para realizar consultas de inserción */
export type CreateNotificaciones = Insertable<NotificacionesTable>;

/** Tipo para realizar consultas de actualización */
export type UpdateNotificaciones = Updateable<NotificacionesTable>;