// components/hd/CardSla.tsx
import {
  Alert,
  Card,
  Divider,
  Progress,
  Tag,
  Typography,
  Space,
  Statistic,
} from "antd";
import { HD_Ticket } from "@interfaces/hd";
import dayjs from "@shared/date/dayjs";

const { Text } = Typography;

type ProgressStatus = "success" | "exception" | "normal" | "active";
type EstadoBadge =
  | "En tiempo"
  | "Vencido"
  | "N/A"
  | "Cumplido"
  | "Fuera de tiempo";

interface Props {
  ticket: HD_Ticket;
}

export default function CardSla({ ticket }: Props) {
  // Early return si no hay SLA configurado (evita 0%/N/A fantasma)
  if (!ticket?.slaTicket) {
    return (
      <Card title="⏱️ SLA del Ticket" className="mb-6 rounded-xl shadow-sm">
        <Typography.Text type="secondary">
          SLA no configurado para este ticket.
        </Typography.Text>
      </Card>
    );
  }

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

  const humanRemaining = (
    end?: string | Date,
    nowRef?: dayjs.Dayjs
  ): string => {
    if (!end) return "—";
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!e.isValid()) return "—";
    if (now.isAfter(e)) return "Vencido";
    return `Faltan ${e.toNow(true)}`;
  };

  // Helper de duración exacta d HH:mm para visibilidad
  const formatDurationDHm = (ms: number) => {
    if (!ms || ms < 0) return "—";
    const d = Math.floor(ms / 86_400_000);
    const h = Math.floor((ms % 86_400_000) / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return d > 0 ? `${d}d ${hh}:${mm}` : `${hh}:${mm}`;
  };

  const nowForRespuesta = (t?: HD_Ticket | null) =>
    t?.respondidoAt ? dayjs(t.respondidoAt) : dayjs();
  const nowForResolucion = (t?: HD_Ticket | null) =>
    t?.finalizadoAt ? dayjs(t.finalizadoAt) : dayjs();

  const respNow = nowForRespuesta(ticket);
  const resoNow = nowForResolucion(ticket);

  const asignadoAt = ticket?.asignadoAt ? dayjs(ticket.asignadoAt) : null;
  const respondedAt = ticket?.respondidoAt ? dayjs(ticket.respondidoAt) : null;
  const estimadoResp = ticket?.slaTicket?.tiempo_estimado_respuesta
    ? dayjs(ticket.slaTicket.tiempo_estimado_respuesta)
    : null;
  const responded = Boolean(ticket?.respondidoAt);

  const respPercentFinal = responded
    ? 100
    : calcPercent(
        ticket?.asignadoAt || "",
        ticket?.slaTicket?.tiempo_estimado_respuesta,
        respNow
      );

  const respCumplido =
    responded && estimadoResp
      ? respondedAt!.isSameOrBefore(estimadoResp)
      : undefined;

  const respStatus: ProgressStatus = responded
    ? respCumplido
      ? "success"
      : "exception"
    : humanRemaining(ticket?.slaTicket?.tiempo_estimado_respuesta, respNow) ===
      "Vencido"
    ? "exception"
    : "active";

  const colorBadge = (estado: EstadoBadge) =>
    estado === "En tiempo" || estado === "Cumplido"
      ? "green"
      : estado === "Vencido" || estado === "Fuera de tiempo"
      ? "red"
      : "default";

  const respBadgeText: EstadoBadge = responded
    ? respCumplido
      ? "Cumplido"
      : "Fuera de tiempo"
    : humanRemaining(ticket?.slaTicket?.tiempo_estimado_respuesta, respNow) ===
      "Vencido"
    ? "Vencido"
    : estimadoResp && asignadoAt
    ? "En tiempo"
    : "N/A";

  const respRemaining = humanRemaining(
    ticket?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  const estimadoRes = ticket?.slaTicket?.tiempo_estimado_resolucion
    ? dayjs(ticket.slaTicket.tiempo_estimado_resolucion)
    : null;
  const finalized = Boolean(ticket?.finalizadoAt);
  const finalizedAt = ticket?.finalizadoAt ? dayjs(ticket.finalizadoAt) : null;

  const resPercentFinal = finalized
    ? 100
    : calcPercent(
        ticket?.asignadoAt || "",
        ticket?.slaTicket?.tiempo_estimado_resolucion || "",
        resoNow
      );

  const resCumplido =
    finalized && estimadoRes
      ? finalizedAt!.isSameOrBefore(estimadoRes)
      : undefined;

  const resStatus: ProgressStatus = finalized
    ? resCumplido
      ? "success"
      : "exception"
    : humanRemaining(
        ticket?.slaTicket?.tiempo_estimado_resolucion || "",
        resoNow
      ) === "Vencido"
    ? "exception"
    : "active";

  const resBadgeText: EstadoBadge = finalized
    ? resCumplido
      ? "Cumplido"
      : "Fuera de tiempo"
    : humanRemaining(
        ticket?.slaTicket?.tiempo_estimado_resolucion || "",
        resoNow
      ) === "Vencido"
    ? "Vencido"
    : estimadoRes && asignadoAt
    ? "En tiempo"
    : "N/A";

  const resoRemaining = humanRemaining(
    ticket?.slaTicket?.tiempo_estimado_resolucion || "",
    resoNow
  );

  // --- ASIGNACIÓN (informativo visible) ---
  const creadoAt = ticket?.createdAt ? dayjs(ticket.createdAt) : null;
  const asignacionMs = creadoAt
    ? asignadoAt
      ? asignadoAt.diff(creadoAt)
      : dayjs().diff(creadoAt)
    : 0;
  const asignacionExacta = creadoAt ? formatDurationDHm(asignacionMs) : "—";
  const asignacionHumana = creadoAt
    ? asignadoAt
      ? creadoAt.to(asignadoAt, true)
      : `Transcurridos ${creadoAt.to(dayjs(), true)}`
    : "—";

  return (
    <Card title="⏱️ SLA del Ticket" className="mb-6 rounded-xl shadow-sm">
      {/* ASIGNACIÓN */}
      <section className="mb-4">
        <Space align="baseline" className="w-full justify-between">
          <Text strong className="uppercase text-xs tracking-wide">
            Tiempo de ASIGNACIÓN
          </Text>
          <Tag color={asignadoAt ? "blue" : "gold"}>
            {asignadoAt ? "Asignado" : "Pendiente"}
          </Tag>
        </Space>

        <div className="mt-2">
          <Space size={16} wrap>
            <Statistic title="Total (exacto)" value={asignacionExacta} />
            <Text type="secondary">(~{asignacionHumana})</Text>
          </Space>

          <div className="mt-2 text-xs text-gray-600">
            Creado: {creadoAt ? creadoAt.format("DD/MM/YYYY HH:mm") : "—"}
            <br />
            Asignado: {asignadoAt ? asignadoAt.format("DD/MM/YYYY HH:mm") : "—"}
          </div>
        </div>
      </section>

      <Divider className="my-4" />

      {/* RESPUESTA */}
      <section>
        <Space align="baseline" className="w-full justify-between">
          <Text strong className="uppercase text-xs tracking-wide">
            Tiempo de RESPUESTA
          </Text>
          <Tag color={colorBadge(respBadgeText)}>{respBadgeText}</Tag>
        </Space>

        <div className="mt-2">
          <Progress
            percent={respPercentFinal}
            status={respStatus}
            size="small"
          />
          <div className="mt-2 text-xs text-gray-600">
            Inicio: {asignadoAt ? asignadoAt.format("DD/MM/YYYY HH:mm") : "—"}
            <br />
            Vence:{" "}
            {estimadoResp ? estimadoResp.format("DD/MM/YYYY HH:mm") : "—"}
            {respondedAt && (
              <>
                <br />
                Respondido: {respondedAt.format("DD/MM/YYYY HH:mm")}
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {respondedAt
              ? respCumplido
                ? "Respondido dentro del SLA"
                : `Respondido ${respondedAt.to(
                    estimadoResp!,
                    true
                  )} después del límite`
              : respRemaining}
          </div>
        </div>
      </section>

      <Divider className="my-4" />

      {/* RESOLUCIÓN */}
      <section>
        <Space align="baseline" className="w-full justify-between">
          <Text strong className="uppercase text-xs tracking-wide">
            Tiempo de RESOLUCIÓN
          </Text>
          <Tag color={colorBadge(resBadgeText)}>{resBadgeText}</Tag>
        </Space>

        <div className="mt-2">
          <Progress percent={resPercentFinal} status={resStatus} size="small" />
          <div className="mt-2 text-xs text-gray-600">
            Inicio: {asignadoAt ? asignadoAt.format("DD/MM/YYYY HH:mm") : "—"}
            <br />
            Vence: {estimadoRes ? estimadoRes.format("DD/MM/YYYY HH:mm") : "—"}
            {finalizedAt && (
              <>
                <br />
                Finalizado: {finalizedAt.format("DD/MM/YYYY HH:mm")}
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {finalizedAt
              ? resCumplido
                ? "Resuelto dentro del SLA"
                : `Resuelto ${finalizedAt.to(
                    estimadoRes!,
                    true
                  )} después del límite`
              : resoRemaining}
          </div>
        </div>
      </section>

      {typeof ticket?.slaTicket?.cumplido === "boolean" && (
        <Alert
          className="mt-4"
          type={ticket.slaTicket.cumplido ? "success" : "warning"}
          showIcon
          message={
            ticket.slaTicket.cumplido
              ? "SLA global CUMPLIDO"
              : "SLA global NO cumplido"
          }
        />
      )}
    </Card>
  );
}
