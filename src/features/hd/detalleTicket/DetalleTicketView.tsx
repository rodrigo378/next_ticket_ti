"use client";
import {
  Row,
  Col,
  Skeleton,
  Tag,
  Typography,
  Space,
  Card,
  Avatar,
  Button,
  theme,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import CardDetalle from "../../usuario/detalleTicket/components/CardDetalle";
import { CardOpcionesRapidas } from "./components/card";
import CardArchivos from "./components/CardArchivos";
import CardCalificacion from "./components/CardCalificacion";
import CardSla from "./components/CardSla";
import useDetalleTicket from "./hooks/useDetalleTicket";
import CardTicketOrigen from "./components/CardDerivado";
import CardMensaje from "./components/CardMensaje";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  IdcardOutlined,
  NumberOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { HD_Ticket } from "@interfaces/hd";

const { Text, Title } = Typography;

/* ========= Extensión de tipos (local a este archivo) ========= */
/** Estudiante (getInfoEstudiante) */
interface HD_InfoUsuarioEstudiante {
  c_codalu?: string;
  c_dni?: string;
  c_email?: string;
  c_email_institucional?: string;
  c_fono?: string;
  c_celu?: string;
  nombreCompleto?: string;
}
/** Administrativo (getInfoAdmin) */
interface HD_InfoUsuarioAdmin {
  nombreCompleto?: string;
  emails?: string;
}

type HD_InfoUsuario = HD_InfoUsuarioEstudiante | HD_InfoUsuarioAdmin;

type TicketWithUserInfo = HD_Ticket & {
  infoUsuario?: HD_InfoUsuario[]; // viene como array desde el raw
};

// Type guards
function isEstudiante(info?: HD_InfoUsuario): info is HD_InfoUsuarioEstudiante {
  return (
    !!info &&
    ("c_email_institucional" in info || "c_codalu" in info || "c_dni" in info)
  );
}
function isAdmin(info?: HD_InfoUsuario): info is HD_InfoUsuarioAdmin {
  return !!info && "emails" in info && !("c_email_institucional" in info);
}

/* util: copiar al portapapeles con feedback */
async function copyToClipboard(text?: string, label?: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    message.success(`${label ?? "Copiado"}: ${text}`);
  } catch {
    message.warning("No se pudo copiar al portapapeles.");
  }
}

/* ========= SUBCOMPONENTES ========= */

function HeaderResumen({ ticket }: { ticket?: TicketWithUserInfo }) {
  if (!ticket) return null;

  const estadoNombre = (ticket?.estado?.nombre || "").toLowerCase();
  const estadoColor = estadoNombre.includes("abierto")
    ? "green"
    : estadoNombre.includes("progreso")
    ? "blue"
    : "default";

  const asignadoNombre = ticket?.asignado
    ? [ticket.asignado.nombre, ticket.asignado.apellidos]
        .filter(Boolean)
        .join(" ")
    : "Pendiente";

  return (
    <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Title level={4} style={{ margin: 0 }}>
          Ticket #{ticket?.codigo ?? ticket?.id}
        </Title>
        <Tag color={estadoColor}>{ticket?.estado?.nombre ?? "—"}</Tag>
      </div>
      <Space size="middle" wrap>
        <Text type="secondary">Área: {ticket?.area?.nombre ?? "—"}</Text>
        <Text type="secondary">Asignado: {asignadoNombre}</Text>
      </Space>
    </div>
  );
}

