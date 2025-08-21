export default function DashboardSLAChartJS() {
  return <h1>Este es el compoente dashboard</h1>;
}
// "use client";

// // Dashboard principal de Mesa de Ayuda con Chart.js + react-chartjs-2
// // Tecnologías: Next.js (App Router), Tailwind (clases utilitarias), Ant Design (UI básica)
// // Instrucciones de instalación:
// // npm i antd chart.js react-chartjs-2 chartjs-plugin-annotation
// // (opcional) Si Tailwind no está: https://tailwindcss.com/docs/guides/nextjs

// import React from "react";
// import {
//   Layout,
//   Card,
//   Col,
//   Row,
//   Statistic,
//   Tag,
//   Progress,
//   Divider,
//   Space,
//   Typography,
//   Button,
//   Modal,
//   Switch,
//   Tooltip,
//   Skeleton,
// } from "antd";
// import {
//   SettingOutlined,
//   EyeInvisibleOutlined,
//   EyeOutlined,
//   RedoOutlined,
//   SlidersOutlined,
// } from "@ant-design/icons";

// // Chart.js core
// import {
//   Chart as ChartJS,
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip as ChartTooltip,
//   Legend,
//   Title as ChartTitle,
// } from "chart.js";
// import annotationPlugin from "chartjs-plugin-annotation";
// import { Doughnut, Bar, Line } from "react-chartjs-2";

// const { Header, Content } = Layout;
// const { Title, Text } = Typography;

// // Registro de componentes de Chart.js
// ChartJS.register(
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   ChartTooltip,
//   Legend,
//   ChartTitle,
//   annotationPlugin
// );

// // Plugin para mostrar valor centrado en los donuts (simulación de gauge)
// const CenterTextPlugin = {
//   id: "centerText",
//   afterDraw(chart) {
//     const { ctx, chartArea } = chart;
//     if (!chart?.config?.options?.plugins?.centerText) return;
//     const {
//       text,
//       font = "600 16px Inter, sans-serif",
//       color = "#111",
//     } = chart.config.options.plugins.centerText;
//     ctx.save();
//     ctx.font = font;
//     ctx.fillStyle = color;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     const x = (chartArea.left + chartArea.right) / 2;
//     const y = (chartArea.top + chartArea.bottom) / 2;
//     ctx.fillText(text, x, y);
//     ctx.restore();
//   },
// };
// ChartJS.register(CenterTextPlugin a);

// // ===================== Sección genérica =====================
// function SectionCard({
//   title,
//   hidden,
//   children,
// }: {
//   title: string;
//   hidden?: boolean;
//   children: React.ReactNode;
// }) {
//   if (hidden) return null;
//   return (
//     <Card className="shadow-sm h-full">
//       <div className="flex items-center justify-between mb-3">
//         <span className="font-medium text-gray-700">{title}</span>
//       </div>
//       {children}
//     </Card>
//   );
// }

// export default function DashboardSLAChartJS() {
//   // ===================== DATA (DEMO) =====================
//   const kpis = {
//     abiertos: 120,
//     enProceso: 85,
//     cerrados: 560,
//     frtCumplimiento: 0.87, // 87%
//     ttrCumplimiento: 0.74, // 74%
//     tiempoRespuestaProm: 15,
//     tiempoRespuestaMeta: 20,
//     tiempoResolucionProm: 135,
//     tiempoResolucionMeta: 120,
//     satisfaccionPromedio: 4.3,
//   };

//   const estados = [kpis.abiertos, kpis.enProceso, kpis.cerrados];
//   const estadosLabels = ["Abiertos", "En Proceso", "Cerrados"];

//   const meses = ["Ene", "Feb", "Mar", "Abr"];
//   const cumplidos = [80, 100, 90, 120];
//   const vencidos = [20, 30, 40, 25];

//   const slaResp = [85, 90, 88, 87];
//   const slaResol = [70, 75, 72, 74];

//   const satisfDistribLabels = [
//     "Muy Satisfecho",
//     "Satisfecho",
//     "Neutral",
//     "Insatisfecho",
//   ];
//   const satisfDistrib = [50, 30, 10, 10];

//   // ===================== CONFIGS CHART.JS =====================
//   // 1) Donut Estados
//   const dataDonutEstados = {
//     labels: estadosLabels,
//     datasets: [
//       {
//         data: estados,
//         backgroundColor: ["#10b981", "#f59e0b", "#3b82f6"],
//         borderWidth: 0,
//       },
//     ],
//   };
//   const optDonutEstados = {
//     responsive: true,
//     plugins: {
//       legend: { position: "bottom" as const },
//     },
//     cutout: "60%",
//   };

