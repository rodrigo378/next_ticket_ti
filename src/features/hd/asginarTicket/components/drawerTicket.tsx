// drawerTicket.tsx
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
  Space,
  Empty,
  List,
  Tooltip,
} from "antd";
import React, { useMemo, useState } from "react";
import { HD_Ticket, HD_DerivacionTicket, TreeNode } from "@interfaces/hd";
import { Core_Usuario } from "@interfaces/core";
import dayjs from "@shared/date/dayjs";

import {
  PaperClipOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface Props {
  arbol: TreeNode[];
  ticket: HD_Ticket;
  drawerVisible: boolean;
  setDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  asignadoId: number;
  setAsignadoId: React.Dispatch<React.SetStateAction<number | undefined>>;
  usuarios: Core_Usuario[];
  prioridadId: number;
  setPrioridadId: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleActualizar: () => void | Promise<void>;

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
  // Bloqueo de doble envío
  const [saving, setSaving] = useState(false);
  const onGuardar = async () => {
    if (saving) return; // evita doble click
    setSaving(true);
    try {
      await Promise.resolve(handleActualizar());
    } finally {
      setSaving(false);
    }
  };

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

    const total = e.diff(s);
    if (total <= 0) return 100;

    const trans = Math.min(Math.max(now.diff(s), 0), total);
    return Math.floor((trans / total) * 100);
  };

  const humanRemaining = (end?: string | Date, nowRef?: dayjs.Dayjs) => {
    if (!end) return "—";
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!e.isValid()) return "—";
    if (now.isAfter(e)) return "Vencido";
    return `Faltan ${e.toNow(true)}`;
  };

  const nowForRespuesta = (t?: HD_Ticket | null) =>
    t?.respondidoAt ? dayjs(t.respondidoAt) : dayjs();

  const nowForResolucion = (t?: HD_Ticket | null) =>
    t?.finalizadoAt ? dayjs(t.finalizadoAt) : dayjs();

  const respNow = nowForRespuesta(ticket);
  const respPercent = calcPercent(
    ticket?.asignadoAt || "",
    ticket?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  const resoNow = nowForResolucion(ticket);
  const resoPercent = calcPercent(
    ticket?.asignadoAt || "",
    ticket?.slaTicket?.tiempo_estimado_resolucion || "",
    resoNow
  );

  const resoRemaining = humanRemaining(
    ticket?.slaTicket?.tiempo_estimado_resolucion || "",
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

  // === Condiciones para mostrar clasificación ===
  const esDerivado =
    Array.isArray(ticket?.derivacionesComoDestino) &&
    ticket.derivacionesComoDestino.length > 0;

  const esTicketEstudiante = ticket?.titular?.rol_id === 3;

  const sinCategoria = !ticket?.categoria_id;

  const debeMostrarClasificacion =
    esDerivado || esTicketEstudiante || sinCategoria;

  // Etiqueta extra para el título del bloque de clasificación
  const chipClasificacion = esDerivado
    ? { color: "processing" as const, text: "Ticket derivado" }
    : esTicketEstudiante
    ? { color: "blue" as const, text: "Ticket de estudiante" }
    : { color: "default" as const, text: "Sin categoría" };

  // ===================== Helpers Archivos (simple, sin preview) =====================
  const documentos = Array.isArray(ticket?.documentos) ? ticket.documentos : [];

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(2)} ${units[i]}`;
  };

  const iconByType = (name = "", ct = "") => {
    const lower = name.toLowerCase();
    const isImg =
      ct.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((e) => lower.endsWith(e));
    const isPDF = ct === "application/pdf" || lower.endsWith(".pdf");
    const isWord = ct.includes("word") || /\.(docx?|rtf)$/i.test(lower);
    const isExcel = ct.includes("excel") || /\.(xlsx?|csv)$/i.test(lower);
    const isPpt = ct.includes("powerpoint") || /\.(pptx?)$/i.test(lower);

    if (isImg) return <FileImageOutlined />;
    if (isPDF) return <FilePdfOutlined />;
    if (isWord) return <FileWordOutlined />;
    if (isExcel) return <FileExcelOutlined />;
    if (isPpt) return <FilePptOutlined />;
    return <FileOutlined />;
  };

  const typeTag = (name = "", ct = "") => {
    const lower = name.toLowerCase();
    const isImg =
      ct.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((e) => lower.endsWith(e));
    const isPDF = ct === "application/pdf" || lower.endsWith(".pdf");
    const isWord = ct.includes("word") || /\.(docx?|rtf)$/i.test(lower);
    const isExcel = ct.includes("excel") || /\.(xlsx?|csv)$/i.test(lower);
    const isPpt = ct.includes("powerpoint") || /\.(pptx?)$/i.test(lower);

    const color = isImg
      ? "blue"
      : isPDF
      ? "red"
      : isWord || isExcel || isPpt
      ? "green"
      : "default";
    const text = isImg
      ? "Imagen"
      : isPDF
      ? "PDF"
      : isWord
      ? "Word"
      : isExcel
      ? "Excel"
      : isPpt
      ? "PowerPoint"
      : "Archivo";

    return <Tag color={color}>{text}</Tag>;
  };
  // ================================================================================

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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Información general */}
          <Divider orientation="left">📄 Información General</Divider>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Área">
              {ticket.area?.nombre}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color="blue">{ticket.estado?.nombre}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creado por">
              {ticket.titular?.nombre} {ticket.titular?.apellidos}
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
              {ticket.categoria?.incidencia?.catalogo_servicio?.nombre ??
                " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                ticket.categoria?.incidencia?.tipo === undefined
                  ? "Tipo"
                  : ticket.categoria?.incidencia?.tipo
              }
            >
              {ticket.categoria?.incidencia?.nombre ?? " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item label="Categoría">
              {ticket.categoria?.nombre ?? " - - - - - - "}
            </Descriptions.Item>
            <Descriptions.Item label="Descripcion">
              {ticket.descripcion}
            </Descriptions.Item>
          </Descriptions>

          {/* 📎 Archivos Adjuntos (compacto, sin preview; solo Ver/Descargar) */}
          {documentos.length > 0 && (
            <>
              <Divider orientation="left">📎 Archivos Adjuntos</Divider>
              <Card size="small" style={{ borderRadius: 10 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={documentos}
                  locale={{
                    emptyText: <Empty description="No hay archivos adjuntos" />,
                  }}
                  renderItem={(doc, idx) => {
                    const a = doc?.archivo;
                    if (!a) {
                      return (
                        <List.Item key={`no-file-${idx}`}>
                          <List.Item.Meta
                            title={
                              <Text type="secondary">
                                Archivo no disponible
                              </Text>
                            }
                          />
                        </List.Item>
                      );
                    }
                    const name = a.nombre ?? "archivo";
                    const ct = a.contentType ?? "";
                    const openHref = a.openUrl || a.webUrl || a.url || "#"; // Ver
                    const downloadHref = a.url || a.webUrl || "#"; // Descargar

                    return (
                      <List.Item
                        key={doc.id ?? idx}
                        actions={[
                          <Tooltip title="Ver / Abrir" key="ver">
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              href={openHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              disabled={openHref === "#"}
                            >
                              Ver
                            </Button>
                          </Tooltip>,
                          <Tooltip title="Descargar" key="desc">
                            <Button
                              size="small"
                              type="primary"
                              icon={<DownloadOutlined />}
                              href={downloadHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              disabled={downloadHref === "#"}
                            >
                              Descargar
                            </Button>
                          </Tooltip>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                display: "grid",
                                placeItems: "center",
                                background: "#f5f5f5",
                                border: "1px solid #eee",
                              }}
                            >
                              {iconByType(name, ct)}
                            </div>
                          }
                          title={
                            <Space size={6} wrap>
                              <PaperClipOutlined />
                              <Text strong>{name}</Text>
                            </Space>
                          }
                          description={
                            <Space size={6} wrap>
                              {typeTag(name, ct)}
                              {a.size ? (
                                <Text type="secondary">
                                  {formatBytes(a.size)}
                                </Text>
                              ) : null}
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </>
          )}

          {/* 🔀 Derivación */}
          {esDerivado && (
            <>
              <Divider orientation="left">🔀 Derivado desde</Divider>
              {ticket.derivacionesComoDestino!.map((d: HD_DerivacionTicket) => (
                <Descriptions key={d.id} bordered column={1} size="small">
                  <Descriptions.Item label="De área">
                    {d.de_area!.nombre}
                  </Descriptions.Item>
                  <Descriptions.Item label="A área">
                    {d.a_area!.nombre}
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
                    {`${d.usuario!.nombre} ${d.usuario!.apellidos}`}
                  </Descriptions.Item>
                </Descriptions>
              ))}
            </>
          )}

          {/* SLA (si corresponde) */}
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

          <Divider orientation="left">👨‍🔧 Asignación y Prioridad</Divider>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <p className="font-medium">Asignar Soporte:</p>
              <Select
                style={{ width: "100%" }}
                value={asignadoId}
                onChange={(value) => setAsignadoId(value)}
                placeholder="Seleccionar soporte"
                disabled={saving}
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
                disabled={saving}
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

            {/* Clasificación para estudiante/derivado/sin categoría */}
            {debeMostrarClasificacion && (
              <Card
                size="small"
                className="rounded-lg border border-dashed"
                title={
                  <span className="font-semibold">
                    📚 Clasificación de servicio
                  </span>
                }
                extra={
                  <Tag
                    color={chipClasificacion.color}
                    style={{ borderRadius: 999 }}
                  >
                    {chipClasificacion.text}
                  </Tag>
                }
              >
                <div className="text-xs text-gray-500 mb-2">
                  Selecciona: <strong>Catálogo → Incidencia → Categoría</strong>
                </div>

                <TreeSelect
                  style={{ width: "100%" }}
                  value={categoriaId}
                  treeData={arbol}
                  treeLine
                  showSearch
                  placeholder={
                    arbol?.length
                      ? "Selecciona una categoría"
                      : "Cargando árbol..."
                  }
                  allowClear
                  disabled={saving || !arbol?.length}
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
                  niveles de
                  <em> Catálogo</em> e <em> Incidencia</em> sirven para agrupar.
                </div>
              </Card>
            )}

            <Button
              type="primary"
              block
              className="mt-2"
              icon={<EyeOutlined />}
              onClick={onGuardar}
              loading={saving}
              disabled={saving}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
