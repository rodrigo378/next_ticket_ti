// components/tp/InventarioList.tsx
"use client";

import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Tooltip,
  Flex,
  Divider,
  Typography,
  Segmented,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  AppstoreOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { getInventarios, getLotesByInventario } from "@/services/tp/inventario";

// Tipos
type InventarioRow = {
  id: number;
  codigo: string;
  nombre: string;
  unidadBase?: string | null;
  esPerecible: boolean;
  stockGlobal: number;
  stockMinimo?: number | null;
  ubicacion?: string | null;
  activo: boolean;
};

type LoteRow = {
  id: number;
  inventario_id: number;
  codigoLote: string;
  fechaVencimiento?: string | null;
  cantidad: number;
  estado: "ACTIVO" | "INACTIVO";
  ubicacion_id?: number | null;
};

export default function InventarioList() {
  const router = useRouter();

  const [data, setData] = useState<InventarioRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [perecible, setPerecible] = useState<string | undefined>();
  const [estado, setEstado] = useState<"todos" | "activos" | "inactivos">(
    "todos"
  );

  // ---- Lotes modal state ----
  const [loteModalOpen, setLoteModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<InventarioRow | null>(null);
  const [lotes, setLotes] = useState<LoteRow[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  // ==============================
  // Fetch
  // ==============================
  const fetchInventarios = async () => {
    try {
      setLoading(true);
      const res = await getInventarios();
      setData(res || []);
    } catch (error) {
      console.error("Error fetching inventarios:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventarios();
  }, []);

  // ==============================
  // Filtros
  // ==============================
  const filtered = useMemo(() => {
    return (data || []).filter((row) => {
      const matchesQuery =
        !query ||
        row.codigo.toLowerCase().includes(query.toLowerCase()) ||
        row.nombre.toLowerCase().includes(query.toLowerCase());

      const matchesPerecible =
        !perecible || (perecible === "si" ? row.esPerecible : !row.esPerecible);

      const matchesEstado =
        estado === "todos" || (estado === "activos" ? row.activo : !row.activo);

      return matchesQuery && matchesPerecible && matchesEstado;
    });
  }, [data, query, perecible, estado]);

  // ==============================
  // Lotes helpers
  // ==============================
  const openLotes = async (inv: InventarioRow) => {
    setSelectedInv(inv);
    setLoteModalOpen(true);
    try {
      setLoadingLotes(true);
      const res = await getLotesByInventario(inv.id);
      setLotes(res || []);
    } catch (e) {
      console.error(e);
      setLotes([]);
    } finally {
      setLoadingLotes(false);
    }
  };

  const loteColumns: ColumnsType<LoteRow> = [
    {
      title: "Código lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Vence",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      width: 140,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
      sorter: (a, b) =>
        dayjs(a.fechaVencimiento || "1900-01-01").unix() -
        dayjs(b.fechaVencimiento || "1900-01-01").unix(),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "right",
      sorter: (a, b) => a.cantidad - b.cantidad,
      width: 120,
    },
    {
      title: "Ubicación",
      dataIndex: "ubicacion_id",
      key: "ubicacion",
      width: 160,
      render: (v) =>
        v != null ? (
          `ID ${v}`
        ) : (
          <Typography.Text type="secondary">Sin ubicación</Typography.Text>
        ),
      sorter: (a, b) =>
        (a.ubicacion_id ?? Number.MAX_SAFE_INTEGER) -
        (b.ubicacion_id ?? Number.MAX_SAFE_INTEGER),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (v) =>
        v === "ACTIVO" ? <Tag color="blue">Activo</Tag> : <Tag>Inactivo</Tag>,
      filters: [
        { text: "Activos", value: "ACTIVO" },
        { text: "Inactivos", value: "INACTIVO" },
      ],
      onFilter: (val, row) => row.estado === val,
    },
  ];

  // ==============================
  // Columnas
  // ==============================
  const columns: ColumnsType<InventarioRow> = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      sorter: (a, b) => a.codigo.localeCompare(b.codigo),
      render: (v) => (
        <Space size={6}>
          <InboxOutlined />
          <Typography.Text code>{v}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{v}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.unidadBase ?? "—"} · {r.ubicacion ?? "Sin ubicación"}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Perecible",
      dataIndex: "esPerecible",
      key: "perecible",
      width: 120,
      render: (v) =>
        v ? <Tag color="red">Sí</Tag> : <Tag color="default">No</Tag>,
      filters: [
        { text: "Sí", value: "si" },
        { text: "No", value: "no" },
      ],
      onFilter: (value, row) =>
        value === "si" ? row.esPerecible : !row.esPerecible,
    },
    {
      title: "Stock",
      key: "stock",
      width: 140,
      sorter: (a, b) => a.stockGlobal - b.stockGlobal,
      render: (_, r) => {
        const under = r.stockMinimo != null && r.stockGlobal < r.stockMinimo;
        return (
          <Space size={6}>
            <Tag color={under ? "volcano" : "green"}>{r.stockGlobal}</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              min {r.stockMinimo ?? 0}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "estado",
      width: 110,
      filters: [
        { text: "Activos", value: "activos" },
        { text: "Inactivos", value: "inactivos" },
      ],
      onFilter: (value, row) =>
        value === "activos" ? row.activo : !row.activo,
      render: (v) => (v ? <Tag color="blue">Activo</Tag> : <Tag>Inactivo</Tag>),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 220,
      render: (_, row) => (
        <Space>
          {/* Ver (si lo quieres igual que Editar, puedes apuntar a la misma ruta) */}
          <Tooltip title="Ver">
            <Button
              icon={<EyeOutlined />}
              onClick={() => router.push(`/inventario/${row.id}`)}
            />
          </Tooltip>

          {/* Editar -> redirige */}
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/tp/inventario/${row.id}`)}
            />
          </Tooltip>

          {/* Lotes -> abre modal sólo si es perecible */}
          {row.esPerecible && (
            <Tooltip title="Lotes">
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => openLotes(row)}
              >
                Lotes
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card className="shadow-sm">
        <Flex gap={12} vertical style={{ marginBottom: 12 }}>
          <Flex gap={8} wrap="wrap" align="center" justify="space-between">
            <Space size={10} wrap>
              <Input
                placeholder="Buscar por código o nombre..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 320, maxWidth: "100%" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Select
                style={{ width: 160 }}
                placeholder="Perecible"
                allowClear
                value={perecible}
                onChange={setPerecible}
                options={[
                  { label: "Sí", value: "si" },
                  { label: "No", value: "no" },
                ]}
              />

              <Segmented
                options={[
                  { label: "Todos", value: "todos" },
                  { label: "Activos", value: "activos" },
                  { label: "Inactivos", value: "inactivos" },
                ]}
                value={estado}
                onChange={(val) =>
                  setEstado(val as "todos" | "activos" | "inactivos")
                }
              />
            </Space>

            <Space>
              <Link href={"inventario/crear"}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Nuevo
                </Button>
              </Link>
            </Space>
          </Flex>

          <Divider style={{ margin: "8px 0 0" }} />
        </Flex>

        <Table<InventarioRow>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          size="middle"
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} ítems` }}
        />
      </Card>

      {/* Modal de Lotes */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined />
            <span>
              Lotes —{" "}
              {selectedInv
                ? `${selectedInv.codigo} · ${selectedInv.nombre}`
                : "…"}
            </span>
          </Space>
        }
        open={loteModalOpen}
        onCancel={() => {
          setLoteModalOpen(false);
          setSelectedInv(null);
          setLotes([]);
        }}
        width={880}
        footer={null}
        destroyOnClose
      >
        <Table<LoteRow>
          rowKey="id"
          columns={loteColumns}
          dataSource={lotes}
          loading={loadingLotes}
          size="middle"
          pagination={{ pageSize: 8, showTotal: (t) => `${t} lotes` }}
        />
      </Modal>
    </>
  );
}
