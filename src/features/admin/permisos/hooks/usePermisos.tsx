import { Core_Modulo, Core_Permiso } from "@interfaces/core";
import { getUsuario } from "@/services/adm/admin";
import {
  getListPermisos,
  getPermisosUser,
  updatePermisos,
} from "@/services/core/permisos";
import { message } from "antd";
import { useEffect, useState } from "react";

export default function usePermisos() {
  const [modulos, setModulos] = useState<Core_Modulo[]>([]);
  const [checkedPermisos, setCheckedPermisos] = useState<number[]>([]);
  const [usuario_id, setUsuario_id] = useState<number | null>(null);

  const fetchModulos = async () => {
    try {
      const response = await getListPermisos();
      setModulos(response);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  // const fetchUsuario = async (email: string) => {
  //   try {
  //     const data = await getUsuario(email);
  //     setUsuario_id(data.id);
  //   } catch (error) {
  //     console.log("error => ", error);
  //   }
  // };

  useEffect(() => {
    fetchModulos();
  }, []);

  const buscarPermisos = async (values: { email: string }) => {
    console.log("email => ", values.email);

    try {
      const data = await getPermisosUser(values.email);

      const datauser = await getUsuario(values.email);
      setUsuario_id(datauser.id);
      const permisos = data.map((p: Core_Permiso) => p.item_id);
      setCheckedPermisos(permisos);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const isChecked = (id: number) => checkedPermisos.includes(id);

  const togglePermiso = (id: number, checked: boolean) => {
    if (checked) {
      setCheckedPermisos([...checkedPermisos, id]);
    } else {
      setCheckedPermisos(checkedPermisos.filter((pid) => pid !== id));
    }
  };

  const actualizarPermisos = async (desactivarRestantes = true) => {
    if (!usuario_id) {
      message.warning("Primero busca un usuario por email.");
      return;
    }

    try {
      await updatePermisos({
        usuario_id,
        item_ids: checkedPermisos,
        desactivarRestantes,
      });

      message.success("Permisos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar permisos:", error);
      message.error("Error al actualizar los permisos");
    }
  };

  return {
    modulos,
    buscarPermisos,
    isChecked,
    togglePermiso,
    actualizarPermisos,
  };
}
