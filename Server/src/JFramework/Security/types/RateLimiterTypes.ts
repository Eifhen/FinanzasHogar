
export interface RateLimiterConfig {
  
  /** Representa el tiempo de reconección */
  time: number;
  
  /** Representa la unidad de tiempo */
  unit: TimeUnit,

  /**  Representa el numero de request permitidas según la unidad de tiempo especificada*/
  requestPerTime: number;
}

export type TimeUnit = "minutes" | "seconds";