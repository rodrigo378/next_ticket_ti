// src/features/admin/ListUsuarios/hooks/useUsuariosList.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoles, getUsuarios } from "@/services/core";
import { Core_Rol, Core_Usuario } from "@interfaces/core";
import { CoreRol_Id } from "@/const/rol.const";

// ===================================================================================
export type TabKey = "administrativo" | "alumno";

// Normaliza texto: quita acentos y pasa a minúsculas
const normalize = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// ===================================================================================
export default function useUsuariosList(
  defaultRoles: number[] = [CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]
) {
  // ===================================================================================
  const [rolesFiltro, setRolesFiltro] = useState<number[]>(defaultRoles);
  const [q, setQ] = useState("");

  // ===================================================================================
  const usuariosQ = useQuery<Core_Usuario[]>({
    queryKey: ["usuarios", { rolesFiltro }],
    queryFn: () => getUsuarios({ roles_id: rolesFiltro }),
    staleTime: 60_000,
  });

  const rolesQ = useQuery<Core_Rol[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: 5 * 60_000,
  });

  // ===================================================================================
  const usuarios = useMemo<Core_Usuario[]>(
    () => usuariosQ.data ?? [],
    [usuariosQ.data]
  );

  // ===================================================================================
  const usuariosFiltrados = useMemo(() => {
    if (!q) return usuarios;
    const nq = normalize(q);
    return usuarios.filter((u) => {
      const nombre = normalize(u.nombre);
      const apellidos = normalize(u.apellidos);
      const email = normalize(u.email);
      const grado = normalize(u.grado);
      const rol = normalize(u.rol?.nombre ?? "");
      return (
        nombre.includes(nq) ||
        apellidos.includes(nq) ||
        email.includes(nq) ||
        grado.includes(nq) ||
        rol.includes(nq)
      );
    });
  }, [usuarios, q]);

  // ===================================================================================
  const onChangeTab = useCallback((tab: TabKey) => {
    if (tab === "administrativo") {
      setRolesFiltro([CoreRol_Id.SUPERADMIN, CoreRol_Id.ADMINISTRATIVO]);
    } else {
      setRolesFiltro([CoreRol_Id.ESTUDIANTE]);
    }
  }, []);

  // ===================================================================================
  const refetchUsuarios = useCallback(() => usuariosQ.refetch(), [usuariosQ]);

  // ===================================================================================
  const onSearchChange = useCallback((value: string) => setQ(value), []);

  // ===================================================================================
  return {
    usuarios,
    usuariosFiltrados,
    roles: rolesQ.data ?? [],
    isLoadingUsuarios: usuariosQ.isLoading || usuariosQ.isFetching,
    isLoadingRoles: rolesQ.isLoading || rolesQ.isFetching,
    q,
    setQ,
    onSearchChange,
    onChangeTab,
    refetchUsuarios,
  };
}
