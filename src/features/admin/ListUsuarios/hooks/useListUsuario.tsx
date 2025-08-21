"use client";

import { ROL_ID } from "@/const/rol.const";
import { Area, Subarea } from "@/interface/area";
import { Rol } from "@/interface/rol";
import { CreateUsuario, UpdateUsuario, Usuario } from "@/interface/usuario";
import {
  createUsuario,
  getUsuario,
  getUsuarios,
  updateUsuario,
} from "@/services/admin";
import { getAreas, getSubareas } from "@/services/area";
import { getRoles } from "@/services/rol";
import { Form, message } from "antd";
import { useEffect, useState } from "react";

export default function useListUsuario() {
  // USESTATE =======================================
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuario, setUsuario] = useState<Usuario>();
  const [openAdministrativo, setOpenAdministrativo] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);

  // FETCH ==========================================
  const fetchUsuarios = async (roles_id: number[]) => {
    try {
      const data = await getUsuarios({ roles_id });
      setUsuarios(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchRoles = async () => {
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

  const fetchSubareas = async (area_id: number) => {
    try {
      const data = await getSubareas(area_id);
      setSubareas(data);
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
    fetchRoles();
    fetchAreas();
  }, []);

  // FUNCIONES
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    form.resetFields();
    // setSubareas([]);
  };

  const onFinishAdministrativo = async (values: CreateUsuario) => {
    try {
      if (usuario) {
        console.log("actualizar");
        console.log("usuario_id => ", usuario.id);
        console.log("data => ", values);

        const data: UpdateUsuario = {
          nombre: values.nombre,
          apellidos: values.apellidos,
          password: values.password,
          grado: values.grado,
          genero: values.genero,
          estado: values.estado,
          rol_id: values.rol_id,
          subarea_id: values.subarea_id,
          areas_id: values.areas_id,
        };

        const response = await updateUsuario(usuario.id, data);
        message.success("✅ Usuario actualizado correctamente");
        console.log("Usuario actualizado => ", response);
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
      console.log("error => ", error);
    }
  };

  const showDrawerAdministrativo = async (usuario_id?: number) => {
    try {
      if (usuario_id) {
        const data = await getUsuario(usuario_id);
        setUsuario(data);
        setSubareas(await getSubareas(data.subarea!.area_id));
        form.setFieldsValue({
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          genero: data.genero,
          grado: data.grado,
          estado: data.estado,

          rol_id: data.rol_id,

          area_id: data.subarea?.area_id,
          subarea_id: data.subarea_id,
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
    roles,
    areas,
    openAdministrativo,
    subareas,

    //formulario
    form,

    //funciones
    onCloseAdministrativo,
    showDrawerAdministrativo,
    onFinishAdministrativo,
    fetchSubareas,
    onChangeTab,
  };
}
