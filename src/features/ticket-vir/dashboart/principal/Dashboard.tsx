"use client";

// Requisitos mínimos:
// npm i antd @ant-design/plots
// Se permite Tailwind. No se usa dnd-kit ni CSS global adicional.

import React from "react";
import {
  Layout,
  Card,
  Col,
  Row,
  Statistic,
  Tag,
  Progress,
  Divider,
  Space,
  Typography,
  Button,
  Modal,
  Switch,
  Tooltip,
  Skeleton,
} from "antd";
import {
  SettingOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  RedoOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";

// Evitar SSR con G2 v5 (@ant-design/plots v2)
const Pie: any = dynamic(() => import("@ant-design/plots").then((m) => m.Pie), {
  ssr: false,
});
const Column: any = dynamic(
  () => import("@ant-design/plots").then((m) => m.Column),
  { ssr: false }
);
const Line: any = dynamic(
  () => import("@ant-design/plots").then((m) => m.Line),
  { ssr: false }
);
const Bar: any = dynamic(() => import("@ant-design/plots").then((m) => m.Bar), {
  ssr: false,
});

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// ===================== Sección genérica =====================
function SectionCard({
  title,
  hidden,
  children,
}: {
  title: string;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return null;
  return (
    <Card className="shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      {children}
    </Card>
  );
}

export default function DashboardView() {
  // ===================== DATA ESTÁTICA =====================
  const kpis = {
    abiertos: 120,
    enProceso: 85,
    cerrados: 560,
    frtCumplimiento: 0.87, // 87%
    ttrCumplimiento: 0.74, // 74%
    tiempoRespuestaProm: 15,
    tiempoRespuestaMeta: 20,
    tiempoResolucionProm: 135,
    tiempoResolucionMeta: 120,
    satisfaccionPromedio: 4.3,
  };

  const distEstados = [
    { type: "Abiertos", value: kpis.abiertos },
    { type: "En Proceso", value: kpis.enProceso },
    { type: "Cerrados", value: kpis.cerrados },
  ];

  const cumplidosVsVencidos = [
    { mes: "Ene", tipo: "Cumplidos", value: 80 },
    { mes: "Ene", tipo: "Vencidos", value: 20 },
    { mes: "Feb", tipo: "Cumplidos", value: 100 },
    { mes: "Feb", tipo: "Vencidos", value: 30 },
    { mes: "Mar", tipo: "Cumplidos", value: 90 },
    { mes: "Mar", tipo: "Vencidos", value: 40 },
    { mes: "Abr", tipo: "Cumplidos", value: 120 },
    { mes: "Abr", tipo: "Vencidos", value: 25 },
  ];

  const tendencia = [
    { mes: "Ene", tipo: "Respuesta", value: 85 },
    { mes: "Feb", tipo: "Respuesta", value: 90 },
    { mes: "Mar", tipo: "Respuesta", value: 88 },
    { mes: "Abr", tipo: "Respuesta", value: 87 },
    { mes: "Ene", tipo: "Resolución", value: 70 },
    { mes: "Feb", tipo: "Resolución", value: 75 },
    { mes: "Mar", tipo: "Resolución", value: 72 },
    { mes: "Abr", tipo: "Resolución", value: 74 },
  ];

  const satisfaccion = [
    { categoria: "Muy Satisfecho", value: 50 },
    { categoria: "Satisfecho", value: 30 },
    { categoria: "Neutral", value: 10 },
    { categoria: "Insatisfecho", value: 10 },
  ];

  // ===================== CONFIG GRÁFICOS (v2) =====================
  const totalEstados = distEstados.reduce((a, b) => a + b.value, 0);

  const pieEstadosCfg = {
    data: distEstados,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      position: "inside",
      text: (d: any) => `${Math.round((d.value / totalEstados) * 100)}%`,
      style: { fontSize: 14 },
    },
    interactions: [{ type: "element-highlight" }],
  } as any;

  const barrasTiempoRespuestaCfg = {
    data: [
      { tipo: "Promedio", value: kpis.tiempoRespuestaProm },
      { tipo: "Meta", value: kpis.tiempoRespuestaMeta },
    ],
    xField: "tipo",
    yField: "value",
    columnWidthRatio: 0.5,
    label: { position: "top" as const },
  } as any;

  const barrasTiempoResolucionCfg = {
    data: [
      { tipo: "Promedio", value: kpis.tiempoResolucionProm },
      { tipo: "Meta", value: kpis.tiempoResolucionMeta },
    ],
    xField: "tipo",
    yField: "value",
    columnWidthRatio: 0.5,
    label: { position: "top" as const },
  } as any;

  const stackedCumplidosCfg = {
    data: cumplidosVsVencidos,
    xField: "mes",
    yField: "value",
    seriesField: "tipo",
    stack: true,
  } as any;

  const lineTendenciaCfg = {
    data: tendencia,
    xField: "mes",
    yField: "value",
    seriesField: "tipo",
    shape: "smooth",
    yAxis: { min: 0, max: 100 },
    tooltip: { showMarkers: true },
  } as any;

  const barSatisfaccionCfg = {
    data: satisfaccion,
    xField: "value",
    yField: "categoria",
    seriesField: "categoria",
    legend: false,
  } as any;

  // ===================== VISIBILIDAD (sin DnD) =====================
  type SectionId =
    | "kpiCards"
    | "pieEstados"
    | "frtGauge"
    | "ttrGauge"
    | "tiemposRespuesta"
    | "tiemposResolucion"
    | "cumplidosVencidos"
    | "tendenciaSLA"
    | "satisfaccionKPI"
    | "satisfaccionDistrib";

  const ALL_SECTIONS: { id: SectionId; title: string }[] = [
    { id: "kpiCards", title: "KPIs de Tickets" },
    { id: "pieEstados", title: "Distribución por Estado" },
    { id: "frtGauge", title: "SLA Respuesta (FRT)" },
    { id: "ttrGauge", title: "SLA Resolución (TTR)" },
    { id: "tiemposRespuesta", title: "Tiempo de Respuesta – Prom vs Meta" },
    { id: "tiemposResolucion", title: "Tiempo de Resolución – Prom vs Meta" },
    { id: "cumplidosVencidos", title: "Cumplidos vs Vencidos (mensual)" },
    { id: "tendenciaSLA", title: "Tendencia Cumplimiento SLA" },
    { id: "satisfaccionKPI", title: "Satisfacción Promedio" },
    { id: "satisfaccionDistrib", title: "Distribución de Satisfacción" },
  ];

  const FIXED_ORDER: SectionId[] = [
    "kpiCards",
    "pieEstados",
    "frtGauge",
    "ttrGauge",
    "tiemposRespuesta",
    "tiemposResolucion",
    "cumplidosVencidos",
    "tendenciaSLA",
    "satisfaccionKPI",
    "satisfaccionDistrib",
  ];

  const [mounted, setMounted] = React.useState(false);
  const [hidden, setHidden] = React.useState<Record<SectionId, boolean>>(
    {} as Record<SectionId, boolean>
  );

  React.useEffect(() => {
    setMounted(true);
    try {
      const savedHidden = localStorage.getItem("sla_dashboard_hidden");
      if (savedHidden) setHidden(JSON.parse(savedHidden));
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sla_dashboard_hidden", JSON.stringify(hidden));
  }, [hidden, mounted]);

  const toggleHidden = (id: SectionId, value: boolean) => {
    setHidden((prev) => ({ ...prev, [id]: value }));
  };

  const resetVisibility = () => setHidden({} as Record<SectionId, boolean>);

  // Helpers visuales
  const statusTag = (value: number) => {
    if (value >= 0.8) return <Tag color="green">Alto</Tag>;
    if (value >= 0.6) return <Tag color="orange">Medio</Tag>;
    return <Tag color="red">Bajo</Tag>;
  };

  const [openCustomize, setOpenCustomize] = React.useState(false);

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Title
              level={3}
              className="!mb-0 text-[white]"
              style={{ color: "white" }}
            >
              Dashboard SLA – Mesa de Ayuda (Demo estática)
            </Title>
            <Text type="secondary">
              Calidad del servicio (SLA) y métricas clave
            </Text>
          </div>
          <Space>
            <Tooltip title="Restablecer visibilidad">
              <Button icon={<RedoOutlined />} onClick={resetVisibility}>
                Reset
              </Button>
            </Tooltip>
            <Tooltip title="Personalizar visibilidad">
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => setOpenCustomize(true)}
              >
                Personalizar
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Header>

      <Content>
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {!mounted ? (
            <Card className="shadow-sm">
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {/* KPIs */}
              {!hidden.kpiCards && (
                <Col xs={24}>
                  <SectionCard title="KPIs de Tickets">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-sm h-full">
                          <Statistic title="Abiertos" value={kpis.abiertos} />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-sm h-full">
                          <Statistic
                            title="En Proceso"
                            value={kpis.enProceso}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-sm h-full">
                          <Statistic title="Cerrados" value={kpis.cerrados} />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-sm h-full">
                          <Space
                            direction="vertical"
                            size="small"
                            className="w-full"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Cumpl. FRT</span>
                              {statusTag(kpis.frtCumplimiento)}
                            </div>
                            <Progress
                              type="dashboard"
                              percent={Math.round(kpis.frtCumplimiento * 100)}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Cumpl. TTR</span>
                              {statusTag(kpis.ttrCumplimiento)}
                            </div>
                            <Progress
                              type="dashboard"
                              percent={Math.round(kpis.ttrCumplimiento * 100)}
                            />
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                  </SectionCard>
                </Col>
              )}

              {/* Fila 1 */}
              <Col xs={24} md={12}>
                {!hidden.pieEstados && (
                  <SectionCard title="Distribución por Estado">
                    <Pie {...pieEstadosCfg} />
                  </SectionCard>
                )}
              </Col>

              <Col xs={24} md={12}>
                {!hidden.frtGauge && (
                  <SectionCard title="SLA Respuesta (FRT)">
                    <div className="flex flex-col items-center justify-center py-2">
                      <Progress
                        type="dashboard"
                        percent={Math.round(kpis.frtCumplimiento * 100)}
                        format={(p) => `${p}%`}
                      />
                      <Text type="secondary" className="mt-2">
                        Meta ≥ 80%
                      </Text>
                    </div>
                  </SectionCard>
                )}
              </Col>

              {/* Fila 2 */}
              <Col xs={24} md={12}>
                {!hidden.ttrGauge && (
                  <SectionCard title="SLA Resolución (TTR)">
                    <div className="flex flex-col items-center justify-center py-2">
                      <Progress
                        type="dashboard"
                        percent={Math.round(kpis.ttrCumplimiento * 100)}
                        format={(p) => `${p}%`}
                      />
                      <Text type="secondary" className="mt-2">
                        Meta ≥ 80%
                      </Text>
                    </div>
                  </SectionCard>
                )}
              </Col>

              <Col xs={24} md={12}>
                {!hidden.tiemposRespuesta && (
                  <SectionCard title="Tiempo de Respuesta – Prom vs Meta">
                    <Column {...barrasTiempoRespuestaCfg} />
                  </SectionCard>
                )}
              </Col>

              {/* Fila 3 */}
              <Col xs={24} md={12}>
                {!hidden.tiemposResolucion && (
                  <SectionCard title="Tiempo de Resolución – Prom vs Meta">
                    <Column {...barrasTiempoResolucionCfg} />
                  </SectionCard>
                )}
              </Col>

              <Col xs={24} md={12}>
                {!hidden.cumplidosVencidos && (
                  <SectionCard title="Cumplidos vs Vencidos (mensual)">
                    <Column {...stackedCumplidosCfg} />
                  </SectionCard>
                )}
              </Col>

              {/* Fila 4 */}
              <Col xs={24} md={12}>
                {!hidden.tendenciaSLA && (
                  <SectionCard title="Tendencia Cumplimiento SLA">
                    <Line {...lineTendenciaCfg} />
                  </SectionCard>
                )}
              </Col>

              <Col xs={24} md={12}>
                {!hidden.satisfaccionKPI && (
                  <SectionCard title="Satisfacción Promedio">
                    <Statistic
                      title="Promedio"
                      value={kpis.satisfaccionPromedio}
                      suffix="/ 5"
                      precision={1}
                    />
                  </SectionCard>
                )}
              </Col>

              {/* Fila 5 */}
              <Col xs={24}>
                {!hidden.satisfaccionDistrib && (
                  <SectionCard title="Distribución de Satisfacción">
                    <Bar {...barSatisfaccionCfg} />
                  </SectionCard>
                )}
              </Col>
            </Row>
          )}

          <Divider className="!mt-8" />
          <p className="text-center text-gray-400 text-xs">
            Demo estática • UMA Service Desk • Personaliza visibilidad; se
            guarda en localStorage.
          </p>
        </div>
      </Content>

      <Modal
        title={
          <Space>
            <SlidersOutlined />
            <span>Personalizar secciones</span>
          </Space>
        }
        open={openCustomize}
        onCancel={() => setOpenCustomize(false)}
        onOk={() => setOpenCustomize(false)}
        okText="Guardar"
      >
        <Space direction="vertical" className="w-full">
          {ALL_SECTIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-1">
              <span>{s.title}</span>
              <Space>
                <Tooltip title={hidden[s.id] ? "Mostrar" : "Ocultar"}>
                  <Switch
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                    checked={!hidden[s.id]}
                    onChange={(checked) => toggleHidden(s.id, !checked)}
                  />
                </Tooltip>
              </Space>
            </div>
          ))}
        </Space>
      </Modal>
    </Layout>
  );
}