//   // 2) Gauges (FRT / TTR) usando Doughnut + texto al centro
//   const gauge = (pct: number, label: string) => ({
//     data: {
//       labels: [label, "resto"],
//       datasets: [
//         {
//           data: [Math.round(pct * 100), 100 - Math.round(pct * 100)],
//           backgroundColor: [
//             pct >= 0.8 ? "#10b981" : pct >= 0.6 ? "#f59e0b" : "#ef4444",
//             "#e5e7eb",
//           ],
//           borderWidth: 0,
//         },
//       ],
//     },
//     options: {
//       cutout: "70%",
//       rotation: -90,
//       circumference: 180,
//       plugins: {
//         legend: { display: false },
//         centerText: {
//           text: `${Math.round(pct * 100)}%`,
//           color: "#111827",
//           font: "600 18px Inter, sans-serif",
//         },
//         title: { display: true, text: label },
//       },
//     },
//   });

//   // 3) Barras Prom vs Meta (Respuesta)
//   const dataRespBar = {
//     labels: ["Promedio", "Meta"],
//     datasets: [
//       {
//         label: "Minutos",
//         data: [kpis.tiempoRespuestaProm, kpis.tiempoRespuestaMeta],
//         backgroundColor: ["#3b82f6", "#9ca3af"],
//       },
//     ],
//   };
//   const optRespBar = {
//     responsive: true,
//     plugins: { legend: { display: false } },
//     scales: { y: { beginAtZero: true } },
//   } as const;

//   // 4) Barras Prom vs Meta (Resolución)
//   const dataResolBar = {
//     labels: ["Promedio", "Meta"],
//     datasets: [
//       {
//         label: "Minutos",
//         data: [kpis.tiempoResolucionProm, kpis.tiempoResolucionMeta],
//         backgroundColor: ["#3b82f6", "#9ca3af"],
//       },
//     ],
//   };
//   const optResolBar = optRespBar;

//   // 5) Stacked Cumplidos vs Vencidos (mensual)
//   const dataStacked = {
//     labels: meses,
//     datasets: [
//       {
//         label: "Cumplidos",
//         data: cumplidos,
//         backgroundColor: "#10b981",
//         stack: "tickets",
//       },
//       {
//         label: "Vencidos",
//         data: vencidos,
//         backgroundColor: "#ef4444",
//         stack: "tickets",
//       },
//     ],
//   };
//   const optStacked = {
//     responsive: true,
//     plugins: { legend: { position: "bottom" as const } },
//     scales: {
//       x: { stacked: true },
//       y: { stacked: true, beginAtZero: true },
//     },
//   } as const;

//   // 6) Línea tendencia SLA (con meta 80%)
//   const dataTrend = {
//     labels: meses,
//     datasets: [
//       {
//         label: "Respuesta",
//         data: slaResp,
//         borderColor: "#3b82f6",
//         backgroundColor: "rgba(59,130,246,0.15)",
//         tension: 0.35,
//       },
//       {
//         label: "Resolución",
//         data: slaResol,
//         borderColor: "#10b981",
//         backgroundColor: "rgba(16,185,129,0.15)",
//         tension: 0.35,
//       },
//     ],
//   };
//   const optTrend = {
//     responsive: true,
//     plugins: {
//       legend: { position: "bottom" },
//       annotation: {
//         annotations: {
//           meta80: {
//             type: "line",
//             yMin: 80,
//             yMax: 80,
//             borderColor: "#9ca3af",
//             borderDash: [4, 4],
//             borderWidth: 2,
//             label: {
//               display: true,
//               content: "Meta 80%",
//               backgroundColor: "#9ca3af",
//               position: "end",
//             },
//           },
//         },
//       },
//     },
//     scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
//   };

//   // 7) Distribución de satisfacción (barras horizontales)
//   const dataSatisfBarH = {
//     labels: satisfDistribLabels,
//     datasets: [
//       {
//         label: "Respuestas",
//         data: satisfDistrib,
//         backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
//       },
//     ],
//   };
//   const optSatisfBarH = {
//     indexAxis: "y" as const,
//     responsive: true,
//     plugins: { legend: { display: false } },
//     scales: { x: { beginAtZero: true } },
//   } as const;

//   // ===================== VISIBILIDAD =====================
//   type SectionId =
//     | "kpiCards"
//     | "pieEstados"
//     | "frtGauge"
//     | "ttrGauge"
//     | "tiemposRespuesta"
//     | "tiemposResolucion"
//     | "cumplidosVencidos"
//     | "tendenciaSLA"
//     | "satisfaccionKPI"
//     | "satisfaccionDistrib";

