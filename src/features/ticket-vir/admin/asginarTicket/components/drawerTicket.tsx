import { Ticket } from "@/interface/ticket_ti";
import { EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Progress,
  Row,
  Select,
  Tag,
  TreeSelect,
  Typography,
} from "antd";
import React, { useMemo } from "react";
const { Text } = Typography;
const { Option } = Select;

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Usuario } from "@/interface/usuario";
import { DerivacionTicket } from "@/interface/derivacionTicket";
import { TreeNode } from "@/interface/incidencia";

dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  arbol: TreeNode[];
  ticket: Ticket;
  drawerVisible: boolean;
  setDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  asignadoId: number;
  setAsignadoId: React.Dispatch<React.SetStateAction<number | undefined>>;
  usuarios: Usuario[];
  prioridadId: number;
  setPrioridadId: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleActualizar: () => void;

  categoriaId: number | undefined;
  setCategoriaId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function DrawerTicket({
  arbol,
  ticket,
  drawerVisible,
  setDrawerVisible,
  asignadoId,
  setAsignadoId,
  usuarios,
  prioridadId,
  setPrioridadId,
  handleActualizar,
  categoriaId,
  setCategoriaId,
}: Props) {
  const calcPercent = (
    start?: string | Date,
    end?: string | Date,
    nowRef?: dayjs.Dayjs
  ): number => {
    if (!start || !end) return 0;
    const s = dayjs(start);
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!s.isValid() || !e.isValid()) return 0;

    const total = e.diff(s); // ms totales
    if (total <= 0) return 100;

    const trans = Math.min(Math.max(now.diff(s), 0), total);
    return Math.floor((trans / total) * 100); // floor para estabilidad
  };

  const humanRemaining = (end?: string | Date, nowRef?: dayjs.Dayjs) => {
    if (!end) return "—";
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!e.isValid()) return "—";
    if (now.isAfter(e)) return "Vencido";
    return `Faltan ${e.toNow(true)}`;
  };

  const nowForRespuesta = (t?: Ticket | null) =>
    t?.respondidoAt ? dayjs(t.respondidoAt) : dayjs();

  const nowForResolucion = (t?: Ticket | null) =>
    t?.finalizadoAt ? dayjs(t.finalizadoAt) : dayjs();

  const respNow = nowForRespuesta(ticket);
  const respPercent = calcPercent(
    ticket?.asignadoAt,
    ticket?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  const resoNow = nowForResolucion(ticket);
  const resoPercent = calcPercent(
    ticket?.asignadoAt,
    ticket?.slaTicket?.tiempo_estimado_resolucion,
    resoNow
  );

  const resoRemaining = humanRemaining(
    ticket?.slaTicket?.tiempo_estimado_resolucion,
    resoNow
  );

  const respRemaining = humanRemaining(
    ticket?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  const tieneSLA = useMemo(
    () => Boolean(ticket?.slaTicket && ticket?.asignadoAt),
    [ticket]
  );

  return (
    <Drawer
      title={
        <span className="text-lg font-semibold">
          🎫 Detalle del Ticket: {ticket?.codigo}
        </span>
      }
      placement="right"
      width={560}
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
    >
      {ticket && (
        <div className="flex flex-col gap-6">
          {/* Informacion general  */}
          <Divider orientation="left">📄 Información General</Divider>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Área">
              {ticket.area?.nombre}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color="blue">{ticket.estado?.nombre}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creado por">
              {ticket.creado?.nombre} {ticket.creado?.apellidos}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de creación">
              {ticket.createdAt
                ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
            {ticket.asignadoAt && (
              <Descriptions.Item label="Fecha de asignación">
                {ticket.asignadoAt
                  ? dayjs(ticket.asignadoAt).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Catálogo de servicio">
              {ticket.categoria?.incidencia?.catalogo_servicio?.nombre !==
              undefined
                ? ticket.categoria?.incidencia?.catalogo_servicio?.nombre
                : " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                ticket.categoria?.incidencia?.tipo === undefined
                  ? "Tipo"
                  : ticket.categoria?.incidencia?.tipo
              }
            >
              {ticket.categoria?.incidencia?.nombre !== undefined
                ? ticket.categoria?.incidencia?.nombre
                : " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item label="Categoría">
              {ticket.categoria?.nombre !== undefined
                ? ticket.categoria?.nombre
                : " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item label="Descripcion">
              {ticket.descripcion}
            </Descriptions.Item>
          </Descriptions>

          {/* 🔀 Derivación */}
          {Array.isArray(ticket?.DerivacionesComoDestino) &&
            ticket.DerivacionesComoDestino.length > 0 && (
              <>
                <Divider orientation="left">🔀 Derivado desde</Divider>
                {ticket.DerivacionesComoDestino.map((d: DerivacionTicket) => (
                  <Descriptions key={d.id} bordered column={1} size="small">
                    <Descriptions.Item label="De área">
                      {d.de_area.nombre}
                    </Descriptions.Item>
                    <Descriptions.Item label="A área">
                      {d.a_area.nombre}
                    </Descriptions.Item>
                    <Descriptions.Item label="Motivo">
                      {d.motivo ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha">
                      {d.createdAt
                        ? dayjs(d.createdAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Derivado por">
                      {`${d.usuario.nombre} ${d.usuario.apellidos}`}
                    </Descriptions.Item>
                  </Descriptions>
                ))}
              </>
            )}

          {/* SLA del ticket: visible solo si está asignado y tiene registro SLA */}
          {tieneSLA && ticket.estado_id !== 7 && (
            <>
              <Divider orientation="left">⏱ SLA del Ticket</Divider>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Tiempo de Respuesta (min)">
                  {ticket.slaTicket?.sla?.tiempo_respuesta ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Tiempo de Resolución (min)">
                  {ticket.slaTicket?.sla?.tiempo_resolucion ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Estimado de Respuesta">
                  {ticket.slaTicket?.tiempo_estimado_respuesta
                    ? dayjs(ticket.slaTicket.tiempo_estimado_respuesta).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Estimado de Resolución">
                  {ticket.slaTicket?.tiempo_estimado_resolucion
                    ? dayjs(ticket.slaTicket.tiempo_estimado_resolucion).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "—"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {tieneSLA && ticket.estado_id !== 7 && (
            <Card size="small" className="mt-2">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text strong>Progreso → Respuesta</Text>
                  <div className="mt-2 flex items-center justify-center">
                    <Progress
                      type="circle"
                      percent={respPercent}
                      status={respPercent >= 100 ? "exception" : "normal"}
                    />
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-500">
                    {respRemaining}
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Progreso → Resolución</Text>
                  <div className="mt-2 flex items-center justify-center">
                    <Progress
                      type="circle"
                      percent={resoPercent}
                      status={resoPercent >= 100 ? "exception" : "normal"}
                    />
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-500">
                    {resoRemaining}
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {ticket.documentos && ticket.documentos?.length > 0 && (
            <>
              <Divider orientation="left">📎 Archivos Adjuntos</Divider>
              <ul className="list-disc pl-5 space-y-1">
                {ticket.documentos.map((archivo, index) => {
                  const fileUrl = `http://localhost:4000${archivo.url.replace(
                    /\\/g,
                    "/"
                  )}`;
                  return (
                    <li key={index}>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📄 {archivo.nombre}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <Divider orientation="left">👨‍🔧 Asignación y Prioridad</Divider>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-medium">Asignar Soporte:</p>
              <Select
                style={{ width: "100%" }}
                value={asignadoId}
                onChange={(value) => setAsignadoId(value)}
                placeholder="Seleccionar soporte"
              >
                {usuarios.map((usuario) => (
                  <Option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <p className="font-medium">Prioridad:</p>
              <Select
                style={{ width: "100%" }}
                value={prioridadId?.toString()}
                onChange={(value) => setPrioridadId(Number(value))}
                placeholder="Seleccionar prioridad"
              >
                <Option value="1">
                  <Tag color="green">Baja</Tag>
                </Option>
                <Option value="2">
                  <Tag color="orange">Media</Tag>
                </Option>
                <Option value="3">
                  <Tag color="red">Alta</Tag>
                </Option>
              </Select>
            </div>

            {Array.isArray(ticket?.DerivacionesComoDestino) &&
              ticket.DerivacionesComoDestino.length > 0 && (
                <Card
                  size="small"
                  className="rounded-lg border border-dashed"
                  title={
                    <span className="font-semibold">
                      📚 Clasificación de servicio
                    </span>
                  }
                  extra={
                    <Tag color="processing" style={{ borderRadius: 999 }}>
                      Ticket derivado
                    </Tag>
                  }
                >
                  <div className="text-xs text-gray-500 mb-2">
                    Selecciona:{" "}
                    <strong>Catálogo → Incidencia → Categoría</strong>
                  </div>

                  <TreeSelect
                    style={{ width: "100%" }}
                    value={categoriaId}
                    treeData={arbol}
                    // treeDefaultExpandAll
                    treeLine
                    showSearch
                    placeholder={
                      arbol?.length
                        ? "Selecciona una categoría"
                        : "Cargando árbol..."
                    }
                    allowClear
                    disabled={!arbol?.length}
                    listHeight={400}
                    filterTreeNode={(input, node) =>
                      String(node?.title ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value) => setCategoriaId(value as number)}
                  />

                  <div className="text-[11px] text-gray-500 mt-8">
                    Solo las <strong>categorías</strong> son seleccionables; los
                    niveles de <em>Catálogo</em> e <em>Incidencia</em> sirven
                    para agrupar.
                  </div>
                </Card>
              )}

            <Button
              type="primary"
              block
              className="mt-2"
              icon={<EyeOutlined />}
              onClick={handleActualizar}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
