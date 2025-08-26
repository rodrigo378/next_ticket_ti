"use client";

import { ROL_ID } from "@/const/rol.const";
import { Core_Rol } from "@/interface/core/core_rol";
import { Core_Usuario } from "@/interface/core/core_usuario";
import { getRoles } from "@/services/core/rol";
import {
  createUsuario,
  getUsuario,
  getUsuarios,
} from "@/services/core/usuario";
import { Form, message } from "antd";
import { useEffect, useState } from "react";

export default function useListUsuario() {
  // USESTATE =======================================
  const [usuarios, setUsuarios] = useState<Core_Usuario[]>([]);
  const [usuario, setUsuario] = useState<Core_Usuario>();
  const [openAdministrativo, setOpenAdministrativo] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Core_Rol[]>([]);

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
    fetchUsuarios([
      ROL_ID.NIVEL_1,
      ROL_ID.NIVEL_2,
      ROL_ID.NIVEL_3,
      ROL_ID.NIVEL_4,
      ROL_ID.NIVEL_5,
      ROL_ID.ADMINISTRATIVO,
    ]);
    fetchRol();
  }, []);

  // FUNCIONES
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    form.resetFields();
    // setSubareas([]);
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
        // const response = await updateUsuario(usuario.id, data);
        message.success("✅ Usuario actualizado correctamente");
        // console.log("Usuario actualizado => ", response);
      } else {
        await createUsuario(values);
        message.success("✅ Usuario registrado correctamente");
      }

      onCloseAdministrativo();
      fetchUsuarios([
        ROL_ID.NIVEL_1,
        ROL_ID.NIVEL_2,
        ROL_ID.NIVEL_3,
        ROL_ID.NIVEL_4,
        ROL_ID.NIVEL_5,
        ROL_ID.ADMINISTRATIVO,
      ]);
    } catch (error) {
      message.error("Error al crear usuario");
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
        fetchUsuarios([
          ROL_ID.NIVEL_1,
          ROL_ID.NIVEL_2,
          ROL_ID.NIVEL_3,
          ROL_ID.NIVEL_4,
          ROL_ID.NIVEL_5,
          ROL_ID.ADMINISTRATIVO,
        ]);
        break;
      case "alumno":
        fetchUsuarios([ROL_ID.ESTUDIANTE]);
        break;
    }
  };

  return {
    usuario,
    usuarios,
    openAdministrativo,
    roles,

    //formulario
    form,

    //funciones
    onCloseAdministrativo,
    showDrawerAdministrativo,
    onFinishAdministrativo,
    onChangeTab,
  };
}