//   const ALL_SECTIONS: { id: SectionId; title: string }[] = [
//     { id: "kpiCards", title: "KPIs de Tickets" },
//     { id: "pieEstados", title: "Distribución por Estado" },
//     { id: "frtGauge", title: "SLA Respuesta (FRT)" },
//     { id: "ttrGauge", title: "SLA Resolución (TTR)" },
//     { id: "tiemposRespuesta", title: "Tiempo de Respuesta – Prom vs Meta" },
//     { id: "tiemposResolucion", title: "Tiempo de Resolución – Prom vs Meta" },
//     { id: "cumplidosVencidos", title: "Cumplidos vs Vencidos (mensual)" },
//     { id: "tendenciaSLA", title: "Tendencia Cumplimiento SLA" },
//     { id: "satisfaccionKPI", title: "Satisfacción Promedio" },
//     { id: "satisfaccionDistrib", title: "Distribución de Satisfacción" },
//   ];

//   const [mounted, setMounted] = React.useState(false);
//   const [hidden, setHidden] = React.useState<Record<SectionId, boolean>>(
//     {} as Record<SectionId, boolean>
//   );
//   const [openCustomize, setOpenCustomize] = React.useState(false);

//   React.useEffect(() => {
//     setMounted(true);
//     try {
//       const savedHidden = localStorage.getItem("sla_dashboard_hidden_chartjs");
//       if (savedHidden) setHidden(JSON.parse(savedHidden));
//     } catch {}
//   }, []);

//   React.useEffect(() => {
//     if (!mounted) return;
//     localStorage.setItem(
//       "sla_dashboard_hidden_chartjs",
//       JSON.stringify(hidden)
//     );
//   }, [hidden, mounted]);

//   const toggleHidden = (id: SectionId, value: boolean) =>
//     setHidden((p) => ({ ...p, [id]: value }));
//   const resetVisibility = () => setHidden({} as Record<SectionId, boolean>);

//   const statusTag = (value: number) => {
//     if (value >= 0.8) return <Tag color="green">Alto</Tag>;
//     if (value >= 0.6) return <Tag color="orange">Medio</Tag>;
//     return <Tag color="red">Bajo</Tag>;
//   };

//   return (
//     <Layout className="min-h-screen bg-gray-50">
//       <Header className="bg-white/90 backdrop-blur shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div>
//             <Title level={3} className="!mb-0">
//               Dashboard SLA – Mesa de Ayuda (Chart.js)
//             </Title>
//             <Text type="secondary">
//               Calidad del servicio (SLA) y métricas clave
//             </Text>
//           </div>
//           <Space>
//             <Tooltip title="Restablecer visibilidad">
//               <Button icon={<RedoOutlined />} onClick={resetVisibility}>
//                 Reset
//               </Button>
//             </Tooltip>
//             <Tooltip title="Personalizar visibilidad">
//               <Button
//                 type="primary"
//                 icon={<SettingOutlined />}
//                 onClick={() => setOpenCustomize(true)}
//               >
//                 Personalizar
//               </Button>
//             </Tooltip>
//           </Space>
//         </div>
//       </Header>

//       <Content>
//         <div className="max-w-7xl mx-auto p-4 space-y-6">
//           {!mounted ? (
//             <Card className="shadow-sm">
//               <Skeleton active paragraph={{ rows: 6 }} />
//             </Card>
//           ) : (
//             <Row gutter={[16, 16]}>
//               {/* KPIs */}
//               {!hidden.kpiCards && (
//                 <Col xs={24}>
//                   <SectionCard title="KPIs de Tickets">
//                     <Row gutter={[16, 16]}>
//                       <Col xs={24} sm={12} md={6}>
//                         <Card className="shadow-sm h-full">
//                           <Statistic title="Abiertos" value={kpis.abiertos} />
//                         </Card>
//                       </Col>
//                       <Col xs={24} sm={12} md={6}>
//                         <Card className="shadow-sm h-full">
//                           <Statistic
//                             title="En Proceso"
//                             value={kpis.enProceso}
//                           />
//                         </Card>
//                       </Col>
//                       <Col xs={24} sm={12} md={6}>
//                         <Card className="shadow-sm h-full">
//                           <Statistic title="Cerrados" value={kpis.cerrados} />
//                         </Card>
//                       </Col>
//                       <Col xs={24} sm={12} md={6}>
//                         <Card className="shadow-sm h-full">
//                           <Space
//                             direction="vertical"
//                             size="small"
//                             className="w-full"
//                           >
//                             <div className="flex items-center justify-between">
//                               <span className="text-gray-500">Cumpl. FRT</span>
//                               {statusTag(kpis.frtCumplimiento)}
//                             </div>
//                             <Progress
//                               type="dashboard"
//                               percent={Math.round(kpis.frtCumplimiento * 100)}
//                             />
//                             <div className="flex items-center justify-between">
//                               <span className="text-gray-500">Cumpl. TTR</span>
//                               {statusTag(kpis.ttrCumplimiento)}
//                             </div>
//                             <Progress
//                               type="dashboard"
//                               percent={Math.round(kpis.ttrCumplimiento * 100)}
//                             />
//                           </Space>
//                         </Card>
//                       </Col>
//                     </Row>
//                   </SectionCard>
//                 </Col>
//               )}

