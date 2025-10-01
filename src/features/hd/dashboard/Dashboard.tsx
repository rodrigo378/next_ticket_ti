"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Progress,
  Select,
  Tabs,
} from "antd";
import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  ExclamationCircleTwoTone,
  FolderOpenTwoTone,
  ThunderboltTwoTone,
  SwapRightOutlined,
} from "@ant-design/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const { Title: H1, Text } = Typography;
const { Option } = Select;

/* ============================
  PALETA DE COLORES VIBRANTE
============================ */
const palette = {
  indigo: "#6366F1",
  emerald: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  violet: "#8B5CF6",
  cyan: "#06B6D4",
  orange: "#F97316",
  blue: "#3B82F6",
  gray: "#9CA3AF",
};

/* ============================
   DATA ESTÁTICA (DEMO)
   (ajusta cuando conectes Prisma/MySQL)
============================ */
const dataPeriodoDemo = {
  diario: {
    creados: 18,
    resueltos: 12,
    backlog: 76,
    slaCumplidoPct: 82,
    tmaRespuestaMin: 38,
    tmrResolucionMin: 510,
    tmaAsignacionMin: 28,
  },
  semanal: {
    creados: 128,
    resueltos: 104,
    backlog: 76,
    slaCumplidoPct: 86,
    tmaRespuestaMin: 42,
    tmrResolucionMin: 560,
    tmaAsignacionMin: 25,
  },
  mensual: {
    creados: 540,
    resueltos: 498,
    backlog: 120,
    slaCumplidoPct: 89,
    tmaRespuestaMin: 40,
    tmrResolucionMin: 570,
    tmaAsignacionMin: 24,
  },
};

// Snapshot “HOY”
const hoyDemo = {
  creados: 22,
  asignados: 19,
  enProceso: 27,
  resueltos: 15,
  cancelados: 2,
  derivadosSalientes: 4,
  derivadosEntrantes: 3,
};

// Helpers demo
const labels7 = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const labels30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
function serieLineal(len: number, base: number, ruido = 5) {
  return Array.from({ length: len }, (_, i) =>
    Math.max(
      0,
      Math.round(base + (i - len / 2) * 0.8 + (Math.random() - 0.5) * ruido)
    )
  );
}

