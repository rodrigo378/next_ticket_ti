"use client";

import { CoreRol_Id } from "@/const/rol.const";
import { Core_Rol } from "@/interface/core/core_rol";
import { Core_Usuario } from "@/interface/core/core_usuario";
import { HD_Area } from "@/interface/hd/hd_area";
import { getRoles } from "@/services/core/rol";
import {
  createUsuario,
  getUsuario,
  getUsuarioModuloConfig, // { user, modules }
  getUsuarios,
  updateUsuario,
  upsertUsuarioModulo,
} from "@/services/core/usuario";
import { getAreas } from "@/features/hd/service/area";
import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";

/** === TIPOS LOCALES PARA EL NUEVO PAYLOAD === */
interface ModConfigModule {
  codigo: string;
  nombre: string;
  acceso: boolean;
  rol: string | null;
  subarea?: {
    id: number;
    nombre: string;
    area: { id: number; nombre: string; abreviado: string };
  } | null;
  admin_area_ids?: number[];
}
interface ModConfigResponse {
  user: { id: number; nombre: string; apellidos: string; email: string };
  modules: ModConfigModule[];
}

export default function useListUsuario() {
  // STATE =======================================
  const [usuarios, setUsuarios] = useState<Core_Usuario[]>([]);
  const [usuario, setUsuario] = useState<Core_Usuario>();

  const [openAdministrativo, setOpenAdministrativo] = useState(false);
  const [openModulo, setOpenModulo] = useState(false);

  const [form] = Form.useForm<Core_Usuario>();
  const [formModules] = Form.useForm();

  const [roles, setRoles] = useState<Core_Rol[]>([]);
  const [areas, setAreas] = useState<HD_Area[]>([]);

  // nuevo payload cacheado
  const [usuarioModuloConfig, setUsuarioModuloConfig] =
    useState<ModConfigResponse | null>(null);

  const lastReqUserIdRef = useRef<number | null>(null);

  // FETCH =======================================
  const fetchUsuarios = async (roles_id: number[]) => {
    try {
      const data = await getUsuarios({ roles_id });
      setUsuarios(data);
    } catch (error) {
      console.error("getUsuarios error => ", error);
      message.error("No se pudo cargar la lista de usuarios.");
    }
  };

  const fetchRol = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error("getRoles error => ", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.error("getAreas error => ", error);
    }
  };

  useEffect(() => {
    fetchUsuarios([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
    fetchRol();
    fetchAreas();
  }, []);

  // HANDLERS ====================================
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    setUsuario(undefined);
    form.resetFields();
  };

  const onCloseModulo = () => {
    setOpenModulo(false);
    setUsuarioModuloConfig(null);
    formModules.resetFields();
    lastReqUserIdRef.current = null;
  };

  const onFinishAdministrativo = async (values: Core_Usuario) => {
    try {
      if (usuario) {
        const payload = {
          nombre: values.nombre,
          apellidos: values.apellidos,
          grado: values.grado,
          estado: values.estado,
          rol_id: values.rol_id,
          email: values.email,
        };
        await updateUsuario(usuario.id, payload);
        message.success("✅ Usuario actualizado correctamente");
      } else {
        await createUsuario(values);
        message.success("✅ Usuario registrado correctamente");
      }
      onCloseAdministrativo();
      fetchUsuarios([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
    } catch (error) {
      console.error("onFinishAdministrativo error => ", error);
      message.error("No se pudo guardar el usuario.");
    }
  };

  const showDrawerModulo = async (usuario_id: number) => {
    // console.log("se abrio drawer modulo");

    try {
      lastReqUserIdRef.current = usuario_id;

      setUsuarioModuloConfig(null);
      formModules.resetFields();

      const data = await getUsuarioModuloConfig(usuario_id); // { user, modules }
      console.log("data => ", data);

      if (lastReqUserIdRef.current !== usuario_id) return;

      setUsuarioModuloConfig(data as ModConfigResponse);

      const adm = (data as ModConfigResponse).modules.find(
        (m) => m.codigo === "ADM"
      );
      const hd = (data as ModConfigResponse).modules.find(
        (m) => m.codigo === "HD"
      );

      formModules.setFieldsValue({
        adm: { rol: adm?.rol ?? undefined },
        hd: {
          rol: hd?.rol ?? undefined,
          areas_id: hd?.admin_area_ids ?? [],
          area_id: hd?.subarea?.area?.id ?? undefined,
          subarea_id: hd?.subarea?.id ?? undefined,
        },
      });

      setOpenModulo(true);
    } catch (error) {
      console.error("showDrawerModulo error => ", error);
      message.error("No se pudo abrir la configuración de módulos.");
    }
  };

  const showDrawerAdministrativo = async (usuario_id?: number) => {
    try {
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
    } catch (error) {
      console.error("showDrawerAdministrativo error =>", error);
      message.error("No se pudo abrir el formulario.");
    }
  };

  const onChangeTab = (tabKey: string) => {
    switch (tabKey) {
      case "administrativo":
        fetchUsuarios([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
        break;
      case "alumno":
        fetchUsuarios([CoreRol_Id.ESTUDIANTE]);
        break;
      default:
        break;
    }
  };

  const onFinishModulos = async (values: {
    adm?: { rol?: string };
    hd?: {
      rol?: string;
      areas_id?: number[];
      subarea_id?: number;
      area_id?: number;
    };
  }) => {
    try {
      const userId = lastReqUserIdRef.current ?? usuario?.id;
      if (!userId) {
        message.error("Primero selecciona un usuario.");
        return;
      }

      const tareas: Promise<unknown>[] = [];

      if (values.adm?.rol) {
        tareas.push(
          upsertUsuarioModulo(userId, "ADM", { rol: values.adm.rol })
        );
      }

      if (values.hd?.rol) {
        const rol = values.hd.rol;
        let areas_id: number[] | undefined = Array.isArray(values.hd.areas_id)
          ? values.hd.areas_id.filter((n) => Number.isFinite(n))
          : undefined;

        const subarea_id: number | undefined =
          typeof values.hd.subarea_id === "number"
            ? values.hd.subarea_id
            : undefined;

        const area_id: number | undefined =
          typeof values.hd.area_id === "number" ? values.hd.area_id : undefined; // opcional

        if (rol === "nivel_5" || rol === "N5") {
          areas_id = undefined;
          // subarea_id = undefined;
        } else if (rol === "nivel_4" || rol === "N4") {
          if (!areas_id || areas_id.length === 0) areas_id = undefined;
        } else {
          if (areas_id && areas_id.length > 1) areas_id = [areas_id[0]];
          if (!areas_id || areas_id.length === 0) areas_id = undefined;
        }

        tareas.push(
          upsertUsuarioModulo(userId, "HD", {
            rol,
            areas_id, // el back lo mapea a admin_area_ids
            subarea_id, // vínculo principal del usuario
            area_id, // opcional (si el back lo quiere explícito)
          })
        );
      }

      if (tareas.length === 0) {
        message.info("No hay cambios por guardar.");
        return;
      }

      await Promise.all(tareas);
      message.success("Configuración de módulos actualizada.");
      await showDrawerModulo(userId); // refresca con backend
    } catch (err) {
      console.error("onFinishModulos error => ", err);
      message.error("No se pudo actualizar la configuración.");
    }
  };

  return {
    usuario,
    usuarios,
    openAdministrativo,
    roles,

    // ⬇️ esto es lo que ahora necesita el Drawer
    usuarioModuloConfig,
    modules: usuarioModuloConfig?.modules ?? [],

    areas,
    form,
    formModules,

    onCloseAdministrativo,
    showDrawerAdministrativo,
    onFinishAdministrativo,
    onChangeTab,
    onFinishModulos,

    openModulo,
    onCloseModulo,
    showDrawerModulo,
  };
}
