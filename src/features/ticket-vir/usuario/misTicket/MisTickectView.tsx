"use client";
import { Space } from "antd";
import TicketTabs from "./components/TicketTabs";
import useMisTicket from "./hooks/useMisTicket";

export default function MisTicketView() {
  const { tickets } = useMisTicket();

  return (
    <>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
        <Space direction="vertical" style={{ width: "100%" }}></Space>
        <TicketTabs></TicketTabs>
      </div>

      {/* <TicketTable ticket={tickets}></TicketTable> */}
    </>
  );
}
