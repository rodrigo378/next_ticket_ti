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
import { HD_Area } from "@/interface/hd/hd_area";
import { HD_CatalogoServicio } from "@/interface/hd/hd_catalogoServicio";
import { HD_Incidencia } from "@/interface/hd/hd_incidencia";
import { getAreas } from "@/services/hd/area";
import { getIncidencias } from "@/services/hd/incidencias";
import { getCatalogo } from "@/services/hd/catalogo";
import { createTicketTi } from "@/services/hd/ticket_ti";
import { applyFormErrors } from "@/utils/applyFormErrors";
import { handleApiError } from "@/utils/handleApiError";
import { normalizeError } from "@/services/api";

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

  const tipo = Form.useWatch<string | undefined>("tipo", form);
  const catalogoId = Form.useWatch<number | undefined>(
    "catalogo_servicio_id",
    form
  );

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  useEffect(() => {
    if (!tipo || !catalogoId) return;
    let abort = false;
    (async () => {
      try {
        const data = await getIncidencias(tipo, String(catalogoId));
        if (!abort) setIncidencias(data);
      } catch {
        if (!abort) message.error("Error al cargar incidencias");
      }
    })();
    return () => {
      abort = true;
    };
  }, [tipo, catalogoId, form]);

  const fetchCatalogo = useCallback(async (areaId: number) => {
    setCatalogo([]);
    setIncidencias([]);
    const data = await getCatalogo(String(areaId));
    setCatalogo(data);
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
    console.log("entrpo en => ", onSubmit);

    try {
      // 1) valida primero (sin spinner)
      await form.validateFields();

      // 2) prepara payload y ahora sí, spinner
      setLoading(true);

      const values = form.getFieldsValue(true);
      const fd = new FormData();
      fd.append("descripcion", values.descripcion);
      fd.append("incidencia_id", String(values.incidencia_id));
      fd.append("area_id", String(values.area_id));
      if (values.categoria_id) {
        fd.append("categoria_id", String(values.categoria_id));
      }
      fileList.forEach((f) => {
        if (f.originFileObj) fd.append("archivos", f.originFileObj);
      });

      // 3) request
      await createTicketTi(fd);

      // 4) éxito
      message.success("🎉 Ticket creado exitosamente");
      router.push("/hd/ticket");
    } catch (err: unknown) {
      console.log("entro aaca => ");

      // Si es un error de validación de AntD, no dispares handlers globales
      if (typeof err === "object" && err !== null && "errorFields" in err) {
        // AntD ya pintó los errores del form
        return;
      }

      // Normaliza y maneja
      const nerr = normalizeError(err);
      console.log("nerr => ", nerr);

      // Intenta pintar errores de campo del backend (details.fieldErrors)
      const painted = applyFormErrors(form, nerr);

      // Si no hay errores de campo, usa el handler global (Modal/Toast por code)
      if (!painted) handleApiError(nerr);
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
  // http://localhost:4000/hd/ticket/soporte/1
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
  };
}
