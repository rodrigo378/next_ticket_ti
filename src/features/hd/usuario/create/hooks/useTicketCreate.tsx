import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import { useRouter } from "next/navigation";
import type { StepsProps } from "antd";
import {
  FormOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { HD_Area, HD_CatalogoServicio, HD_Incidencia } from "@interfaces/hd";

import { NormalizedError } from "@services/api";
import {
  createTicket,
  getAreas,
  getCatalogo,
  getIncidencias,
} from "@services/hd";
import { hdErrorMap } from "@features/hd/errors/errorMap.hd";
import { applyFormErrors } from "@/shared/ui/errors/applyFormErrors";
import { handleApiError } from "@/shared/ui/errors/handleApiError";

const REQUIRED_STEP1_FIELDS = [
  "area_id",
  "catalogo_servicio_id",
  "tipo",
  "incidencia_id",
  "categoria_id",
] as const;

export const STEP_KEYS = ["datos", "detalle", "confirmacion"] as const;

export function useTicketCreate() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [catalogo, setCatalogo] = useState<HD_CatalogoServicio[]>([]);
  const [incidencias, setIncidencias] = useState<HD_Incidencia[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // NEW: banderas de carga para selects
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);

  const tipo = Form.useWatch<string | undefined>("tipo", form);
  const catalogoId = Form.useWatch<number | undefined>(
    "catalogo_servicio_id",
    form
  );

  // Cargar áreas
  useEffect(() => {
    (async () => {
      setLoadingAreas(true);
      try {
        const data = await getAreas();
        setAreas(data);
      } catch {
        message.error("Error al cargar áreas");
      } finally {
        setLoadingAreas(false);
      }
    })();
  }, []);

  // Cargar incidencias cuando hay tipo + catálogo
  useEffect(() => {
    if (!tipo || !catalogoId) return;
    let abort = false;
    setLoadingIncidencias(true);
    (async () => {
      try {
        const data = await getIncidencias(tipo, String(catalogoId));
        if (!abort) setIncidencias(data);
      } catch {
        if (!abort) message.error("Error al cargar incidencias");
      } finally {
        if (!abort) setLoadingIncidencias(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [tipo, catalogoId, form]);

  // Cargar catálogo por área
  const fetchCatalogo = useCallback(async (areaId: number) => {
    setCatalogo([]);
    setIncidencias([]);
    setLoadingCatalogo(true);
    try {
      const data = await getCatalogo(String(areaId));
      setCatalogo(data);
    } catch {
      message.error("Error al cargar catálogo");
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  const isStep1Complete = REQUIRED_STEP1_FIELDS.every((n) =>
    Boolean(form.getFieldValue(n))
  );

  const next = useCallback(async () => {
    try {
      if (current === 0) await form.validateFields([...REQUIRED_STEP1_FIELDS]);
      if (current === 1) await form.validateFields(["descripcion"]);
      setCurrent((p) => p + 1);
    } catch {}
  }, [current, form]);

  const prev = useCallback(() => setCurrent((p) => p - 1), []);

  const onSubmit = useCallback(async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue(true);
      const fd = new FormData();
      fd.append("descripcion", values.descripcion);
      fd.append("incidencia_id", String(values.incidencia_id));
      fd.append("area_id", String(values.area_id));
      if (values.categoria_id)
        fd.append("categoria_id", String(values.categoria_id));
      fileList.forEach((f) => {
        if (f.originFileObj) fd.append("archivos", f.originFileObj as Blob);
      });
      await createTicket(fd);
      message.success("🎉 Ticket creado exitosamente");
      router.push("/hd/ticket");
    } catch (e) {
      const err = e as NormalizedError;
      const painted = applyFormErrors(form, err);
      if (!painted) handleApiError(err, hdErrorMap);
    } finally {
      setLoading(false);
    }
  }, [form, fileList, router]);

  const stepItems: StepsProps["items"] = useMemo(
    () => [
      {
        title: "Datos del Ticket",
        description: "Área, catálogo y clasificación",
        icon: <FormOutlined />,
        status:
          current > 0 ? (isStep1Complete ? "finish" : "error") : "process",
      },
      {
        title: "Descripción y Adjuntos",
        description: "Detalle del problema y evidencias",
        icon: <FileTextOutlined />,
        status:
          current > 1
            ? form.getFieldValue("descripcion")
              ? "finish"
              : "error"
            : current === 1
            ? "process"
            : "wait",
      },
      {
        title: "Confirmación",
        description: "Revisa antes de enviar",
        icon: <CheckCircleOutlined />,
        status: current === 2 ? "process" : current > 2 ? "finish" : "wait",
      },
    ],
    [current, isStep1Complete, form]
  );

  return {
    form,
    current,
    next,
    prev,
    onSubmit,
    loading,
    areas,
    catalogo,
    incidencias,
    fileList,
    setFileList,
    stepItems,
    fetchCatalogo,
    // loading flags expuestas
    loadingAreas,
    loadingCatalogo,
    loadingIncidencias,
  };
}
