import { ReactNode } from "react";
import MainLayout from "@/components/layout/layout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <MainLayout>{children}</MainLayout>
    </div>
  );
}
