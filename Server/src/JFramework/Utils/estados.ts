




/** Estados del usuario */
export const EstadosUsuario = {
  ACTIVO: 1,
  INACTIVO: 2,
  BLOQUEADO: 3,
  ELIMINADO: 4,
} as const;

export type EstadoUsuario = (typeof EstadosUsuario)[keyof typeof  EstadosUsuario];