//               {/* Fila 1 */}
//               <Col xs={24} md={12}>
//                 {!hidden.pieEstados && (
//                   <SectionCard title="Distribución por Estado">
//                     <Doughnut
//                       data={dataDonutEstados}
//                       options={optDonutEstados}
//                     />
//                   </SectionCard>
//                 )}
//               </Col>

//               <Col xs={24} md={12}>
//                 {!hidden.frtGauge && (
//                   <SectionCard title="SLA Respuesta (FRT)">
//                     <div className="flex items-center justify-center">
//                       <Doughnut {...gauge(kpis.frtCumplimiento, "FRT")} />
//                     </div>
//                   </SectionCard>
//                 )}
//               </Col>

//               {/* Fila 2 */}
//               <Col xs={24} md={12}>
//                 {!hidden.ttrGauge && (
//                   <SectionCard title="SLA Resolución (TTR)">
//                     <div className="flex items-center justify-center">
//                       <Doughnut {...gauge(kpis.ttrCumplimiento, "TTR")} />
//                     </div>
//                   </SectionCard>
//                 )}
//               </Col>

//               <Col xs={24} md={12}>
//                 {!hidden.tiemposRespuesta && (
//                   <SectionCard title="Tiempo de Respuesta – Prom vs Meta">
//                     <Bar data={dataRespBar} options={optRespBar} />
//                   </SectionCard>
//                 )}
//               </Col>

//               {/* Fila 3 */}
//               <Col xs={24} md={12}>
//                 {!hidden.tiemposResolucion && (
//                   <SectionCard title="Tiempo de Resolución – Prom vs Meta">
//                     <Bar data={dataResolBar} options={optResolBar} />
//                   </SectionCard>
//                 )}
//               </Col>

//               <Col xs={24} md={12}>
//                 {!hidden.cumplidosVencidos && (
//                   <SectionCard title="Cumplidos vs Vencidos (mensual)">
//                     <Bar data={dataStacked} options={optStacked} />
//                   </SectionCard>
//                 )}
//               </Col>

//               {/* Fila 4 */}
//               <Col xs={24} md={12}>
//                 {!hidden.tendenciaSLA && (
//                   <SectionCard title="Tendencia Cumplimiento SLA">
//                     <Line data={dataTrend} options={optTrend} />
//                   </SectionCard>
//                 )}
//               </Col>

//               <Col xs={24} md={12}>
//                 {!hidden.satisfaccionKPI && (
//                   <SectionCard title="Satisfacción Promedio">
//                     <Statistic
//                       title="Promedio"
//                       value={kpis.satisfaccionPromedio}
//                       suffix="/ 5"
//                       precision={1}
//                     />
//                   </SectionCard>
//                 )}
//               </Col>

//               {/* Fila 5 */}
//               <Col xs={24}>
//                 {!hidden.satisfaccionDistrib && (
//                   <SectionCard title="Distribución de Satisfacción">
//                     <Bar data={dataSatisfBarH} options={optSatisfBarH} />
//                   </SectionCard>
//                 )}
//               </Col>
//             </Row>
//           )}

//           <Divider className="!mt-8" />
//           <p className="text-center text-gray-400 text-xs">
//             Demo estática • UMA Service Desk • Visibilidad por sección con
//             persistencia local.
//           </p>
//         </div>
//       </Content>

//       <Modal
//         title={
//           <Space>
//             <SlidersOutlined />
//             <span>Personalizar secciones</span>
//           </Space>
//         }
//         open={openCustomize}
//         onCancel={() => setOpenCustomize(false)}
//         onOk={() => setOpenCustomize(false)}
//         okText="Guardar"
//       >
//         <Space direction="vertical" className="w-full">
//           {ALL_SECTIONS.map((s) => (
//             <div key={s.id} className="flex items-center justify-between py-1">
//               <span>{s.title}</span>
//               <Space>
//                 <Tooltip title={hidden[s.id] ? "Mostrar" : "Ocultar"}>
//                   <Switch
//                     checkedChildren={<EyeOutlined />}
//                     unCheckedChildren={<EyeInvisibleOutlined />}
//                     checked={!hidden[s.id]}
//                     onChange={(checked) => toggleHidden(s.id, !checked)}
//                   />
//                 </Tooltip>
//               </Space>
//             </div>
//           ))}
//         </Space>
//       </Modal>
//     </Layout>
//   );
// }
