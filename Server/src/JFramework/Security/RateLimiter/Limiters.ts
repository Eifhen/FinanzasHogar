import { Options } from "express-rate-limit";
import { ConvertTimeToMiliSeconds } from "../../Utils/utils";




export const ValidLimiters = {
	"slowLimiter": "slowLimiter",
	"fastLimiter": "fastLimiter",
} as const;

export type Limiters = (typeof ValidLimiters)[keyof typeof ValidLimiters];


export const slowLimiter: Partial<Options> = {
  windowMs: ConvertTimeToMiliSeconds(1, "minutes"), // 15 minutes
	max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};