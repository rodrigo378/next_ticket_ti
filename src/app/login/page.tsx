// src/app/login/page.tsx

import LoginClient from "./login-client";
import TokenSaver from "./token-save";

export default function Page({
  searchParams,
}: {
  searchParams?: { token?: string; returnTo?: string };
}) {
  const token = searchParams?.token;
  const returnTo = searchParams?.returnTo || "/";

  // Si viene con ?token=..., NO renderizamos la UI de login (evita FOUC)
  if (token) {
    return <TokenSaver token={token} returnTo={returnTo} />;
  }

  // Sin token: muestra tu login tal cual
  return <LoginClient />;
}
