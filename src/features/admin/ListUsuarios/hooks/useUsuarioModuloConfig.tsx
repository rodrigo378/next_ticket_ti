// src/features/admin/ListUsuarios/hooks/useUsuarioModuloConfig.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAreas } from "@services/hd";
import {
  getUsuarioModuloConfig,
  upsertUsuarioModulo,
} from "@/services/core/usuario";
import { Form, message } from "antd";
import { useRef, useState } from "react";
import { HD_Area } from "@interfaces/hd";
import {
  MODULO_REGISTRY,
  type ModCodigo,
  type FormValues,
} from "./modulos.registry";

// ===================================================================================
export default function useUsuarioModuloConfig() {
  // ===================================================================================
  const [formModules] = Form.useForm<FormValues>();
  const [openModulo, setOpenModulo] = useState(false);
  const ussuarioIdRef = useRef<number | null>(null);
  const qc = useQueryClient();

  // ===================================================================================
  const [savingByModule, setSavingByModule] = useState<
    Partial<Record<ModCodigo, boolean>>
  >({});

  // ===================================================================================
  const areasQ = useQuery<HD_Area[]>({
    queryKey: ["areas"],
    queryFn: getAreas,
    staleTime: 10 * 60_000,
  });

  // ===================================================================================
  const configQ = useQuery({
    queryKey: ["usuario-modulos", ussuarioIdRef.current],
    queryFn: () => getUsuarioModuloConfig(ussuarioIdRef.current!),
    enabled: !!ussuarioIdRef.current && openModulo,
  });

  // ===================================================================================
  const showDrawerModulo = async (usuario_id: number) => {
    ussuarioIdRef.current = usuario_id;

    const ref = await configQ.refetch();
    const data = ref.data ?? (await getUsuarioModuloConfig(usuario_id));

    const findBy = (code: string) =>
      data.modules.find(
        (m: { codigo: "ADM" | "HD" | "TP" | "API" }) => m.codigo === code
      );
    const adm = findBy("ADM");
    const hd = findBy("HD");
    const tp = findBy("TP");
    const api = findBy("API");

    formModules.setFieldsValue({
      adm: { rol: adm?.rol ?? undefined },
      hd: {
        rol: hd?.rol ?? undefined,
        areas_id: hd?.admin_area_ids ?? [],
        area_id: hd?.subarea?.area?.id ?? undefined,
        subarea_id: hd?.subarea?.id ?? undefined,
      },
      tp: { rol: tp?.rol ?? undefined },
      api: { rol: api?.rol ?? undefined },
    });

    setOpenModulo(true);
  };

  // ===================================================================================
  const onCloseModulo = () => {
    setOpenModulo(false);
    formModules.resetFields();
    ussuarioIdRef.current = null;
    setSavingByModule({});
  };

  // ===================================================================================
  const saveModulo = async (code: ModCodigo) => {
    const usuarioId = ussuarioIdRef.current;
    if (!usuarioId) {
      message.error("Primero selecciona un usuario.");
      return;
    }
    const entry = MODULO_REGISTRY[code];
    const formValues = formModules.getFieldsValue() as FormValues;
    const subForm = entry.extract(formValues);
    const payload = entry.normalize(subForm);

    if (!payload) {
      message.info("No hay cambios por guardar.");
      return;
    }

    try {
      setSavingByModule((s) => ({ ...s, [code]: true }));
      await upsertUsuarioModulo(usuarioId, entry.code, payload);
      message.success(`Módulo ${code} actualizado.`);
      await qc.invalidateQueries({ queryKey: ["usuario-modulos", usuarioId] });
      await showDrawerModulo(usuarioId);
    } catch (e) {
      console.error(e);
      message.error(`No se pudo actualizar el módulo ${code}.`);
    } finally {
      setSavingByModule((s) => ({ ...s, [code]: false }));
    }
  };

  // ===================================================================================
  return {
    usuario_id: ussuarioIdRef.current ?? null,
    openModulo,
    showDrawerModulo,
    onCloseModulo,
    formModules,
    areas: areasQ.data ?? [],
    modules: configQ.data?.modules ?? [],
    saveModulo,
    savingByModule,
    isFetchingConfig: configQ.isFetching,
  };
}
