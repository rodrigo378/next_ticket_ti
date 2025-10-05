"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  App,
  Card,
  Collapse,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Tooltip,
  Badge,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  getItems,
  listTokens,
  assignTokenItem,
  revokeTokenItem,
  getAssignedItemIdsByToken,
} from "@/services/api/usuario";

const { Title, Text } = Typography;

interface Item {
  id: number;
  code: string;
  description?: string | null;
}
interface TokenMeta {
  id: number;
  label: string;
  owner_user_id: number;
  created_at: string;
}
type ModuleKey = string;

function parseAxiosError(err: unknown): { status?: number; detail?: string } {
  if (typeof err === "object" && err !== null) {
    const maybeResp = (
      err as { response?: { status?: number; data?: { detail?: string } } }
    ).response;
    return { status: maybeResp?.status, detail: maybeResp?.data?.detail };
  }
  return {};
}

export default function PermisosPage() {
  const { message, modal } = App.useApp();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // userId (evita NaN)
  const userId = useMemo(() => {
    const raw = params?.id ?? "";
    const n = parseInt(String(raw), 10);
    return Number.isNaN(n) ? null : n;
  }, [params?.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [token, setToken] = useState<TokenMeta | null>(null);

  // 🔁 Renombrado para evitar colisiones: antes "items / setItems"
  const [grouped, setGrouped] = useState<Record<ModuleKey, Item[]>>({});

  // Estado sincronizado con backend (lo que está realmente asignado)
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  // Borrador en UI (lo que el usuario marca antes de guardar)
  const [draftIds, setDraftIds] = useState<number[]>([]);

  const hasChanges = useMemo(() => {
    if (assignedIds.length !== draftIds.length) return true;
    const a = new Set(assignedIds);
    for (const id of draftIds) if (!a.has(id)) return true;
    return false;
  }, [assignedIds, draftIds]);

  // columnas de la tabla
  const columns: ColumnsType<Item> = [
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="font-medium text-blue-600">{code}</span>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
      width: 360,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      render: (desc?: string | null) =>
        desc ? (
          <span className="text-gray-700">{desc}</span>
        ) : (
          <span className="text-gray-400">Sin descripción</span>
        ),
    },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        if (userId === null) {
          message.error("URL inválida: falta el userId.");
          router.back();
          return;
        }

        // 1) token del usuario
        const tokens: TokenMeta[] = await listTokens();
        const t = tokens.find((x) => x.owner_user_id === userId) || null;
        setToken(t);

        // 2) items y agrupación por módulo
        const its: Item[] = await getItems();
        const g: Record<ModuleKey, Item[]> = {};
        its.forEach((it) => {
          const mod = (it.code || "").split(":")[0] || "otros";
          if (!g[mod]) g[mod] = [];
          g[mod].push(it);
        });
        Object.keys(g).forEach((k) =>
          g[k].sort((a, b) => a.code.localeCompare(b.code))
        );
        setGrouped(g);

        // 3) ids ya asignados
        if (t) {
          try {
            const assigned = await getAssignedItemIdsByToken(t.id);
            setAssignedIds(assigned);
            setDraftIds(assigned); // el borrador arranca igual al backend
          } catch (e) {
            console.error(e);
            message.warning("No se pudo cargar los permisos asignados.");
            setAssignedIds([]);
            setDraftIds([]);
          }
        } else {
          setAssignedIds([]);
          setDraftIds([]);
        }
      } catch (err) {
        console.error(err);
        message.error("No se pudo cargar permisos.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId, message, router]);

  // Selección por módulo (solo modifica el borrador)
  const applyDraftForModule = (module: ModuleKey, moduleSelected: number[]) => {
    const idsModulo = (grouped[module] || []).map((i) => i.id);
    const keep = draftIds.filter((id) => !idsModulo.includes(id));
    const next = Array.from(new Set([...keep, ...moduleSelected]));
    setDraftIds(next);
  };

  // RowSelection controlado por módulo (borrador)
  const buildRowSelection = (
    module: ModuleKey
  ): TableProps<Item>["rowSelection"] => {
    const idsModulo = (grouped[module] || []).map((i) => i.id);
    const selectedInModule = draftIds.filter((id) => idsModulo.includes(id));
    return {
      selectedRowKeys: selectedInModule,
      onChange: (keys) => {
        const nextModulo = (keys as (number | string)[]).map((k) => Number(k));
        applyDraftForModule(module, nextModulo);
      },
      getCheckboxProps: () => ({ disabled: !token || saving }),
    };
  };

  // Acciones del header de cada panel
  const PanelExtra = ({ module }: { module: ModuleKey }) => {
    const idsModulo = (grouped[module] || []).map((i) => i.id);
    const total = idsModulo.length;
    const marcados = draftIds.filter((id) => idsModulo.includes(id)).length;
    const all = total > 0 && marcados === total;
    const some = marcados > 0 && marcados < total;

    return (
      <Space size="small">
        <Tag>{module}</Tag>
        <Tooltip title="Seleccionar todos los permisos del módulo">
          <Button
            size="small"
            type="primary"
            disabled={!token || all || saving}
            onClick={(e) => {
              e.stopPropagation();
              applyDraftForModule(module, idsModulo);
            }}
          >
            Seleccionar todo
          </Button>
        </Tooltip>
        <Tooltip title="Quitar todos los permisos del módulo">
          <Button
            size="small"
            danger
            disabled={!token || (!some && !all) || saving}
            onClick={(e) => {
              e.stopPropagation();
              applyDraftForModule(module, []);
            }}
          >
            Quitar todo
          </Button>
        </Tooltip>
      </Space>
    );
  };

  // Items para Collapse
  const collapseItems = Object.keys(grouped)
    .sort()
    .map((mod) => ({
      key: mod,
      label: (
        <Space>
          <strong>{mod}</strong>
          <Tag>
            {(grouped[mod] || []).length} permiso
            {(grouped[mod] || []).length === 1 ? "" : "s"}
          </Tag>
        </Space>
      ),
      extra: <PanelExtra module={mod} />,
      children: (
        <Table<Item>
          size="middle"
          bordered
          rowKey="id"
          columns={columns}
          dataSource={grouped[mod]}
          rowSelection={buildRowSelection(mod)}
          pagination={{ pageSize: 8 }}
        />
      ),
    }));

  // Guardar cambios (aplica diff entre assignedIds y draftIds)
  const onGuardar = async () => {
    if (!token) {
      modal.info({
        title: "Token no activo",
        content: "Este usuario no tiene token activo.",
      });
      return;
    }
    if (!hasChanges) return;

    setSaving(true);
    try {
      const current = new Set(assignedIds);
      const next = new Set(draftIds);
      const toAssign: number[] = [];
      const toRevoke: number[] = [];

      next.forEach((id) => !current.has(id) && toAssign.push(id));
      current.forEach((id) => !next.has(id) && toRevoke.push(id));

      // asigna
      for (const id of toAssign) {
        try {
          await assignTokenItem(token.id, id);
        } catch (err) {
          const { status, detail } = parseAxiosError(err);
          if (status !== 409) {
            throw new Error(detail || "Error al asignar un permiso.");
          }
        }
      }

      // revoca
      for (const id of toRevoke) {
        await revokeTokenItem(token.id, id);
      }

      setAssignedIds(draftIds); // ya está sincronizado
      message.success("Cambios guardados.");
    } catch (err) {
      console.error(err);
      const { status, detail } = parseAxiosError(err);
      if (status === 401 || status === 403) {
        modal.info({
          title: "Autenticación requerida",
          content: (
            <div>
              <p>Para continuar, inicia sesión como superadmin.</p>
              <p>
                Se abrirá <code>http://localhost:8000/docs-admin</code>. Ingresa
                tus credenciales y reintenta.
              </p>
            </div>
          ),
          okText: "Abrir",
          onOk: () =>
            window.open(
              "http://localhost:8000/docs-admin",
              "_blank",
              "noopener,noreferrer"
            ),
        });
      } else {
        message.error(detail || "No se pudieron guardar los cambios.");
      }

      // re-sincroniza desde backend por si quedó inconsistente
      if (token) {
        try {
          const reassigned = await getAssignedItemIdsByToken(token.id);
          setAssignedIds(reassigned);
          setDraftIds(reassigned);
        } catch {
          /* noop */
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // Descartar cambios del borrador
  const onDescartar = () => {
    setDraftIds(assignedIds);
    message.info("Cambios descartados.");
  };

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" className="w-full">
        <Space align="center" className="justify-between w-full">
          <Title level={3} className="!mb-0">
            Permisos por token
          </Title>
          <Button onClick={() => router.back()}>Volver</Button>
        </Space>

        <Card loading={loading}>
          <Space direction="vertical" size="small">
            <Text>
              <strong>Usuario ID:</strong> {userId ?? "—"}
            </Text>
            <Text>
              <strong>Token:</strong>{" "}
              {token ? (
                <>
                  <Tag color="green">ID: {token.id}</Tag>{" "}
                  <Text type="secondary">
                    creado el{" "}
                    {new Date(token.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                </>
              ) : (
                <Tag color="red">No activo</Tag>
              )}
            </Text>
            <Space wrap>
              <Tooltip title={token ? "" : "Necesitas un token activo"}>
                <Button
                  type="primary"
                  onClick={onGuardar}
                  disabled={!token || !hasChanges}
                  loading={saving}
                >
                  Guardar cambios
                </Button>
              </Tooltip>
              <Button onClick={onDescartar} disabled={!hasChanges || saving}>
                Descartar
              </Button>
              {hasChanges && (
                <Badge status="processing" text="Cambios sin guardar" />
              )}
            </Space>
          </Space>
        </Card>

        <Card title="Listado de permisos por módulo">
          <Collapse items={collapseItems} accordion={false} />
        </Card>
      </Space>
    </div>
  );
}
