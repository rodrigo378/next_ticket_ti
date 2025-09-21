"use client";

import React, { useEffect, useState } from "react";
import { theme } from "antd";
import {
  getAreas,
  getArea,
  updateHorario,
  createHorario,
} from "@/features/hd/service/area";
import { HD_Area } from "@/interfaces/hd";

/* =============== UI mínimas (con tokens de AntD) =============== */
function Card({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  const { token } = theme.useToken();
  return (
    <div
      className={`rounded-2xl shadow-sm ${className}`}
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  const { token } = theme.useToken();
  return (
    <div
      className="flex items-start justify-between gap-4 p-5"
      style={{ borderBottom: `1px solid ${token.colorSplit}` }}
    >
      <div>
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: token.colorText }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="mt-1 text-sm"
            style={{ color: token.colorTextSecondary }}
          >
            {description}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <label
      className="mb-1 block text-sm font-medium"
      style={{ color: token.colorText }}
    >
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { token } = theme.useToken();
  const { className, style, ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-10 w-full rounded-lg px-3 text-sm outline-none transition hover:opacity-95 ${
        className || ""
      }`}
      style={{
        background: token.colorBgContainer,
        color: token.colorText,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: "none",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = token.colorPrimary;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${token.colorPrimaryBorder}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = token.colorBorder;
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function Select({
  options,
  className,
  style,
  ...rest
}: {
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { token } = theme.useToken();
  return (
    <select
      {...rest}
      className={`h-10 w-full rounded-lg px-3 text-sm outline-none transition hover:opacity-95 ${
        className || ""
      }`}
      style={{
        background: token.colorBgContainer,
        color: token.colorText,
        border: `1px solid ${token.colorBorder}`,
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = token.colorPrimary;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${token.colorPrimaryBorder}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = token.colorBorder;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  const { token } = theme.useToken();
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[.98]";
  const stylesByVariant: Record<string, React.CSSProperties> = {
    primary: {
      background: token.colorPrimary,
      color: token.colorTextLightSolid,
      border: `1px solid ${token.colorPrimaryBorder}`,
    },
    ghost: {
      background: "transparent",
      color: token.colorText,
      border: `1px solid transparent`,
    },
    outline: {
      background: token.colorBgContainer,
      color: token.colorText,
      border: `1px solid ${token.colorBorder}`,
    },
  };
  return (
    <button
      {...rest}
      className={`${base} hover:opacity-90 ${className}`}
      style={{ ...stylesByVariant[variant], ...style }}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { token } = theme.useToken();
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition"
      style={{
        background: checked ? token.colorPrimary : token.colorFillSecondary,
        border: `1px solid ${
          checked ? token.colorPrimaryBorder : token.colorBorderSecondary
        }`,
      }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-[2px] h-5 w-5 rounded-full transition"
        style={{
          left: checked ? 22 : 2,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary,
        }}
      />
    </button>
  );
}

/* =============== Constantes & tipos =============== */
const DIAS = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
] as const;

type DayKey = (typeof DIAS)[number]["key"];
type TimeRange = { id?: number; start: string; end: string; activo?: boolean };
type DaySchedule = { enabled: boolean; ranges: TimeRange[] };
type WeekSchedule = Record<DayKey, DaySchedule>;

/* =============== Utils =============== */
const emptyDay = (): DaySchedule => ({
  enabled: false,
  ranges: [{ start: "08:00", end: "12:00" }],
});
const prettyRange = (r: TimeRange) => `${r.start}–${r.end}`;
const cloneWeek = (ws: WeekSchedule): WeekSchedule =>
  JSON.parse(JSON.stringify(ws));

const dayApiToKey: Record<string, DayKey> = {
  LUNES: "lun",
  MARTES: "mar",
  MIERCOLES: "mie",
  MIÉRCOLES: "mie",
  JUEVES: "jue",
  VIERNES: "vie",
  SABADO: "sab",
  SÁBADO: "sab",
};
const keyToDayApi: Record<
  DayKey,
  "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO"
> = {
  lun: "LUNES",
  mar: "MARTES",
  mie: "MIERCOLES",
  jue: "JUEVES",
  vie: "VIERNES",
  sab: "SABADO",
};
const toHHMMSS = (t: string) => (t?.length === 5 ? `${t}:00` : t || "");
const toHHMM = (t: string) => (t?.length >= 5 ? t.slice(0, 5) : t || "");

/* =============== Page =============== */
export default function Page() {
  const { token } = theme.useToken();

  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [areaId, setAreaId] = useState<number | "">("");

  const [week, setWeek] = useState<WeekSchedule>({
    lun: emptyDay(),
    mar: emptyDay(),
    mie: emptyDay(),
    jue: emptyDay(),
    vie: emptyDay(),
    sab: emptyDay(),
  });
  const [originalWeek, setOriginalWeek] = useState<WeekSchedule>({
    lun: emptyDay(),
    mar: emptyDay(),
    mie: emptyDay(),
    jue: emptyDay(),
    vie: emptyDay(),
    sab: emptyDay(),
  });

  const [status, setStatus] = useState<{
    type: "idle" | "saving" | "ok" | "error";
    msg?: string;
  }>({ type: "idle" });

  /* -------- cargar áreas -------- */
  useEffect(() => {
    (async () => {
      try {
        const response = await getAreas();
        setAreas(response || []);
      } catch (e) {
        console.error("getAreas error:", e);
      }
    })();
  }, []);

  /* -------- seleccionar área => traer horario -------- */
  const handleSelectArea = async (value: string) => {
    const id = Number(value);
    setAreaId(id);
    setStatus({ type: "idle" });

    try {
      const area = await getArea(id);

      const next: WeekSchedule = {
        lun: { enabled: false, ranges: [] },
        mar: { enabled: false, ranges: [] },
        mie: { enabled: false, ranges: [] },
        jue: { enabled: false, ranges: [] },
        vie: { enabled: false, ranges: [] },
        sab: { enabled: false, ranges: [] },
      };

      const items = Array.isArray(area?.HD_HorarioArea)
        ? area.HD_HorarioArea
        : [];
      for (const it of items) {
        if (it?.activo === false) continue;
        const k = dayApiToKey[String(it?.dia)?.toUpperCase()];
        if (!k) continue;
        if (!next[k].enabled) next[k].enabled = true;
        next[k].ranges.push({
          id: Number(it?.id),
          start: toHHMM(String(it?.h_inicio)),
          end: toHHMM(String(it?.h_fin)),
          activo: true,
        });
      }

      (Object.keys(next) as DayKey[]).forEach((k) => {
        if (!next[k].enabled) next[k] = emptyDay();
      });

      setWeek(next);
      setOriginalWeek(cloneWeek(next));
    } catch (e) {
      console.error("getArea error:", e);
      const empty = {
        lun: emptyDay(),
        mar: emptyDay(),
        mie: emptyDay(),
        jue: emptyDay(),
        vie: emptyDay(),
        sab: emptyDay(),
      };
      setWeek(empty);
      setOriginalWeek(empty);
    }
  };

  /* -------- acciones de UI -------- */
  const setDayEnabled = (day: DayKey, enabled: boolean) =>
    setWeek((prev) => ({ ...prev, [day]: { ...prev[day], enabled } }));

  const setRange = (day: DayKey, idx: number, patch: Partial<TimeRange>) =>
    setWeek((prev) => {
      const copy = cloneWeek(prev);
      copy[day].ranges[idx] = { ...copy[day].ranges[idx], ...patch };
      return copy;
    });

  const addRange = (day: DayKey) =>
    setWeek((prev) => {
      const copy = cloneWeek(prev);
      const last = copy[day].ranges[copy[day].ranges.length - 1];
      const next = last
        ? { start: last.end, end: "18:00" }
        : { start: "08:00", end: "12:00" };
      copy[day].ranges.push(next);
      return copy;
    });

  const removeRange = (day: DayKey, idx: number) =>
    setWeek((prev) => {
      const copy = cloneWeek(prev);
      copy[day].ranges.splice(idx, 1);
      if (copy[day].ranges.length === 0)
        copy[day].ranges.push({ start: "08:00", end: "12:00" });
      return copy;
    });

  const copyMondayToAll = () =>
    setWeek((prev) => {
      const base = prev.lun;
      const next = cloneWeek(prev);
      (["mar", "mie", "jue", "vie", "sab"] as DayKey[]).forEach(
        (d) => (next[d] = JSON.parse(JSON.stringify(base)))
      );
      return next;
    });

  const clearAll = () =>
    setWeek({
      lun: emptyDay(),
      mar: emptyDay(),
      mie: emptyDay(),
      jue: emptyDay(),
      vie: emptyDay(),
      sab: emptyDay(),
    });

  /* -------- Guardar (create/update/disable) -------- */
  const handleSave = async () => {
    if (!areaId) return;

    setStatus({ type: "saving", msg: "Guardando..." });
    try {
      const originalById = new Map<
        number,
        { day: DayKey; start: string; end: string }
      >();
      (Object.keys(originalWeek) as DayKey[]).forEach((day) => {
        originalWeek[day].ranges.forEach((r) => {
          if (r.id) originalById.set(r.id, { day, start: r.start, end: r.end });
        });
      });

      const seenIds = new Set<number>();
      for (const day of Object.keys(week) as DayKey[]) {
        const uiDay = week[day];

        if (!uiDay.enabled) {
          originalWeek[day].ranges.forEach(async (r) => {
            if (r.id) await updateHorario(r.id, { activo: false });
          });
          continue;
        }

        for (const r of uiDay.ranges) {
          if (r.id) {
            seenIds.add(r.id);
            const orig = originalById.get(r.id);
            if (!orig) continue;
            if (orig.start !== r.start || orig.end !== r.end) {
              await updateHorario(r.id, {
                h_inicio: toHHMMSS(r.start),
                h_fin: toHHMMSS(r.end),
              });
            }
          } else {
            await createHorario({
              area_id: Number(areaId),
              dia: keyToDayApi[day],
              h_inicio: toHHMMSS(r.start),
              h_fin: toHHMMSS(r.end),
            });
          }
        }
      }

      for (const [id, { day }] of originalById.entries()) {
        if (seenIds.has(id)) continue;
        if (week[day].enabled) {
          await updateHorario(id, { activo: false });
        }
      }

      setStatus({ type: "ok", msg: "Cambios guardados correctamente." });
      setOriginalWeek(cloneWeek(week));
    } catch (e) {
      console.error("error => ", e);
      setStatus({
        type: "error",
        msg: "Ocurrió un error guardando los cambios.",
      });
    }
  };

  const statusStyles: Record<"saving" | "ok" | "error", React.CSSProperties> = {
    saving: {
      color: token.colorInfoText,
      background: token.colorInfoBg,
      border: `1px solid ${token.colorInfoBorder}`,
    },
    ok: {
      color: token.colorSuccessText,
      background: token.colorSuccessBg,
      border: `1px solid ${token.colorSuccessBorder}`,
    },
    error: {
      color: token.colorErrorText,
      background: token.colorErrorBg,
      border: `1px solid ${token.colorErrorBorder}`,
    },
  };

  return (
    <div
      className="mx-auto max-w-7xl px-5 py-8"
      style={{ color: token.colorText }}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: token.colorText }}
          >
            Horario de atención por área
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: token.colorTextSecondary }}
          >
            Define rangos por día (ej. emisión de tickets/ventanilla) para el
            área seleccionada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost">Borrador</Button>
          <Button
            onClick={handleSave}
            disabled={!areaId || status.type === "saving"}
          >
            {status.type === "saving" ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Banner de estado */}
      {status.type !== "idle" && (
        <div
          className="mb-4 rounded-lg px-3 py-2 text-sm"
          style={
            statusStyles[status.type === "saving" ? "saving" : status.type]
          }
        >
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* IZQUIERDA: Contexto + Preview */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader
              title="Contexto del período"
              description="Selecciona el área para configurar su horario de atención."
            />
            <div className="space-y-4 p-5">
              <div>
                <Label>Área</Label>
                <Select
                  value={areaId === "" ? "" : String(areaId)}
                  onChange={(e) => handleSelectArea(e.target.value)}
                  options={[
                    { value: "", label: "— Selecciona un área —" },
                    ...areas.map((a) => ({
                      value: String(a.id),
                      label: a.nombre,
                    })),
                  ]}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Preview legible"
              description="Así verá el usuario el horario del área."
            />
            <div className="p-5 space-y-2">
              {DIAS.map((d) => (
                <div key={d.key} className="text-sm">
                  <span
                    className="inline-block w-28 font-medium"
                    style={{ color: token.colorText }}
                  >
                    {d.label}
                  </span>
                  {!week[d.key].enabled ? (
                    <span style={{ color: token.colorTextQuaternary }}>
                      Cerrado
                    </span>
                  ) : (
                    <span style={{ color: token.colorText }}>
                      {week[d.key].ranges.map(prettyRange).join("  •  ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* DERECHA: Editor semanal */}
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader
              title="Editor semanal"
              description="Activa un día y define uno o más rangos (ej. 08:00–15:00)."
              right={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyMondayToAll}>
                    Copiar Lunes → resto
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    Limpiar todo
                  </Button>
                </div>
              }
            />
            <div className="divide-y" style={{ borderColor: token.colorSplit }}>
              {DIAS.map((d) => (
                <div
                  key={d.key}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={week[d.key].enabled}
                      onChange={(v) => setDayEnabled(d.key, v)}
                    />
                    <div
                      className="min-w-28 text-sm font-medium"
                      style={{ color: token.colorText }}
                    >
                      {d.label}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-start">
                    {week[d.key].ranges.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 shadow-sm"
                        style={{
                          background: token.colorBgElevated,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <Input
                          type="time"
                          value={r.start}
                          onChange={(e) =>
                            setRange(d.key, idx, { start: e.target.value })
                          }
                          className="w-24 sm:w-28"
                          disabled={!week[d.key].enabled}
                        />
                        <span style={{ color: token.colorTextQuaternary }}>
                          —
                        </span>
                        <Input
                          type="time"
                          value={r.end}
                          onChange={(e) =>
                            setRange(d.key, idx, { end: e.target.value })
                          }
                          className="w-24 sm:w-28"
                          disabled={!week[d.key].enabled}
                        />
                        <button
                          type="button"
                          onClick={() => removeRange(d.key, idx)}
                          disabled={!week[d.key].enabled}
                          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md"
                          style={{
                            color: token.colorTextSecondary,
                            border: `1px solid ${token.colorBorder}`,
                            background: token.colorBgContainer,
                          }}
                          aria-label="Eliminar rango"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addRange(d.key)}
                      disabled={!week[d.key].enabled}
                    >
                      + Agregar rango
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
