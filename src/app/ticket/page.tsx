"use client";

import Image from "next/image";
import LogoUma from "@/assets/uma_img_campus_1.jpeg";
import { Panel, SeleccionarArea } from "@/components/ticket/panel";

export default function Page() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Imagen de fondo */}
      <Image
        src={LogoUma}
        alt="Fondo UMA"
        fill
        className="blur-[5px] object-cover"
        priority
      />

      {/* Capa oscura semi-transparente */}
      <div className="absolute inset-0 bg-[rgba(187,182,182,0.5)]" />

      {/* Contenido centrado */}
      <div className="relative z-20 h-full flex items-center justify-center px-4 ">
        <div className="bg-white shadow-lg rounded-lg w-[33%] max-w-5xl ">
          {/* Título */}

          <div className="border-b border-[#d1d0d0] px-6 pt-4">
            <h4 className="text-2xl font-bold">GENERAR TICKET DE ATENCIÓN</h4>
          </div>

          {/* Cuerpo */}
          <div className="p-6 flex justify-between">
            <Panel></Panel>
            {/* <SeleccionarArea></SeleccionarArea> */}
          </div>
        </div>
      </div>
    </div>
  );
}
