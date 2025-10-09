// src/app/403/page.tsx  (App Router)
"use client";
import { Result, Button } from "antd";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Result
        status="403"
        title="403"
        subTitle="No tienes permiso para acceder a esta página."
        extra={
          <Link href="/">
            <Button type="primary">Volver al inicio</Button>
          </Link>
        }
      />
    </div>
  );
}
