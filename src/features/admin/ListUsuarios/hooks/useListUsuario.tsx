"use client";

import { Usuario } from "@/interface/usuario";
import { getUsuarios } from "@/services/admin";
import { Form } from "antd";
import { useEffect, useState } from "react";

export default function useListUsuario() {
  // USESTATE =======================================
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openAdministrativo, setOpenAdministrativo] = useState<boolean>(false);
  const [form] = Form.useForm();

  // FETCH ==========================================
  const fetchUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  // USEEFFECT =======================================
  useEffect(() => {
    fetchUsuarios();
  });

  // FUNCIONES
  const onCloseAdministrativo = () => {
    setOpenAdministrativo(false);
    form.resetFields();
    // setSubareas([]);
  };

  const showDrawerAdministrativo = () => {
    setOpenAdministrativo(true);
  };

  return {
    usuarios,
    openAdministrativo,

    //formulario
    form,

    //funciones
    onCloseAdministrativo,
    showDrawerAdministrativo,
  };
}
