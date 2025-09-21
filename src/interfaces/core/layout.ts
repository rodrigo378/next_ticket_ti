// interfaces/iam-menu.ts
export interface IamMenuItem {
  key: string;
  label: string;
  path: string; // ej: "/admin/usuario"
  icon?: string; // ej: "UserOutlined"
  order?: number;
}

export interface IamMenuGroup {
  key: string; // ej: "ADM:Gestion de usuarios"
  label: string; // ej: "Gestion de usuarios"
  order?: number;
  children: IamMenuItem[];
}

export interface IamMenuModule {
  key: string; // ej: "ADM"
  label: string; // ej: "Administrador"
  order?: number;
  icono: string;
  groups: IamMenuGroup[];
}
