"use client";

import { CoreRol_Id } from "@/const/rol.const";
import { Core_Rol } from "@/interface/core/core_rol";
import { Core_Usuario } from "@/interface/core/core_usuario";
import { HD_Area } from "@/interface/hd/hd_area";
import { getRoles } from "@/services/core/rol";
import {
  createUsuario,
  getUsuario,
  getUsuarioModulo,
  getUsuarios,
  updateUsuario,
  upsertUsuarioModulo,
} from "@/services/core/usuario";
import { getAreas } from "@/services/hd/area";
import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";

export default function useListUsuario() {
  // USESTATE =======================================
  const [usuarios, setUsuarios] = useState<Core_Usuario[]>([]);
  const [usuario, setUsuario] = useState<Core_Usuario>();

  const [openAdministrativo, setOpenAdministrativo] = useState<boolean>(false);
  const [openModulo, setOpenModulo] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [formModules] = Form.useForm();

  const [roles, setRoles] = useState<Core_Rol[]>([]);

  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [usuarioModulo, setUsuarioModulo] = useState([]);

  const lastReqUserIdRef = useRef<number | null>(null);

  // FETCH ==========================================
  const fetchUsuarios = async (roles_id: number[]) => {
    try {
      const data = await getUsuarios({ roles_id });
      setUsuarios(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchRol = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  // const fetchUsuario = async (usuario_id: number) => {
  //   try {
  //     const data = await getUsuario(usuario_id);
  //     setUsuario(data);
  //   } catch (error) {
  //     console.log("error =>", error);
  //   }
  // };

  // USEEFFECT =======================================
  useEffect(() => {
    fetchUsuarios([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
    fetchRol();
    fetchAreas();
  }, []);

  // FUNCIONES
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    form.resetFields();
    // setSubareas([]);
  };

  const onCloseModulo = () => {
    setOpenModulo(false);
    formModules.resetFields();
    setUsuarioModulo([]);
    lastReqUserIdRef.current = null; // <- limpia el id en uso
  };

  const onFinishAdministrativo = async (values: Core_Usuario) => {
    try {
      if (usuario) {
        const data = {
          nombre: values.nombre,
          apellidos: values.apellidos,
          grado: values.grado,
          estado: values.estado,
          rol_id: values.rol_id,
        };
        const response = await updateUsuario(usuario.id, data);
        message.success("✅ Usuario actualizado correctamente");
        console.log("Usuario actualizado => ", response);
      } else {
        await createUsuario(values);
        message.success("✅ Usuario registrado correctamente");
      }

      onCloseAdministrativo();
      fetchUsuarios([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
    } catch (error) {
      message.error("Error al crear usuario");
      console.log("error => ", error);
    }
  };

  const showDrawerModulo = async (usuario_id: number) => {
    try {
      // marca esta solicitud como la más reciente
      lastReqUserIdRef.current = usuario_id;

      // 1) limpia inmediatamente el estado anterior
      formModules.resetFields();
      setUsuarioModulo([]);

      // 2) trae la data nueva
      const data = await getUsuarioModulo(usuario_id);

      // si llegó una respuesta atrasada de otro usuario, ignora
      if (lastReqUserIdRef.current !== usuario_id) return;

      setUsuarioModulo(data);

      // 3) pre-llena el form con lo que vino del backend
      const adm = data.find(
        (m: any) => m.modulo?.codigo === "ADM" || m.modulo_id === 1
      );
      const hd = data.find(
        (m: any) => m.modulo?.codigo === "HD" || m.modulo_id === 2
      );

      formModules.setFieldsValue({
        adm: { rol: adm?.rol ?? undefined },
        hd: {
          rol: hd?.rol ?? undefined,
          areas_id: hd?.payload?.areas_id ?? [],
        },
      });

      // 4) ahora sí, abre el Drawer (ya con valores correctos)
      setOpenModulo(true);
    } catch (error) {
      console.log("error => ", error);
    }
  };
  const showDrawerAdministrativo = async (usuario_id?: number) => {
    try {
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
      console.log("error =>", error);
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
    }
  };

  // 1) Reemplaza tu onFinishModulos por este:
  const onFinishModulos = async (values: {
    adm?: { rol?: string };
    hd?: { rol?: string; areas_id?: number[] };
  }) => {
    console.log("values => ", values);

    try {
      // toma el id del último usuario para el que abriste el drawer
      const userId = lastReqUserIdRef.current ?? usuario?.id;
      if (!userId) {
        message.error("Primero selecciona un usuario.");
        return;
      }

      const tareas: Promise<unknown>[] = [];

      // ADM: solo rol
      if (values.adm?.rol) {
        tareas.push(
          upsertUsuarioModulo(userId, "ADM", { rol: values.adm.rol })
        );
      }

      // HD: rol + (opcional) áreas_id
      if (values.hd?.rol) {
        console.log("rol => ", values.hd.rol);
        console.log(
          "areas => ",
          values.hd.rol,
          Array.isArray(values.hd.areas_id) ? values.hd.areas_id : undefined
        );
        tareas.push(
          upsertUsuarioModulo(userId, "HD", {
            rol: values.hd.rol,
            areas_id: Array.isArray(values.hd.areas_id)
              ? values.hd.areas_id
              : undefined,
          })
        );
      }

      if (tareas.length === 0) {
        message.info("No hay cambios por guardar.");
        return;
      }

      await Promise.all(tareas);
      message.success("Configuración de módulos actualizada.");

      // refresca el drawer con lo que quedó en backend
      await showDrawerModulo(userId);
    } catch (err) {
      console.error(err);
      message.error("No se pudo actualizar la configuración.");
    }
  };

  return {
    usuario,
    usuarios,
    openAdministrativo,
    roles,

    usuarioModulo,

    areas,

    //formulario
    form,
    formModules,

    //funciones
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
