"use client";

// Requisitos:
// npm i antd @ant-design/plots
// Importa el reset CSS de Ant Design en tu layout global (app/layout.tsx o _app.tsx):
// import "antd/dist/reset.css";

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
} from "antd";
import { Pie, Column, Line, Bar } from "@ant-design/plots";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

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

  // ===================== CONFIG GRÁFICOS =====================
  const pieEstadosCfg = {
    data: distEstados,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: { fontSize: 14 },
    },
    interactions: [{ type: "element-active" }],
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
    isStack: true,
    xField: "mes",
    yField: "value",
    seriesField: "tipo",
    label: false,
  } as any;

  const lineTendenciaCfg = {
    data: tendencia,
    xField: "mes",
    yField: "value",
    seriesField: "tipo",
    smooth: true,
    yAxis: { min: 0, max: 100 },
    tooltip: { showMarkers: true },
    annotations: [
      {
        type: "line",
        start: ["min", 80],
        end: ["max", 80],
        style: { stroke: "#999", lineDash: [4, 4] },
        text: { content: "Meta 80%", position: "start" },
      },
    ],
  } as any;

  const barSatisfaccionCfg = {
    data: satisfaccion,
    xField: "value",
    yField: "categoria",
    seriesField: "categoria",
    legend: false,
  } as any;

  // Helpers visuales
  const statusTag = (value: number) => {
    if (value >= 0.8) return <Tag color="green">Alto</Tag>;
    if (value >= 0.6) return <Tag color="orange">Medio</Tag>;
    return <Tag color="red">Bajo</Tag>;
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Title level={3} className="!mb-0">
            Dashboard SLA – Mesa de Ayuda (Demo estática)
          </Title>
          <Text type="secondary">
            Calidad del servicio (SLA) y métricas clave
          </Text>
        </div>
      </Header>

      <Content>
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* ===================== KPI CARDS ===================== */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic title="Tickets Abiertos" value={kpis.abiertos} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic title="En Proceso" value={kpis.enProceso} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic title="Cerrados" value={kpis.cerrados} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Space direction="vertical" size="small" className="w-full">
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

          {/* ===================== DISTRIBUCIÓN & GAUGES ===================== */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={10}>
              <Card
                title="Distribución por estado"
                className="shadow-sm h-full"
              >
                <Pie {...pieEstadosCfg} />
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card
                    title="SLA Respuesta (FRT)"
                    className="shadow-sm h-full"
                  >
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
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    title="SLA Resolución (TTR)"
                    className="shadow-sm h-full"
                  >
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
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* ===================== TIEMPOS PROMEDIO VS META ===================== */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Tiempo de Respuesta (min) – Promedio vs Meta"
                className="shadow-sm h-full"
              >
                <Column {...barrasTiempoRespuestaCfg} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Tiempo de Resolución (min) – Promedio vs Meta"
                className="shadow-sm h-full"
              >
                <Column {...barrasTiempoResolucionCfg} />
              </Card>
            </Col>
          </Row>

          {/* ===================== CUMPLIDOS VS VENCIDOS & TENDENCIA SLA ===================== */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Tickets Cumplidos vs Vencidos (mensual)"
                className="shadow-sm h-full"
              >
                <Column {...stackedCumplidosCfg} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Tendencia Cumplimiento SLA"
                className="shadow-sm h-full"
              >
                <Line {...lineTendenciaCfg} />
              </Card>
            </Col>
          </Row>

          {/* ===================== SATISFACCIÓN ===================== */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title="Satisfacción Promedio"
                  value={kpis.satisfaccionPromedio}
                  suffix="/ 5"
                  precision={1}
                />
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card
                title="Distribución de Satisfacción"
                className="shadow-sm h-full"
              >
                <Bar {...barSatisfaccionCfg} />
              </Card>
            </Col>
          </Row>

          <Divider className="!mt-8" />
          <p className="text-center text-gray-400 text-xs">
            Demo estática • UMA Service Desk • Mapea estos gráficos a tus
            endpoints reales cuando estén listos.
          </p>
        </div>
      </Content>
    </Layout>
  );
}
