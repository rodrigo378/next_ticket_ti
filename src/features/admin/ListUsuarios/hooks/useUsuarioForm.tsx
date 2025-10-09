// src/features/admin/ListUsuarios/hooks/useUsuarioForm.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, message } from "antd";
import {
  createUsuario,
  getUsuario,
  updateUsuario,
} from "@/services/core/usuario";
import { Core_Usuario } from "@interfaces/core";
import { useState } from "react";

// ===================================================================================
type Params = { onSaved?: () => void };

// ===================================================================================
export default function useUsuarioForm({ onSaved }: Params = {}) {
  // ===================================================================================
  const qc = useQueryClient();
  const [form] = Form.useForm<Core_Usuario>();
  const [openAdministrativo, setOpenAdministrativo] = useState(false);
  const [usuario, setUsuario] = useState<Core_Usuario>();

  // ===================================================================================
  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Core_Usuario>;
    }) => updateUsuario(id, payload),
    onSuccess: () => {
      message.success("✅ Usuario actualizado correctamente");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      onSaved?.();
      onCloseAdministrativo();
    },
    onError: () => message.error("No se pudo actualizar el usuario."),
  });

  // ===================================================================================
  const createMut = useMutation({
    mutationFn: (payload: Partial<Core_Usuario>) => createUsuario(payload),
    onSuccess: () => {
      message.success("✅ Usuario registrado correctamente");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      onSaved?.();
      onCloseAdministrativo();
    },
    onError: () => message.error("No se pudo crear el usuario."),
  });

  // ===================================================================================
  const showDrawerAdministrativo = async (usuario_id?: number) => {
    form.resetFields();
    setUsuario(undefined);

    if (usuario_id) {
      const data = await getUsuario(usuario_id);
      setUsuario(data);
      form.setFieldsValue({
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        grado: data.grado,
        estado: data.estado,
        rol_id: data.rol_id,
      });
    }
    setOpenAdministrativo(true);
  };

  // ===================================================================================
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    setUsuario(undefined);
    form.resetFields();
  };

  // ===================================================================================
  const onFinishAdministrativo = async (values: Core_Usuario) => {
    if (usuario) {
      const payload: Partial<Core_Usuario> = {
        nombre: values.nombre,
        apellidos: values.apellidos,
        grado: values.grado,
        estado: values.estado,
        rol_id: values.rol_id,
        email: values.email,
      };
      updateMut.mutate({ id: usuario.id, payload });
    } else {
      createMut.mutate(values);
    }
  };

  // ===================================================================================
  return {
    usuario,
    openAdministrativo,
    form,
    showDrawerAdministrativo,
    onCloseAdministrativo,
    onFinishAdministrativo,
    isSavingUsuario: updateMut.isPending || createMut.isPending,
  };
}
