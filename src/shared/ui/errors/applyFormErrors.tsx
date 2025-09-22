// src/utils/applyFormErrors.ts
import type { FormInstance } from "antd/es/form";
import type { NormalizedError } from "@/services/api";

export function applyFormErrors(form: FormInstance, err: NormalizedError) {
  const fieldErrors = err.details?.fieldErrors;
  if (!fieldErrors) return false;

  const items = Object.entries(fieldErrors).map(([name, errors]) => ({
    name,
    errors: Array.isArray(errors) ? errors : [String(errors)],
  }));

  form.setFields(items);
  return true;
}
