/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Options } from "express-rate-limit";
import { TimeUnitConverter } from "../../Utils/TimeUnitConverter";


/** Limiters validos */
export const ValidLimiters = {
	generalLimiter: "generalLimiter",
	authLimiter: "authLimiter",
	resourceHeavyLimiter: "resourceHeavyLimiter",
} as const;

export type Limiters = (typeof ValidLimiters)[keyof typeof ValidLimiters];

/** Objeto que contiene el listado de RateLimiters disponibles */
export const limiterConfig: Record<Limiters, Partial<Options>> = {
	generalLimiter: {
		windowMs: TimeUnitConverter.ToMilliseconds(15, "minutes"),
		max: 100, // 100 request por IP cada 15 minutos
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	},
	authLimiter: {
		windowMs: TimeUnitConverter.ToMilliseconds(5, "minutes"),
		max: 10, // 10 request por IP cada 5 minutos
		standardHeaders: true,
		legacyHeaders: false,
	},
	resourceHeavyLimiter: {
		windowMs: TimeUnitConverter.ToMilliseconds(1, "days"),
		max: 50, // 50 request por día por IP
		standardHeaders: true,
		legacyHeaders: false,
	}
}