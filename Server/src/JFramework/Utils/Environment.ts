export const Environment = {
	DEVELOPMENT:"DEVELOPMENT",
	PRODUCTION:"PRODUCTION",
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];
