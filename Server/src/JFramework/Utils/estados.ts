




/** Estados del usuario */
export const EstadosUsuario = {
	ACTIVO: 1,
	INACTIVO: 2,
	BLOQUEADO: 3,
	ELIMINADO: 4,
} as const;

export type EstadosUsuario = (typeof EstadosUsuario)[keyof typeof EstadosUsuario];


export const EstadosTenant = {
	ACTIVO: 1,
	INACTIVO: 2
} as const;

export type EstadosTenant = (typeof EstadosTenant)[keyof typeof EstadosTenant]