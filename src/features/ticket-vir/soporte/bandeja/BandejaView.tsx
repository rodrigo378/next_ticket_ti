"use client";
import TableTickets from "./components/TableTickets";
import TabsSoporte from "./components/Tabs";
import useBandeja from "./hooks/useBandaja";

export default function BandejaView() {
  const { tabKey, loading, tickets, onChangeTabs, usuario } = useBandeja();

  return (
    <>
      <TabsSoporte tabKey={tabKey} onChangeTabs={onChangeTabs}></TabsSoporte>

      <TableTickets
        usuario={usuario!}
        tickets={tickets}
        loading={loading}
      ></TableTickets>
    </>
  );
}