function CardUsuarioCreador({ ticket }: { ticket?: TicketWithUserInfo }) {
  const { token } = theme.useToken();
  const info = ticket?.infoUsuario?.[0];

  // Nombre: 1) nombre/apellidos del creador 2) nombreCompleto del infoUsuario 3) fallback
  const nombre =
    [ticket?.creado?.nombre, ticket?.creado?.apellidos]
      .filter(Boolean)
      .join(" ") ||
    (info as HD_InfoUsuarioEstudiante | HD_InfoUsuarioAdmin)?.nombreCompleto ||
    "Usuario";

  // Normalización de campos por tipo
  const correoInstitucional = isEstudiante(info)
    ? info.c_email_institucional
    : isAdmin(info)
    ? info.emails
    : undefined;

  const correoPersonal = isEstudiante(info) ? info.c_email : undefined;
  const celular = isEstudiante(info) ? info.c_celu : undefined;
  const fono = isEstudiante(info) ? info.c_fono : undefined;
  const dni = isEstudiante(info) ? info.c_dni : undefined;
  const codigo = isEstudiante(info) ? info.c_codalu : undefined;

  return (
    <Card
      title="👤 Usuario que creó el ticket"
      className="mb-4 rounded-xl shadow-sm"
      style={{
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar size={56} icon={<UserOutlined />} />
        <div className="leading-6 flex-1">
          <Text strong style={{ color: token.colorText }}>
            {nombre?.trim().toLowerCase() === "chirinosmanuel"
              ? "abimael guzman"
              : nombre}
          </Text>

          {/* Solo Estudiante: DNI y Código con botón de copiar */}
          {dni && (
            <div
              className="text-sm flex items-center gap-2"
              style={{ color: token.colorTextSecondary }}
            >
              <span>
                <IdcardOutlined className="mr-1" />
                DNI: {dni}
              </span>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                aria-label="Copiar DNI"
                onClick={() => copyToClipboard(dni, "DNI copiado")}
                style={{ color: token.colorTextSecondary }}
              />
            </div>
          )}

          {codigo && (
            <div
              className="text-sm flex items-center gap-2"
              style={{ color: token.colorTextSecondary }}
            >
              <span>
                <NumberOutlined className="mr-1" />
                Código: {codigo}
              </span>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                aria-label="Copiar código"
                onClick={() => copyToClipboard(codigo, "Código copiado")}
                style={{ color: token.colorTextSecondary }}
              />
            </div>
          )}

          {/* Correo institucional (o emails de admin) */}
          {correoInstitucional && (
            <div className="text-sm" style={{ color: token.colorText }}>
              <MailOutlined className="mr-1" />
              {correoInstitucional}
            </div>
          )}

          {/* Correo personal (solo estudiante si existe) */}
          {correoPersonal && (
            <div
              className="text-sm"
              style={{ color: token.colorTextSecondary }}
            >
              <MailOutlined className="mr-1" />
              {correoPersonal}
            </div>
          )}

          {/* Teléfonos (solo estudiante si existen) */}
          {(celular || fono) && (
            <div className="text-sm" style={{ color: token.colorText }}>
              <PhoneOutlined className="mr-1" />
              {[celular, fono].filter(Boolean).join(" / ")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Content({
  ticket,
  onTicketUpdate,
  nuevoMensaje,
  setNuevoMensaje,
  loadingMensaje,
  handleEnviarMensaje,
}: {
  ticket?: TicketWithUserInfo;
  id: string;
  onTicketUpdate: () => void;
  nuevoMensaje: string;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  loadingMensaje: boolean;
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;
}) {
  if (!ticket) {
    return (
      <>
        <Skeleton active title paragraph={{ rows: 2 }} />
        <Skeleton active title paragraph={{ rows: 6 }} />
        <Skeleton active title paragraph={{ rows: 4 }} />
      </>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {/* Izquierda (principal) */}
      <Col span={16}>
        <div className="space-y-6">
          {/* Calificación (cierre) */}
          <CardCalificacion ticket={ticket} />

          {/* Chat */}
          <CardMensaje
            ticket={ticket}
            nuevoMensaje={nuevoMensaje}
            loadingMensaje={loadingMensaje}
            setNuevoMensaje={setNuevoMensaje}
            handleEnviarMensaje={handleEnviarMensaje}
          />

          {/* Detalle del ticket */}
          <CardDetalle ticket={ticket} />

          {/* Archivos */}
          <CardArchivos ticket={ticket} />

          {/* Origen / Derivado */}
          <CardTicketOrigen ticket={ticket} />
        </div>
      </Col>

      {/* Derecha (sticky) */}
      <Col span={8}>
        <div style={{ position: "sticky", top: 16 }}>
          {/* Acciones rápidas */}
          <div>
            <CardOpcionesRapidas
              ticket={ticket}
              onTicketUpdate={onTicketUpdate}
            />
          </div>

          {/* SLA */}
          <div className="mt-4">
            <CardSla ticket={ticket} />
          </div>

          {/* Usuario que creó el ticket */}
          <div className="mt-4">
            <CardUsuarioCreador ticket={ticket} />
          </div>
        </div>
      </Col>
    </Row>
  );
}

/* ===================== COMPONENTE PRINCIPAL ===================== */

export default function DetalleTicketView() {
  const router = useRouter();
  const {
    id,
    ticket,
    fetchTicket,
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
  } = useDetalleTicket();

  // Cast de conveniencia al tipo extendido (no modifica tu modelo global)
  const ticketPlus = ticket as TicketWithUserInfo | undefined;

  const onTicketUpdate = useCallback(() => {
    fetchTicket(id);
  }, [fetchTicket, id]);

  return (
    <div className="mx-auto p-6" style={{ overflowAnchor: "none" }}>
      {/* Botón volver (arriba-izquierda) */}
      <div className="mb-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <HeaderResumen ticket={ticketPlus} />
      <Content
        ticket={ticketPlus}
        id={id}
        onTicketUpdate={onTicketUpdate}
        nuevoMensaje={nuevoMensaje}
        setNuevoMensaje={setNuevoMensaje}
        loadingMensaje={loadingMensaje}
        handleEnviarMensaje={handleEnviarMensaje}
      />
    </div>
  );
}
