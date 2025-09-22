export type HdErrorCode = "OUT_OF_HOURS" | "AREA_NO_HORARIO";

export interface HdApiError {
  status: number;
  code: HdErrorCode;
  message: string;
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
