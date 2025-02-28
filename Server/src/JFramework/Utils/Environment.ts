






export const EnvironmentStatus = {
	DEVELOPMENT:"DEVELOPMENT",
	PRODUCTION:"PRODUCTION",
} as const;

export type Environment = (typeof EnvironmentStatus)[keyof typeof EnvironmentStatus];
