"use client";
import ListPermisos from "./components/ListPermisos";
import usePermisos from "./hooks/usePermisos";

export default function PermisosView() {
  const {
    modulos,
    buscarPermisos,
    isChecked,
    togglePermiso,
    actualizarPermisos,
  } = usePermisos();

  return (
    <>
      <ListPermisos
        modulos={modulos}
        buscarPermisos={buscarPermisos}
        isChecked={isChecked}
        togglePermiso={togglePermiso}
        updatePermisos={actualizarPermisos}
      ></ListPermisos>
    </>
  );
}
