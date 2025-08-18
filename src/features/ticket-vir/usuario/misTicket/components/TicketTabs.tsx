import { Tabs } from "antd";

export default function TicketTabs() {
  return (
    <>
      <Tabs
        defaultActiveKey="activos"
        items={[
          {
            key: "activos",
            label: "Activos",
            children: (
              <h1>Aca va la tabla de ticket activos</h1>
              // <Table
              //   columns={columnsActivos}
              //   dataSource={ticketsActivos}
              //   pagination={{ pageSize: 5 }}
              //   rowKey="id"
              //   bordered
              // />
            ),
          },
          {
            key: "resueltos",
            label: (
              // <h1>Aca va la tabla de ticket resueltos</h1>
              <>
                Resueltos
                {/* {pendientes > 0 && (
                  <Badge count={pendientes} style={{ marginLeft: 8 }} />
                )} */}
              </>
            ),
            children: (
              <h1>Aca va la tabla de ticket resueltos 2</h1>
              // <Table
              //   columns={columnsResueltos}
              //   dataSource={ticketsResueltos}
              //   pagination={{ pageSize: 5 }}
              //   rowKey="id"
              //   bordered
              //   // filas resaltadas cuando falta calificar
              //   rowClassName={(record: Ticket) =>
              //     !record?.CalificacionTicket?.calificacion
              //       ? "bg-yellow-50"
              //       : ""
              //   }
              // />
            ),
          },
        ]}
      />
    </>
  );
}