export default function DashboardAreaUMA() {
  /* ============================
     Rango Operativo (Tab 2 y 4)
  ============================ */
  const [rangeOps, setRangeOps] = useState<"diario" | "semanal" | "mensual">(
    "semanal"
  );
  const kpisPeriodo = dataPeriodoDemo[rangeOps];

  /* ============================
     Horizonte (Tab 3 - Evolución)
  ============================ */
  const [horizonte, setHorizonte] = useState<"7d" | "30d">("7d");

  /* ============================
     DATASETS — EVOLUCIÓN
  ============================ */
  // Creados vs Cerrados — siempre semanal (últimos 7 días)
  const creadosVsCerrados = useMemo(
    () => ({
      labels: labels7,
      datasets: [
        {
          label: "Creados",
          data: [18, 22, 19, 16, 24, 12, 17],
          borderWidth: 2,
          tension: 0.35,
          borderColor: palette.indigo,
          backgroundColor: "rgba(99,102,241,0.15)",
          pointBackgroundColor: palette.indigo,
        },
        {
          label: "Cerrados",
          data: [12, 20, 21, 15, 23, 10, 3],
          borderWidth: 2,
          tension: 0.35,
          borderColor: palette.emerald,
          backgroundColor: "rgba(16,185,129,0.15)",
          pointBackgroundColor: palette.emerald,
        },
      ],
    }),
    []
  );

  const labelsEvo = useMemo(
    () => (horizonte === "7d" ? labels7 : labels30),
    [horizonte]
  );

  const evoSLA = useMemo(
    () => ({
      labels: labelsEvo,
      datasets: [
        {
          label: "% SLA cumplido",
          data:
            horizonte === "7d"
              ? [82, 84, 88, 85, 86, 87, 89]
              : serieLineal(30, 85, 6),
          borderColor: palette.emerald,
          backgroundColor: "rgba(16,185,129,0.15)",
          tension: 0.35,
          borderWidth: 2,
        },
      ],
    }),
    [horizonte, labelsEvo]
  );

  const evoTMA = useMemo(
    () => ({
      labels: labelsEvo,
      datasets: [
        {
          label: "TMA respuesta (min)",
          data:
            horizonte === "7d"
              ? [44, 41, 39, 42, 40, 38, 37]
              : serieLineal(30, 41, 4),
          borderColor: palette.blue,
          backgroundColor: "rgba(59,130,246,0.15)",
          tension: 0.35,
          borderWidth: 2,
        },
      ],
    }),
    [horizonte, labelsEvo]
  );

  const evoTMR = useMemo(
    () => ({
      labels: labelsEvo,
      datasets: [
        {
          label: "TMR resolución (min)",
          data:
            horizonte === "7d"
              ? [590, 575, 560, 580, 570, 565, 550]
              : serieLineal(30, 570, 30),
          borderColor: palette.orange,
          backgroundColor: "rgba(249,115,22,0.15)",
          tension: 0.35,
          borderWidth: 2,
        },
      ],
    }),
    [horizonte, labelsEvo]
  );

  const evoTMAAsign = useMemo(
    () => ({
      labels: labelsEvo,
      datasets: [
        {
          label: "TMA asignación (min)",
          data:
            horizonte === "7d"
              ? [29, 27, 26, 25, 24, 26, 23]
              : serieLineal(30, 26, 5),
          borderColor: palette.violet,
          backgroundColor: "rgba(139,92,246,0.15)",
          tension: 0.35,
          borderWidth: 2,
        },
      ],
    }),
    [horizonte, labelsEvo]
  );

  /* ============================
     DATASETS — DISTRIBUCIONES
     (usan rangeOps del Tab 2)
  ============================ */
  const topCategorias = {
    labels: [
      "Software académico",
      "Correo institucional",
      "Impresoras",
      "Red/Internet",
      "Equipos de cómputo",
    ],
    datasets: [
      {
        label: "Tickets",
        data:
          rangeOps === "diario"
            ? [5, 4, 3, 3, 2]
            : rangeOps === "semanal"
            ? [32, 26, 21, 18, 14]
            : [110, 95, 80, 76, 62],
        backgroundColor: [
          palette.indigo,
          palette.orange,
          palette.violet,
          palette.cyan,
          palette.blue,
        ],
        borderWidth: 0,
      },
    ],
  };

  const prioridadValues =
    rangeOps === "diario"
      ? [3, 9, 8]
      : rangeOps === "semanal"
      ? [14, 58, 56]
      : [40, 180, 170];

  const prioridadColors = [palette.red, palette.amber, palette.emerald];
  const prioridadTotal = prioridadValues.reduce((a, b) => a + b, 0);

  const satisfaccion = {
    labels: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
    datasets: [
      {
        label: "Respuestas",
        data:
          rangeOps === "diario"
            ? [0, 1, 2, 4, 6]
            : rangeOps === "semanal"
            ? [2, 4, 9, 18, 31]
            : [10, 18, 35, 60, 95],
        backgroundColor: [
          palette.red,
          palette.orange,
          palette.amber,
          palette.blue,
          palette.emerald,
        ],
        borderWidth: 0,
      },
    ],
  };

  /* ============================
     SNAPSHOT — Estado actual
============================ */
  const backlogPorEstado = {
    labels: ["Abierto", "En proceso", "Resuelto (sin cerrar)", "Derivado"],
    datasets: [
      {
        label: "Tickets",
        data: [28, 31, 12, 5],
        backgroundColor: [
          palette.blue,
          palette.amber,
          palette.violet,
          palette.cyan,
        ],
        borderWidth: 0,
      },
    ],
  };

  /* ============================
     OPCIONES CHARTS
============================ */
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false, text: "" },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: "rgba(0,0,0,0.06)" } },
      y: { grid: { color: "rgba(0,0,0,0.06)" }, beginAtZero: true },
    },
  } as const;

  /* ============================
     TABS
============================ */
  const tabsItems = [
    /* Tab 1 — HOY (snapshot) */
    {
      key: "1",
      label: "Hoy",
      children: (
        <div className="space-y-6">
          <H1 level={3} className="!mb-0">
            Operación del día
          </H1>
          <Text type="secondary">
            Zona horaria Lima • KPIs del mismo día (snapshot)
          </Text>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Creados hoy"
                  value={hoyDemo.creados}
                  prefix={<FolderOpenTwoTone twoToneColor={palette.blue} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Asignados hoy"
                  value={hoyDemo.asignados}
                  prefix={<ClockCircleTwoTone twoToneColor={palette.indigo} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="En proceso hoy"
                  value={hoyDemo.enProceso}
                  prefix={<ClockCircleTwoTone twoToneColor={palette.cyan} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Resueltos hoy"
                  value={hoyDemo.resueltos}
                  prefix={<CheckCircleTwoTone twoToneColor={palette.emerald} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Cancelados hoy"
                  value={hoyDemo.cancelados}
                  prefix={
                    <ExclamationCircleTwoTone twoToneColor={palette.red} />
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Derivados hoy (sal.)"
                  value={hoyDemo.derivadosSalientes}
                  prefix={
                    <SwapRightOutlined style={{ color: palette.orange }} />
                  }
                />
                <div className="mt-1">
                  <Text type="secondary">
                    Entrantes: {hoyDemo.derivadosEntrantes}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            title="Resumen del día por estado"
            // style={{ border: "2px solid red" }}
            className="h-[400px]"
          >
            <Bar
              className="h-[300px]"
              data={{
                labels: [
                  "Creados",
                  "Asignados",
                  "En proceso",
                  "Resueltos",
                  "Cancelados",
                  "Derivados (sal.)",
                ],
                datasets: [
                  {
                    label: "Hoy",
                    data: [
                      hoyDemo.creados,
                      hoyDemo.asignados,
                      hoyDemo.enProceso,
                      hoyDemo.resueltos,
                      hoyDemo.cancelados,
                      hoyDemo.derivadosSalientes,
                    ],
                    backgroundColor: [
                      palette.blue,
                      palette.indigo,
                      palette.cyan,
                      palette.emerald,
                      palette.red,
                      palette.orange,
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={commonOptions}
            />
          </Card>
        </div>
      ),
    },

    /* Tab 2 — KPIs DEL PERÍODO (valor puntual) */
    {
      key: "2",
      label: "KPIs del período",
      children: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <H1 level={3} className="!mb-0">
                Valor puntual para reportes
              </H1>
              <Text type="secondary">
                Selecciona el rango operativo (hoy/semana/mes)
              </Text>
            </div>
            <Select
              value={rangeOps}
              onChange={(v) => setRangeOps(v)}
              style={{ width: 160 }}
            >
              <Option value="diario">Hoy</Option>
              <Option value="semanal">Semana</Option>
              <Option value="mensual">Mes</Option>
            </Select>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Tickets creados"
                  value={kpisPeriodo.creados}
                  prefix={<FolderOpenTwoTone twoToneColor={palette.blue} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Tickets resueltos"
                  value={kpisPeriodo.resueltos}
                  prefix={<CheckCircleTwoTone twoToneColor={palette.emerald} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Backlog activo"
                  value={kpisPeriodo.backlog}
                  prefix={
                    <ExclamationCircleTwoTone twoToneColor={palette.amber} />
                  }
                />
                <div className="mt-4">
                  <Text type="secondary">
                    *Snapshot actual — no depende del rango
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="% SLA cumplido"
                  value={kpisPeriodo.slaCumplidoPct}
                  suffix="%"
                  prefix={<ThunderboltTwoTone twoToneColor={palette.violet} />}
                />
                <div className="mt-3 flex items-center justify-center">
                  <Progress
                    type="dashboard"
                    percent={kpisPeriodo.slaCumplidoPct}
                    strokeColor={palette.emerald}
                    trailColor="#e5e7eb"
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="TMA respuesta"
                  value={kpisPeriodo.tmaRespuestaMin}
                  suffix="min"
                  prefix={<ClockCircleTwoTone twoToneColor={palette.blue} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="TMR resolución"
                  value={kpisPeriodo.tmrResolucionMin}
                  suffix="min"
                  prefix={<ClockCircleTwoTone twoToneColor={palette.orange} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="TMA asignación"
                  value={kpisPeriodo.tmaAsignacionMin}
                  suffix="min"
                  prefix={<ClockCircleTwoTone twoToneColor={palette.violet} />}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },

    /* Tab 3 — EVOLUCIÓN (tendencia) */
    {
      key: "3",
      label: "Evolución",
      children: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <H1 level={3} className="!mb-0">
                Tendencia y mejora continua
              </H1>
              <Text type="secondary">
                Elige horizonte (no afecta los KPIs puntuales)
              </Text>
            </div>
            <Select
              value={horizonte}
              onChange={(v) => setHorizonte(v)}
              style={{ width: 180 }}
            >
              <Option value="7d">Últimos 7 días</Option>
              <Option value="30d">Últimos 30 días</Option>
            </Select>
          </div>

          <Card title="Creados vs Cerrados (semanal)">
            <Line data={creadosVsCerrados} options={commonOptions} />
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Evolución SLA (%)">
                <Line data={evoSLA} options={commonOptions} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Evolución TMA (min)">
                <Line data={evoTMA} options={commonOptions} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Evolución TMR (min)">
                <Line data={evoTMR} options={commonOptions} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Evolución TMA asignación (min)">
                <Line data={evoTMAAsign} options={commonOptions} />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },

    /* Tab 4 — DISTRIBUCIÓN (composición) */
    {
      key: "4",
      label: "Distribución",
      children: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <H1 level={3} className="!mb-0">
                Foco/carga por categorías y prioridades
              </H1>
              <Text type="secondary">
                Usa el mismo rango operativo que “KPIs del período”
              </Text>
            </div>
            <Select
              value={rangeOps}
              onChange={(v) => setRangeOps(v)}
              style={{ width: 160 }}
            >
              <Option value="diario">Hoy</Option>
              <Option value="semanal">Semana</Option>
              <Option value="mensual">Mes</Option>
            </Select>
          </div>

          <Card title="Top categorías">
            <Bar data={topCategorias} options={commonOptions} />
          </Card>

          <Row gutter={[16, 16]}>
            {(["Alta", "Media", "Baja"] as const).map((label, idx) => {
              const value = prioridadValues[idx];
              const pct = Math.round((value / prioridadTotal) * 100);
              const color = prioridadColors[idx];
              return (
                <Col xs={24} md={8} key={label}>
                  <Card title={`Prioridad ${label}`}>
                    <div className="flex items-center justify-between">
                      <Statistic value={value} suffix=" tickets" />
                      <span className="font-medium" style={{ color }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-3">
                      <Progress
                        percent={pct}
                        showInfo={false}
                        strokeColor={color}
                      />
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card title="Satisfacción (1–5 estrellas)">
            <Bar data={satisfaccion} options={commonOptions} />
          </Card>
        </div>
      ),
    },

    /* Tab 5 — ESTADO ACTUAL (snapshot) */
    {
      key: "5",
      label: "Estado actual",
      children: (
        <div className="space-y-6">
          <H1 level={3} className="!mb-0">
            Salud de la cola en tiempo real
          </H1>
          <Text type="secondary">Snapshot (no depende de fechas)</Text>

          <Card title="Backlog por estado">
            <Bar data={backlogPorEstado} options={commonOptions} />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <H1 level={2} className="!mb-0">
            Dashboard del Área — UMA (Demo)
          </H1>
          <Text type="secondary">
            Tab 1 Hoy • Tab 2 KPIs período • Tab 3 Evolución • Tab 4
            Distribución • Tab 5 Estado actual
          </Text>
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={tabsItems} />
    </div>
  );
}
