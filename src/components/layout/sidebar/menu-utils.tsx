// src/components/layout/Sidebar/menu-utils.ts
import Image from "next/image";
import type { MenuProps } from "antd";
import type {
  IamMenuGroup,
  IamMenuItem,
  IamMenuModule,
} from "@interfaces/core/layout";

// ===================================================================================
export const SIDER = {
  bg: "#1f2937",
  bgHover: "#243447",
  bgActive: "#334155",
  border: "rgba(255,255,255,0.06)",
  text: "#cbd5e1",
  textMuted: "#94a3b8",
  textActive: "#ffffff",
};

// ===================================================================================
export const DefaultBullet = (
  <svg viewBox="0 0 8 8" aria-hidden="true" className="h-1.5 w-1.5">
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

// ===================================================================================
export const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 99999) - (b.order ?? 99999);

// ===================================================================================
export function renderModuleIcon(
  icon?: string,
  className?: string
): React.ReactNode {
  // ===================================================================================
  if (!icon) return DefaultBullet;
  const s = icon.trim();
  if (!s.toLowerCase().endsWith(".svg")) return DefaultBullet;
  const src = s.startsWith("/") ? s : `/${s}`;
  return (
    <Image
      src={src}
      alt=""
      width={1}
      height={1}
      className={className ?? "h-4 w-4 object-contain fixed-sider__icon"}
      priority={false}
    />
  );
}

// ===================================================================================
const routeMap: Array<{ test: RegExp; key: string }> = [
  { test: /^\/hd\/ticket\/\d+$/, key: "/hd/ticket" },
  { test: /^\/hd\/bandeja\/\d+$/, key: "/hd/bandeja" },
  { test: /^\/hd\/est\/\d+$/, key: "/hd/est/mis-tickets" },
];

// ===================================================================================
export function mapPathToMenuKey(pathname: string): string {
  const hit = routeMap.find((r) => r.test.test(pathname));
  return hit?.key ?? pathname;
}

// ===================================================================================
export function toAntdItems(
  mods: IamMenuModule[],
  opts?: { collapsed?: boolean; onNavigateStart?: () => void }
): MenuProps["items"] {
  // ===================================================================================
  const items: Required<MenuProps>["items"] = [];
  const sorted = [...mods].sort(byOrder);
  const isCollapsed = !!opts?.collapsed;

  // ===================================================================================
  const ItemLabel = ({
    text,
    href,
    onNavigateStart,
  }: {
    text: string;
    href?: string;
    onNavigateStart?: () => void;
  }) =>
    href ? (
      <a
        onClick={onNavigateStart}
        className="block font-semibold whitespace-normal leading-tight fixed-sider__link"
        href={href}
      >
        {text}
      </a>
    ) : (
      <span className="font-semibold whitespace-normal leading-tight fixed-sider__link">
        {text}
      </span>
    );

  // ===================================================================================
  sorted.forEach((mod, idx) => {
    const modIcon = mod.icono;

    if (!isCollapsed) {
      if (idx > 0) items.push({ type: "divider" });
      items.push({
        key: `${mod.key}__section`,
        label: (
          <span className="flex items-center gap-2 px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide uppercase select-none fixed-sider__section">
            {renderModuleIcon(
              modIcon,
              "h-[1.2rem] w-[1.2rem] object-contain fixed-sider__icon"
            )}
            <span>{mod.label}</span>
          </span>
        ),
        disabled: true,
      });
    }

    (mod.groups ?? []).sort(byOrder).forEach((g: IamMenuGroup) => {
      const children =
        (g.children ?? []).sort(byOrder).map((it: IamMenuItem) => ({
          key: it.path ?? it.key,
          label: (
            <ItemLabel
              text={String(it.label)}
              href={
                it.path ??
                (it.key?.toString().startsWith("/")
                  ? (it.key as string)
                  : undefined)
              }
              onNavigateStart={opts?.onNavigateStart}
            />
          ),
          icon: DefaultBullet,
        })) || [];

      if (children.length) {
        items.push({
          key: g.key,
          label: (
            <span className="font-bold fixed-sider__group">{g.label}</span>
          ),
          icon: DefaultBullet,
          children,
        } as never);
      }
    });
  });

  // ===================================================================================
  return items;
}
