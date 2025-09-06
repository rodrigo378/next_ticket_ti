export type HdErrorCode =
  | "OUT_OF_HOURS"
  | "AREA_NO_HORARIO"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SERVER_ERROR";

export interface HdApiError {
  status: number; // HTTP status
  code: HdErrorCode; // código del dominio HD
  message: string; // mensaje amigable
  details?: {
    ventanas?: string[];
    fieldErrors?: Record<string, string | string[]>;
    [k: string]: unknown;
  };
}

export const isHdApiError = (x: unknown): x is HdApiError =>
  !!x &&
  typeof x === "object" &&
  "status" in x &&
  "code" in x &&
  "message" in x;
