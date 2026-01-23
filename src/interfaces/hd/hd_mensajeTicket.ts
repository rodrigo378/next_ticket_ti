import { Core_Archivo } from "../core";
import { Core_Usuario } from "../core/core_usuario";
import { HD_Ticket } from "./hd_ticket";

export interface HD_MensajeTicket {
  id: number;
  contenido?: string | null;
  tipo?: string | null;
  nombre?: string | null;

  archivo_id?: number | null;
  archivo?: Core_Archivo;

  ticket_id: number;
  ticket?: HD_Ticket;

  emisor_id: number;
  emisor?: Core_Usuario;

  createdAt: string; // ISO
}

// model HD_MensajeTicket {
//   id        Int     @id @default(autoincrement())
//   contenido String? @db.Text
//   tipo      String?
//   nombre    String?

//   archivo_id Int?
//   archivo    Core_Archivo? @relation(fields: [archivo_id], references: [id])

//   ticket_id Int
//   ticket    HD_Ticket @relation(fields: [ticket_id], references: [id])

//   emisor_id Int
//   emisor    Core_Usuario @relation("EmisorMensajes", fields: [emisor_id], references: [id])

//   createdAt DateTime @default(now())

//   @@index([ticket_id, createdAt])
//   @@index([archivo_id])
//   @@map("hd_mensaje_ticket")
// }
