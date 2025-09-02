"use client";

import React, { useEffect, useState } from "react";
import { HD_Area } from "@/interface/hd/hd_area";
import {
  getAreas,
  getArea,
  updateHorario,
  createHorario,
} from "@/services/hd/area";
// import { createHorario, updateHorario } from "@/services/hd/horario"; // <-- tus funciones

/* =============== UI mínimas (Tailwind) =============== */
function Card({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
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
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-800">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {right}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition
        focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
          props.className || ""
        }`}
    />
  );
}
function Select({
  options,
  ...rest
}: {
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition
        focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
          rest.className || ""
        }`}
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
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants: Record<string, string> = {
    primary:
      "bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  };
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
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
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-sky-600" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-[22px]" : "left-[2px]"
        }`}
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
/** "HH:mm" → "HH:mm:00" */
const toHHMMSS = (t: string) => (t?.length === 5 ? `${t}:00` : t || "");
/** Normaliza "HH:mm[:ss]" a "HH:mm" para UI */
const toHHMM = (t: string) => (t?.length >= 5 ? t.slice(0, 5) : t || "");

/* =============== Page =============== */
export default function Page() {
  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [areaId, setAreaId] = useState<number | "">(""); // vacío al inicio

  // Semana UI + foto original para hacer diff al guardar
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

      // si algún día quedó sin rangos, mostrar uno por defecto desactivado
      (Object.keys(next) as DayKey[]).forEach((k) => {
        if (!next[k].enabled) next[k] = emptyDay();
      });

      setWeek(next);
      setOriginalWeek(cloneWeek(next)); // snapshot para diff
    } catch (e) {
      console.error("getArea error:", e);
      setWeek({
        lun: emptyDay(),
        mar: emptyDay(),
        mie: emptyDay(),
        jue: emptyDay(),
        vie: emptyDay(),
        sab: emptyDay(),
      });
      setOriginalWeek({
        lun: emptyDay(),
        mar: emptyDay(),
        mie: emptyDay(),
        jue: emptyDay(),
        vie: emptyDay(),
        sab: emptyDay(),
      });
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
      // 1) Mapear originales por id para encontrar borrados/cambios
      const originalById = new Map<
        number,
        { day: DayKey; start: string; end: string }
      >();
      (Object.keys(originalWeek) as DayKey[]).forEach((day) => {
        originalWeek[day].ranges.forEach((r) => {
          if (r.id) originalById.set(r.id, { day, start: r.start, end: r.end });
        });
      });

      // 2) Recorrer UI actual
      const seenIds = new Set<number>();
      for (const day of Object.keys(week) as DayKey[]) {
        const uiDay = week[day];

        if (!uiDay.enabled) {
          // OPCIONAL: log/desactivar todos los originales de ese día
          originalWeek[day].ranges.forEach(async (r) => {
            if (r.id) {
              console.log("DISABLE horario (día OFF)", {
                id: r.id,
                area_id: Number(areaId),
                dia: keyToDayApi[day],
              });
              await updateHorario(r.id, { activo: false });
            }
          });
          continue;
        }

        for (const r of uiDay.ranges) {
          if (r.id) {
            // posible UPDATE
            seenIds.add(r.id);
            const orig = originalById.get(r.id);
            if (!orig) continue;

            if (orig.start !== r.start || orig.end !== r.end) {
              const payload = {
                h_inicio: toHHMMSS(r.start),
                h_fin: toHHMMSS(r.end),
              };
              console.log("UPDATE horario", {
                id: r.id,
                area_id: Number(areaId),
                dia: keyToDayApi[day],
                ...payload,
              });
              await updateHorario(r.id, payload);
            }
          } else {
            // CREATE
            const payload = {
              area_id: Number(areaId),
              dia: keyToDayApi[day],
              h_inicio: toHHMMSS(r.start),
              h_fin: toHHMMSS(r.end),
            };
            console.log("CREATE horario", payload);
            await createHorario(payload);
          }
        }
      }

      // 3) Borrados: originales que no aparecieron en la UI actual
      for (const [id, { day }] of originalById.entries()) {
        if (seenIds.has(id)) continue;
        if (week[day].enabled) {
          // OPCIONAL: log al desactivar por eliminación en UI
          console.log("DISABLE horario (eliminado en UI)", {
            id,
            area_id: Number(areaId),
            dia: keyToDayApi[day],
          });
          await updateHorario(id, { activo: false });
        }
      }

      setStatus({ type: "ok", msg: "Cambios guardados correctamente." });
      // refrescar originales con el estado actual
      setOriginalWeek(cloneWeek(week));
    } catch (e) {
      console.error("error => ", e);
      setStatus({
        type: "error",
        msg: "Ocurrió un error guardando los cambios.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Horario de atención por área
          </h1>
          <p className="mt-1 text-sm text-slate-600">
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
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            status.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : status.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-sky-200 bg-sky-50 text-sky-700"
          }`}
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
                  <span className="inline-block w-28 font-medium text-slate-700">
                    {d.label}
                  </span>
                  {!week[d.key].enabled ? (
                    <span className="text-slate-400">Cerrado</span>
                  ) : (
                    <span className="text-slate-800">
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
            <div className="divide-y divide-slate-100">
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
                    <div className="min-w-28 text-sm font-medium text-slate-800">
                      {d.label}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-start">
                    {week[d.key].ranges.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 shadow-sm"
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
                        <span className="text-slate-400">—</span>
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
                          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-rose-600"
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
