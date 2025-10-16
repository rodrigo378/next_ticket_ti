import { useMemo, useState } from "react";

export enum BandejaTabKey {
  MisTickets = "mis_tickets",
  Grupo = "grupo",
  Finalizados = "finalizados",
}

const TAB_QUERIES = {
  [BandejaTabKey.MisTickets]: { me: "true", estados_id: ["2", "3"] },
  [BandejaTabKey.Grupo]: { estados_id: ["2", "3", "5"] },
  [BandejaTabKey.Finalizados]: { estados_id: ["4", "7"] },
};

export default function useBandejaTabs() {
  const [tabKey, setTabKey] = useState<BandejaTabKey>(BandejaTabKey.MisTickets);
  const filtros = useMemo(() => TAB_QUERIES[tabKey], [tabKey]);
  const onChangeTabs = (key: string) => setTabKey(key as BandejaTabKey);
  return { tabKey, filtros, onChangeTabs };
}
