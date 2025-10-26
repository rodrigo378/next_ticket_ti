// useAsignarTabs.ts
import { useMemo, useState, useCallback } from "react";

export function useAsignarTabs() {
  const [tabKey, setTabKey] = useState<"sin_asignar" | "asignados">(
    "sin_asignar"
  );

  const estados_id = useMemo(
    () => (tabKey === "sin_asignar" ? ["1"] : ["2", "3", "4"]),
    [tabKey]
  );

  const onChangeTabs = useCallback((key: string) => {
    if (key === "sin_asignar" || key === "asignados") setTabKey(key);
  }, []);

  return { tabKey, estados_id, onChangeTabs };
}
