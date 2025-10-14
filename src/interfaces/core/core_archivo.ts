import { HD_DocumentoTicket } from "../hd";

export interface Core_Archivo {
  id: number;
  nombre: string;
  contentType?: string;
  size?: number;
  sha256?: string;
  drive_id?: string;
  drive_itemId?: string;
  e_tag?: string;
  webUrl?: string;
  carpeta?: string;
  creado_por?: number;
  createdAt: Date;

  url: string;
  previewUrl: string;
  openUrl: string;

  HD_DocumentoTicket: HD_DocumentoTicket[];
}
