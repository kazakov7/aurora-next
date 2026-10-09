"use client";

/**
 * TravelHeroAnimation — AURORA hero visual with a two-country distance picker.
 *
 * Earth's horizon seen from orbit: a dotted globe turns slowly while flight routes arc
 * between cities. When the visitor picks two countries, the globe turns and zooms to
 * frame both capitals, draws the route between them and shows the great-circle distance.
 *
 * Canvas 2D + CSS only — no libraries, no images. Data lives in ./travelHeroData.ts.
 *
 * Usage:
 *   <div style={{ width: 460, height: 580 }}>   // your existing hero image wrapper
 *     <TravelHeroAnimation locale="en" />
 *   </div>
 *
 * Optional props:
 *   locale        country names via Intl.DisplayNames ("en", "ko", "uz", "ru", ...)
 *   labels        UI texts for your languages (from, to, placeholder, hint, note, swap, clear)
 *   defaultFrom / defaultTo   ISO alpha-2 codes, e.g. "UZ", "KR"
 *   from / to     controlled values (ISO codes or ""), use with onChange
 *   onChange      ({ from, to, km }) => void   — km is null until both are chosen
 *   showPicker    hide the built-in picker if you drive it from your own search form
 *   rounded       built-in arch shape (default true); false if your wrapper already clips
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { COUNTRY_ROWS, LAND_RLE } from "./travelHeroData";

/* ---------------- public types ---------------- */

export type RouteSelection = { from: string; to: string; km: number | null };

export type TravelHeroLabels = {
  from: string;
  to: string;
  placeholder: string;
  hint: string;
  note: string;
  swap: string;
  clear: string;
};

type Props = {
  className?: string;
  style?: CSSProperties;
  rounded?: boolean;
  ariaLabel?: string;
  locale?: string;
  labels?: Partial<TravelHeroLabels>;
  from?: string | null;
  to?: string | null;
  defaultFrom?: string;
  defaultTo?: string;
  onChange?: (selection: RouteSelection) => void;
  showPicker?: boolean;
};

const DEFAULT_LABELS: TravelHeroLabels = {
  from: "From",
  to: "To",
  placeholder: "Select country",
  hint: "Choose two countries to see the distance",
  note: "distance between capitals",
  swap: "Swap countries",
  clear: "Clear",
};

/* ---------------- data ---------------- */

type Country = {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
};
type City = { name: string; lat: number; lon: number };
type Vec = [number, number, number];
type View = { lon: number; lat: number; R: number; cx: number; cy: number };
type Arc = {
  a: number;
  b: number;
  pts: Float32Array;
  born: number;
  grow: number;
  hold: number;
  fade: number;
};
type Selection = {
  a: number;
  b: number;
  va: Vec;
  vb: Vec | null;
  pts: Float32Array | null;
  at: number; // when it was chosen
  born: number; // when the route starts drawing
};
type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  f: number;
  p: number;
};
type Controller = {
  select: (a: number, b: number) => void;
  redraw: () => void;
};

const COUNTRIES: Country[] = COUNTRY_ROWS.map(
  ([code, name, capital, lat, lon]) => ({ code, name, capital, lat, lon }),
);
const COUNTRY_INDEX = new Map(COUNTRIES.map((c, i) => [c.code, i]));

// cities used for the ambient (idle) routes
const CITIES: City[] = [
  { name: "Seoul", lat: 37.57, lon: 126.98 },
  { name: "Tashkent", lat: 41.3, lon: 69.24 },
  { name: "Samarkand", lat: 39.65, lon: 66.96 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Osaka", lat: 34.69, lon: 135.5 },
  { name: "Jeju", lat: 33.5, lon: 126.53 },
  { name: "Beijing", lat: 39.9, lon: 116.41 },
  { name: "Hong Kong", lat: 22.32, lon: 114.17 },
  { name: "Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Malé", lat: 4.18, lon: 73.51 },
  { name: "Almaty", lat: 43.24, lon: 76.89 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Baku", lat: 40.41, lon: 49.87 },
  { name: "Istanbul", lat: 41.01, lon: 28.98 },
  { name: "Cairo", lat: 30.04, lon: 31.24 },
  { name: "Rome", lat: 41.9, lon: 12.5 },
  { name: "Paris", lat: 48.86, lon: 2.35 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Barcelona", lat: 41.39, lon: 2.17 },
  { name: "Marrakech", lat: 31.63, lon: -7.99 },
  { name: "Reykjavík", lat: 64.15, lon: -21.94 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Miami", lat: 25.76, lon: -80.19 },
  { name: "Cancún", lat: 21.16, lon: -86.85 },
  { name: "Mexico City", lat: 19.43, lon: -99.13 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Vancouver", lat: 49.28, lon: -123.12 },
  { name: "Honolulu", lat: 21.31, lon: -157.86 },
];

/* ---------------- constants ---------------- */

const DEG = Math.PI / 180;
const EARTH_KM = 6371;
const SPIN = 3; // ambient rotation, degrees per second
const START_LON = 105; // longitude facing the viewer at start
const TILT = 2; // ambient view latitude, degrees
const MAX_ARCS = 4;
const SEG = 72; // samples per arc
const DOT_SPACING = 5.2; // css px between land dots
const BUCKETS = 6; // brightness levels for land dots
const TWEEN = 1.7; // seconds for the camera move

const GOLD = "245,183,49"; // brand accent
const BLUE = "125,196,255";
const LAND = "150,205,255";

/* ---------------- math ---------------- */

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const ease = (x: number) =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

const toVec = (lat: number, lon: number): Vec => {
  const p = lat * DEG;
  const l = lon * DEG;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};

const angleBetween = (a: Vec, b: Vec) =>
  Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));

export function kmBetween(fromCode: string, toCode: string): number | null {
  const a = COUNTRIES[COUNTRY_INDEX.get(fromCode) ?? -1];
  const b = COUNTRIES[COUNTRY_INDEX.get(toCode) ?? -1];
  if (!a || !b || a === b) return null;
  return Math.round(
    angleBetween(toVec(a.lat, a.lon), toVec(b.lat, b.lon)) * EARTH_KM,
  );
}

/** great-circle samples lifted above the surface in the middle */
function arcPoints(va: Vec, vb: Vec, lift: number): Float32Array {
  const w = angleBetween(va, vb);
  const s = Math.sin(w) || 1e-6;
  const pts = new Float32Array((SEG + 1) * 3);
  // nearly antipodal: bend through a perpendicular so the path is defined
  let mid: Vec | null = null;
  if (w > 179 * DEG) {
    const c: Vec = [va[2], 0, -va[0]];
    const l = Math.hypot(c[0], c[1], c[2]) || 1;
    mid = [c[0] / l, c[1] / l, c[2] / l];
  }
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG;
    let p: Vec;
    if (mid) {
      const m = mid;
      const half = u < 0.5;
      const k = half ? u * 2 : (u - 0.5) * 2;
      const [p0, p1] = half ? [va, m] : [m, vb];
      const ang = angleBetween(p0, p1);
      const ss = Math.sin(ang) || 1e-6;
      const k1 = Math.sin((1 - k) * ang) / ss;
      const k2 = Math.sin(k * ang) / ss;
      p = [
        p0[0] * k1 + p1[0] * k2,
        p0[1] * k1 + p1[1] * k2,
        p0[2] * k1 + p1[2] * k2,
      ];
    } else {
      const k1 = Math.sin((1 - u) * w) / s;
      const k2 = Math.sin(u * w) / s;
      p = [
        va[0] * k1 + vb[0] * k2,
        va[1] * k1 + vb[1] * k2,
        va[2] * k1 + vb[2] * k2,
      ];
    }
    const h = 1 + lift * Math.sin(Math.PI * u);
    pts[i * 3] = p[0] * h;
    pts[i * 3 + 1] = p[1] * h;
    pts[i * 3 + 2] = p[2] * h;
  }
  return pts;
}

/* ---------------- land points ---------------- */

let maskCache: Uint8Array | null = null;
function landMask(): Uint8Array {
  if (maskCache) return maskCache;
  const out = new Uint8Array(360 * 180);
  let i = 0;
  let land = 0;
  for (const run of LAND_RLE.split(",")) {
    const n = parseInt(run, 36);
    if (land) out.fill(1, i, i + n);
    i += n;
    land ^= 1;
  }
  maskCache = out;
  return out;
}

// dots in rows along the parallels, evenly spaced on the sphere
function buildLandPoints(radius: number): Float32Array {
  const step = Math.max(0.6, DOT_SPACING / radius / DEG);
  const mask = landMask();
  const pts: number[] = [];
  for (let lat = -90 + step / 2; lat < 90; lat += step) {
    const row = clamp(Math.floor(90 - lat), 0, 179);
    const count = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / step));
    const offset = (row % 2) * 0.5;
    for (let k = 0; k < count; k++) {
      const lon = -180 + ((k + offset) * 360) / count;
      const col = clamp(Math.floor(lon + 180), 0, 359);
      if (mask[row * 360 + col]) pts.push(...toVec(lat, lon));
    }
  }
  return new Float32Array(pts);
}

function buildGraticule(): Vec[][] {
  const lines: Vec[][] = [];
  for (let lon = -180; lon < 180; lon += 30) {
    const line: Vec[] = [];
    for (let lat = -80; lat <= 80; lat += 4) line.push(toVec(lat, lon));
    lines.push(line);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const line: Vec[] = [];
    for (let lon = -180; lon <= 180; lon += 4) line.push(toVec(lat, lon));
    lines.push(line);
  }
  return lines;
}

/* ---------------- styles ---------------- */

const CSS = `
.ah-root{position:relative;display:block;width:100%;height:100%;aspect-ratio:600/760;overflow:hidden;isolation:isolate;container-type:inline-size;color:#eaf2ff;background:radial-gradient(120% 55% at 50% 0%,#0d2a52 0%,rgba(13,42,82,0) 62%),linear-gradient(180deg,#050d1c 0%,#081a35 58%,#0a2346 100%)}
.ah-root.ah-arch{border-radius:50% 50% 28px 28px/39% 39% 28px 28px;-webkit-mask-image:-webkit-radial-gradient(white,black)}
.ah-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.ah-aurora{position:absolute;left:0;right:0;top:0;height:62%;pointer-events:none;mix-blend-mode:screen}
.ah-band{position:absolute;left:-25%;width:150%;height:36%;border-radius:50%;filter:blur(34px);will-change:transform}
.ah-b1{top:30%;background:radial-gradient(50% 50% at 50% 50%,rgba(45,212,191,.38),rgba(45,212,191,0) 70%);animation:ah-a1 22s ease-in-out infinite alternate}
.ah-b2{top:14%;background:radial-gradient(50% 50% at 50% 50%,rgba(59,130,246,.34),rgba(59,130,246,0) 70%);animation:ah-a2 28s ease-in-out infinite alternate}
.ah-b3{top:40%;height:24%;background:radial-gradient(50% 50% at 50% 50%,rgba(139,123,255,.24),rgba(139,123,255,0) 70%);animation:ah-a3 34s ease-in-out infinite alternate}
@keyframes ah-a1{from{transform:translateX(-8%) rotate(-6deg) scaleY(.8)}to{transform:translateX(8%) rotate(4deg) scaleY(1.15)}}
@keyframes ah-a2{from{transform:translateX(10%) rotate(5deg)}to{transform:translateX(-10%) rotate(-3deg) scaleY(1.2)}}
@keyframes ah-a3{from{transform:translateX(-6%) scaleX(.9)}to{transform:translateX(6%) scaleX(1.1) rotate(3deg)}}
.ah-card{position:absolute;top:16%;left:50%;transform:translateX(-50%);width:min(78%,380px);z-index:2;border-radius:20px;background:rgba(8,22,45,.58);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.28)}
.ah-pick{display:flex;align-items:center;gap:2px;padding:5px}
.ah-field{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;padding:8px 24px 9px 12px;border-radius:14px;cursor:pointer;transition:background .2s,box-shadow .2s}
.ah-field:hover{background:rgba(255,255,255,.06)}
.ah-field:focus-within{background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(245,183,49,.65)}
.ah-cap{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8ea6c9;line-height:1}
.ah-val{font-size:clamp(12px,3.3cqw,14px);font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#eaf2ff}
.ah-field:not(.ah-has) .ah-val{color:#9fb4d3;font-weight:500}
.ah-chev{position:absolute;right:10px;top:50%;margin-top:-3px;opacity:.55;pointer-events:none}
.ah-field select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px;border:0;-webkit-appearance:none;appearance:none}
.ah-field select option{color:#0b1a33;background:#fff}
.ah-swap{flex:none;width:30px;height:30px;padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf2ff;display:grid;place-items:center;cursor:pointer;transition:background .2s,transform .3s}
.ah-swap:hover:not(:disabled){background:rgba(255,255,255,.14);transform:rotate(180deg)}
.ah-swap:disabled{opacity:.35;cursor:default}
.ah-swap:focus-visible,.ah-clear:focus-visible{outline:2px solid #f5b731;outline-offset:2px}
.ah-result{position:relative;border-top:1px solid rgba(255,255,255,.08);padding:10px 36px 12px;min-height:66px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center}
.ah-km{display:flex;align-items:baseline;gap:6px;font-size:clamp(22px,6.6cqw,32px);font-weight:700;letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;color:#fff;animation:ah-in .5s ease both}
.ah-km small{font-size:.5em;font-weight:600;letter-spacing:.02em;color:#f5b731}
.ah-sub{max-width:100%;font-size:clamp(10.5px,2.8cqw,12px);line-height:1.3;color:#9fb4d3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ah-hint{font-size:clamp(11px,3cqw,12.5px);line-height:1.4;color:#9fb4d3}
.ah-clear{position:absolute;top:50%;right:10px;margin-top:-13px;width:26px;height:26px;padding:0;border-radius:50%;border:0;background:rgba(255,255,255,.07);color:#cfe0f7;display:grid;place-items:center;cursor:pointer}
.ah-clear:hover{background:rgba(255,255,255,.15)}
.ah-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes ah-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.ah-root[data-paused=true] .ah-band{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.ah-root *{animation:none!important;transition:none!important}}
`;

/* ---------------- picker field ---------------- */

type Option = { code: string; name: string };

function Field(props: {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  disabledCode: string;
  onChange: (code: string) => void;
}) {
  const { label, value, placeholder, options, disabledCode, onChange } = props;
  const current = options.find((o) => o.code === value);
  return (
    <label className={`ah-field${current ? " ah-has" : ""}`}>
      <span className="ah-cap">{label}</span>
      <span className="ah-val">{current ? current.name : placeholder}</span>
      <svg
        className="ah-chev"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 1l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <select
        value={current ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option
            key={o.code}
            value={o.code}
            disabled={o.code === disabledCode}
          >
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------------- component ---------------- */

export default function TravelHeroAnimation({
  className,
  style,
  rounded = true,
  ariaLabel = "Globe showing flight routes between countries",
  locale = "en",
  labels,
  from,
  to,
  defaultFrom = "",
  defaultTo = "",
  onChange,
  showPicker = true,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const namesRef = useRef<Map<string, string>>(new Map());

  const [innerFrom, setInnerFrom] = useState(defaultFrom);
  const [innerTo, setInnerTo] = useState(defaultTo);
  const fromCode = from !== undefined ? from ?? "" : innerFrom;
  const toCode = to !== undefined ? to ?? "" : innerTo;

  // localized names only after mount, so server and client render the same text
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const options = useMemo<Option[]>(() => {
    let names: Intl.DisplayNames | null = null;
    if (ready) {
      try {
        names = new Intl.DisplayNames([locale], { type: "region" });
      } catch {
        names = null;
      }
    }
    const list = COUNTRIES.map((c) => ({
      code: c.code,
      name: names?.of(c.code) ?? c.name,
    }));
    if (ready) list.sort((a, b) => a.name.localeCompare(b.name, locale));
    return list;
  }, [ready, locale]);

  const numberFormat = useMemo(() => {
    try {
      return new Intl.NumberFormat(ready ? locale : "en-US");
    } catch {
      return new Intl.NumberFormat("en-US");
    }
  }, [ready, locale]);

  useEffect(() => {
    namesRef.current = new Map(options.map((o) => [o.code, o.name]));
    controllerRef.current?.redraw(); // refresh labels when the globe is not animating
  }, [options]);

  const km = kmBetween(fromCode, toCode);
  const fromCountry = COUNTRIES[COUNTRY_INDEX.get(fromCode) ?? -1];
  const toCountry = COUNTRIES[COUNTRY_INDEX.get(toCode) ?? -1];

  // count-up for the distance
  const [shownKm, setShownKm] = useState<number | null>(km);
  const shownRef = useRef<number | null>(km);
  useEffect(() => {
    if (km == null) {
      shownRef.current = null;
      setShownKm(null);
      return;
    }
    const start = shownRef.current ?? 0;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || start === km) {
      shownRef.current = km;
      setShownKm(km);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      const v = Math.round(start + (km - start) * (1 - Math.pow(1 - k, 3)));
      shownRef.current = v;
      setShownKm(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [km]);

  const update = (f: string, t: string) => {
    if (from === undefined) setInnerFrom(f);
    if (to === undefined) setInnerTo(t);
    onChange?.({ from: f, to: t, km: kmBetween(f, t) });
  };

  /* ---------------- canvas scene ---------------- */

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const font = getComputedStyle(root).fontFamily || "system-ui, sans-serif";
    const cityVecs = CITIES.map((c) => toVec(c.lat, c.lon));
    const proj = CITIES.map(() => ({ x: 0, y: 0, z: -1 }));
    const graticule = buildGraticule();

    let W = 0;
    let H = 0;
    let dpr = 1;
    let Rbase = 0;
    let topLimit = 0; // bottom edge of the picker card, in css px

    // land dots at a few densities; the one closest to the current zoom is drawn
    const LEVELS = [0.45, 1, 1.9];
    let landSets = new Map<number, Float32Array>();
    let bx: Float32Array = new Float32Array(0);
    let by: Float32Array = new Float32Array(0);
    let bk: Uint8Array = new Uint8Array(0);
    const landFor = (radius: number) => {
      let level = 1;
      let best = Infinity;
      for (const l of LEVELS) {
        const d = Math.abs(Math.log((Rbase * l) / radius));
        if (d < best) {
          best = d;
          level = l;
        }
      }
      let set = landSets.get(level);
      if (!set) {
        set = buildLandPoints(Rbase * level);
        landSets.set(level, set);
      }
      const n = set.length / 3;
      if (bx.length < n) {
        bx = new Float32Array(n);
        by = new Float32Array(n);
        bk = new Uint8Array(n);
      }
      return { set, n, scale: radius / (Rbase * level) };
    };

    let stars: Star[] = [];
    let t = 0;
    let arcs: Arc[] = [];
    let nextSpawn = 0.8;
    let raf = 0;
    let last = 0;
    let visible = true;
    let ambientMix = 1;

    // camera
    let view: View = { lon: START_LON, lat: TILT, R: 1, cx: 0, cy: 0 };
    let tween: { from: View; to: View; start: number } | null = null;
    let mode: "ambient" | "focus" = "ambient";
    let target: (() => View) | null = null;
    let sel: Selection | null = null;

    const ambientView = (lon: number): View => {
      const top = Math.max(H * 0.37, topLimit + 10);
      return { lon, lat: TILT, R: Rbase, cx: W / 2, cy: top + Rbase };
    };

    // projection state for the current frame
    let cosC = 1;
    let sinC = 0;
    let cosT = 1;
    let sinT = 0;
    let R = 1;
    let cx = 0;
    let cy = 0;
    let px = 0;
    let py = 0;
    let pz = 0;
    const applyView = () => {
      cosC = Math.cos(view.lon * DEG);
      sinC = Math.sin(view.lon * DEG);
      cosT = Math.cos(view.lat * DEG);
      sinT = Math.sin(view.lat * DEG);
      R = view.R;
      cx = view.cx;
      cy = view.cy;
    };
    const project = (x: number, y: number, z: number) => {
      const X = x * cosC - z * sinC;
      const Z1 = z * cosC + x * sinC;
      const Y2 = y * cosT - Z1 * sinT;
      pz = Z1 * cosT + y * sinT;
      px = cx + R * X;
      py = cy - R * Y2;
    };
    const hidden = () => pz < 0 && (px - cx) ** 2 + (py - cy) ** 2 < R * R;

    /* fit a set of points (unit sphere coords) into the free area below the card */
    const fit = (
      pts: ArrayLike<number>,
      lon: number,
      lat: number,
      rMin: number,
      rMax: number,
    ): View => {
      const cC = Math.cos(lon * DEG);
      const sC = Math.sin(lon * DEG);
      const cT = Math.cos(lat * DEG);
      const sT = Math.sin(lat * DEG);
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (let i = 0; i < pts.length; i += 3) {
        const x = pts[i] as number;
        const y = pts[i + 1] as number;
        const z = pts[i + 2] as number;
        const X = x * cC - z * sC;
        const Z1 = z * cC + x * sC;
        const Y2 = y * cT - Z1 * sT;
        const Z = Z1 * cT + y * sT;
        if (Z < 0 && X * X + Y2 * Y2 < 1) continue;
        x0 = Math.min(x0, X);
        x1 = Math.max(x1, X);
        y0 = Math.min(y0, -Y2);
        y1 = Math.max(y1, -Y2);
      }
      if (!Number.isFinite(x0)) {
        x0 = -0.05;
        x1 = 0.05;
        y0 = -0.05;
        y1 = 0.05;
      }
      const rx0 = W * 0.14;
      const rx1 = W * 0.86;
      const ry0 = Math.max(H * 0.42, topLimit + 28);
      const ry1 = Math.max(ry0 + H * 0.2, H * 0.78); // leaves room for labels and the page's own badges
      const r = clamp(
        Math.min(
          (rx1 - rx0) / Math.max(x1 - x0, 0.05),
          (ry1 - ry0) / Math.max(y1 - y0, 0.05),
        ),
        rMin,
        rMax,
      );
      return {
        lon,
        lat,
        R: r,
        cx: (rx0 + rx1) / 2 - (r * (x0 + x1)) / 2,
        cy: (ry0 + ry1) / 2 - (r * (y0 + y1)) / 2,
      };
    };

    /*
     * Camera for a route: look at the route's midpoint from 30° to one side of its great
     * circle, so the path reads as a curve and the lifted arc rises "up" on screen.
     * (Viewed head-on, a great circle through the centre would project as a straight line.)
     */
    const routeView = (va: Vec, vb: Vec, pts: Float32Array): View => {
      const unit = (v: Vec): Vec => {
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / l, v[1] / l, v[2] / l];
      };
      const mi = Math.floor(SEG / 2) * 3;
      const m = unit([
        pts[mi] as number,
        pts[mi + 1] as number,
        pts[mi + 2] as number,
      ]);
      const n = unit([
        va[1] * m[2] - va[2] * m[1],
        va[2] * m[0] - va[0] * m[2],
        va[0] * m[1] - va[1] * m[0],
      ]);
      const d = 30 * DEG;
      let best: { lon: number; lat: number; score: number } | null = null;
      for (const sign of [1, -1]) {
        const c = unit([
          m[0] * Math.cos(d) - sign * n[0] * Math.sin(d),
          m[1] * Math.cos(d) - sign * n[1] * Math.sin(d),
          m[2] * Math.cos(d) - sign * n[2] * Math.sin(d),
        ]);
        const lat = clamp(Math.asin(clamp(c[1], -1, 1)) / DEG, -70, 70);
        const lon = Math.atan2(c[0], c[2]) / DEG;
        // screen-down coordinate of a point for this camera (unit radius)
        const cC = Math.cos(lon * DEG);
        const sC = Math.sin(lon * DEG);
        const cT = Math.cos(lat * DEG);
        const sT = Math.sin(lat * DEG);
        const down = (x: number, y: number, z: number) =>
          -(y * cT - (z * cC + x * sC) * sT);
        const mid = down(
          pts[mi] as number,
          pts[mi + 1] as number,
          pts[mi + 2] as number,
        );
        const ends =
          (down(va[0], va[1], va[2]) + down(vb[0], vb[1], vb[2])) / 2;
        const score = mid - ends; // more negative = arc bulges upwards
        if (!best || score < best.score) best = { lon, lat, score };
      }
      const cam = best as { lon: number; lat: number };
      return fit(pts, cam.lon, cam.lat, W * 0.32, Rbase * 2.2);
    };

    const pointView = (v: Vec): View => {
      const lat = Math.asin(v[1]) / DEG;
      const lon = Math.atan2(v[0], v[2]) / DEG;
      return fit(v, lon, clamp(lat - 18, -70, 70), Rbase * 1.3, Rbase * 1.3);
    };

    const animating = () => raf !== 0 && !reduce.matches;

    const moveTo = (to: View) => {
      if (animating()) tween = { from: { ...view }, to, start: t };
      else {
        view = to;
        tween = null;
      }
    };

    const makeStars = () => {
      const count = Math.min(170, Math.round((W * H) / 2200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.7,
        r: 0.5 + Math.random() * 1.1,
        a: 0.25 + Math.random() * 0.6,
        f: 0.4 + Math.random() * 1.4,
        p: Math.random() * Math.PI * 2,
      }));
    };

    const measureCard = () => {
      const card = cardRef.current;
      if (!card) return 0;
      const rr = root.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      return cr.bottom - rr.top;
    };

    const resize = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = w;
      H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const r = Math.min(W * 0.84, H * 0.8);
      if (!Rbase || Math.abs(r - Rbase) / r > 0.12) landSets = new Map();
      Rbase = r;
      topLimit = measureCard();
      makeStars();
      const goal = target ? target() : ambientView(view.lon);
      if (tween) tween.to = goal;
      else view = goal;
    };

    /* ---------- selection from the picker ---------- */

    const select = (a: number, b: number) => {
      const ca = COUNTRIES[a];
      const cb = COUNTRIES[b];
      if (ca && cb && a !== b) {
        const va = toVec(ca.lat, ca.lon);
        const vb = toVec(cb.lat, cb.lon);
        const w = angleBetween(va, vb);
        const pts = arcPoints(
          va,
          vb,
          Math.min(0.32, 0.05 + 0.3 * (w / (Math.PI / 2))),
        );
        sel = {
          a,
          b,
          va,
          vb,
          pts,
          at: t,
          born: animating() ? t + TWEEN * 0.55 : t - 10,
        };
        mode = "focus";
        target = () => routeView(va, vb, pts);
      } else if (ca || cb) {
        const i = ca ? a : b;
        const c = (ca ?? cb) as Country;
        const v = toVec(c.lat, c.lon);
        sel = { a: i, b: -1, va: v, vb: null, pts: null, at: t, born: t };
        mode = "focus";
        target = () => pointView(v);
      } else {
        sel = null;
        mode = "ambient";
        target = null;
      }
      moveTo(target ? target() : ambientView(view.lon));
      if (!animating()) draw(0, false);
    };
    controllerRef.current = {
      select,
      redraw: () => {
        if (!animating()) draw(0, false);
      },
    };

    /* ---------- drawing ---------- */

    /*
     * Country + capital label. Routes bulge upwards, so labels go under the marker; the
     * upper end of a steep route gets its label beside it, away from the other end.
     */
    const label = (
      x: number,
      y: number,
      other: { x: number; y: number } | null,
      title: string,
      sub: string,
      alpha: number,
    ) => {
      if (alpha <= 0.01) return;
      const ls = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      const titleFont = () => {
        ctx.font = `600 10px ${font}`;
        ls.letterSpacing = "1.4px";
      };
      const subFont = () => {
        ctx.font = `500 10px ${font}`;
        ls.letterSpacing = "0px";
      };
      titleFont();
      const tw = ctx.measureText(title).width;
      subFont();
      const width = Math.max(tw, ctx.measureText(sub).width);

      let place: "below" | "above" | "side" = "below";
      if (other && other.y - y > 24) place = "side"; // this is the upper end
      let left = other ? x < other.x : false;
      if (place === "side") {
        if (left && x - 12 - width < 6) left = false;
        else if (!left && x + 12 + width > W - 6) left = true;
        if ((left && x - 12 - width < 6) || (!left && x + 12 + width > W - 6))
          place = "above";
      }
      if (place === "below" && y + 36 > H - 6) place = "above";

      let lx = x;
      let ty = y + 20;
      if (place === "side") {
        lx = x + (left ? -12 : 12);
        ty = y - 1;
        ctx.textAlign = left ? "right" : "left";
      } else {
        lx = clamp(x, 8 + width / 2, W - 8 - width / 2);
        ty = place === "below" ? y + 21 : y - 25;
        ctx.textAlign = "center";
      }
      ctx.shadowColor = "rgba(3,10,24,0.9)";
      ctx.shadowBlur = 6;
      titleFont();
      ctx.fillStyle = `rgba(234,242,255,${(0.95 * alpha).toFixed(3)})`;
      ctx.fillText(title, lx, ty);
      subFont();
      ctx.fillStyle = `rgba(170,190,218,${(0.95 * alpha).toFixed(3)})`;
      ctx.fillText(sub, lx, ty + 13);
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgba(0,0,0,0)";
    };

    const marker = (x: number, y: number, alpha: number) => {
      const pulse = 9 + 2.5 * Math.sin(t * 3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, pulse);
      g.addColorStop(0, `rgba(${GOLD},${(0.5 * alpha).toFixed(3)})`);
      g.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${GOLD},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSelection = () => {
      if (!sel) return;
      const appear = clamp((t - sel.at) / 0.6, 0, 1);
      const ca = COUNTRIES[sel.a];
      const cb = COUNTRIES[sel.b];

      // route line
      if (sel.pts) {
        const life = t - sel.born;
        if (life > 0) {
          const head = ease(Math.min(1, life / 1.3));
          const i1 = Math.min(SEG, Math.ceil(head * SEG));
          ctx.beginPath();
          let pen = false;
          let fx = NaN;
          let fy = NaN;
          let lx = 0;
          let ly = 0;
          for (let i = 0; i <= i1; i++) {
            project(sel.pts[i * 3], sel.pts[i * 3 + 1], sel.pts[i * 3 + 2]);
            if (hidden()) {
              pen = false;
              continue;
            }
            if (pen) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
            pen = true;
            if (Number.isNaN(fx)) {
              fx = px;
              fy = py;
            }
            lx = px;
            ly = py;
          }
          if (!Number.isNaN(fx)) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = `rgba(${GOLD},0.12)`;
            ctx.stroke();
            const g = ctx.createLinearGradient(fx, fy, lx, ly);
            g.addColorStop(0, `rgba(${GOLD},0.45)`);
            g.addColorStop(1, `rgba(${GOLD},1)`);
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = g;
            ctx.stroke();
            if (head < 1) {
              const hg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 10);
              hg.addColorStop(0, `rgba(${GOLD},0.9)`);
              hg.addColorStop(1, `rgba(${GOLD},0)`);
              ctx.fillStyle = hg;
              ctx.beginPath();
              ctx.arc(lx, ly, 10, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          // a light pulse travelling along the finished route
          if (head >= 1 && animating()) {
            const cyc = (life - 1.3) % 3.6;
            if (cyc < 1.8) {
              const u = ease(cyc / 1.8) * SEG;
              const i = Math.min(SEG - 1, Math.floor(u));
              const f = u - i;
              const o = i * 3;
              const p = sel.pts;
              project(
                (p[o] as number) * (1 - f) + (p[o + 3] as number) * f,
                (p[o + 1] as number) * (1 - f) + (p[o + 4] as number) * f,
                (p[o + 2] as number) * (1 - f) + (p[o + 5] as number) * f,
              );
              if (!hidden()) {
                const cg = ctx.createRadialGradient(px, py, 0, px, py, 9);
                cg.addColorStop(0, "rgba(255,246,220,0.95)");
                cg.addColorStop(0.4, `rgba(${GOLD},0.5)`);
                cg.addColorStop(1, `rgba(${GOLD},0)`);
                ctx.fillStyle = cg;
                ctx.beginPath();
                ctx.arc(px, py, 9, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }

      // endpoint markers + labels
      project(sel.va[0], sel.va[1], sel.va[2]);
      const ax = px;
      const ay = py;
      const aVis = pz > 0.02;
      let bxp: number | null = null;
      let byp = 0;
      let bVis = false;
      if (sel.vb) {
        project(sel.vb[0], sel.vb[1], sel.vb[2]);
        bxp = px;
        byp = py;
        bVis = pz > 0.02;
      }
      const names = namesRef.current;
      if (aVis && ca) {
        marker(ax, ay, appear);
        const other = bxp !== null && bVis ? { x: bxp, y: byp } : null;
        label(
          ax,
          ay,
          other,
          (names.get(ca.code) ?? ca.name).toUpperCase(),
          ca.capital,
          appear,
        );
      }
      if (bVis && cb && bxp !== null) {
        const arrived = sel.pts ? clamp((t - sel.born - 1.0) / 0.4, 0, 1) : 1;
        marker(bxp, byp, appear * arrived);
        label(
          bxp,
          byp,
          { x: ax, y: ay },
          (names.get(cb.code) ?? cb.name).toUpperCase(),
          cb.capital,
          appear * arrived,
        );
      }
    };

    const drawArc = (arc: Arc, mix: number) => {
      const life = t - arc.born;
      const head = ease(Math.min(1, life / arc.grow));
      const tl = life - arc.grow - arc.hold;
      const tail = tl > 0 ? ease(Math.min(1, tl / arc.fade)) : 0;
      const i0 = Math.floor(tail * SEG);
      const i1 = Math.min(SEG, Math.ceil(head * SEG));
      const alpha = 0.55 * mix;
      if (alpha < 0.01) return;
      ctx.beginPath();
      let pen = false;
      let fx = NaN;
      let fy = NaN;
      let lx = 0;
      let ly = 0;
      for (let i = i0; i <= i1; i++) {
        project(arc.pts[i * 3], arc.pts[i * 3 + 1], arc.pts[i * 3 + 2]);
        if (hidden()) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
        pen = true;
        if (Number.isNaN(fx)) {
          fx = px;
          fy = py;
        }
        lx = px;
        ly = py;
      }
      if (!Number.isNaN(fx) && i1 > i0) {
        const g = ctx.createLinearGradient(fx, fy, lx, ly);
        g.addColorStop(0, `rgba(${BLUE},0)`);
        g.addColorStop(0.5, `rgba(${BLUE},${(alpha * 0.55).toFixed(3)})`);
        g.addColorStop(1, `rgba(${BLUE},${alpha.toFixed(3)})`);
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = g;
        ctx.stroke();
        if (head < 1) {
          const hg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 7);
          hg.addColorStop(0, `rgba(${BLUE},${(0.9 * mix).toFixed(3)})`);
          hg.addColorStop(1, `rgba(${BLUE},0)`);
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(lx, ly, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const since = life - arc.grow;
      const pb = proj[arc.b];
      if (pb && since > 0 && since < 1.4 && pb.z > 0.02) {
        const k = since / 1.4;
        ctx.strokeStyle = `rgba(${BLUE},${((1 - k) * 0.7 * mix).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pb.x, pb.y, 3 + 14 * k, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const spawn = () => {
      const cand: number[] = [];
      proj.forEach((p, i) => {
        if (
          p.z > 0.28 &&
          p.x > 26 &&
          p.x < W * 0.8 &&
          p.y > Math.max(H * 0.3, topLimit) &&
          p.y < H - 30
        )
          cand.push(i);
      });
      if (cand.length < 2) return;
      for (let k = 0; k < 30; k++) {
        const a = cand[Math.floor(Math.random() * cand.length)] as number;
        const b = cand[Math.floor(Math.random() * cand.length)] as number;
        if (a === b) continue;
        const va = cityVecs[a] as Vec;
        const vb = cityVecs[b] as Vec;
        const w = angleBetween(va, vb);
        if (w < 14 * DEG || w > 72 * DEG) continue;
        if (
          arcs.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))
        )
          continue;
        arcs.push({
          a,
          b,
          pts: arcPoints(va, vb, 0.05 + 0.3 * (w / (Math.PI / 2))),
          born: t,
          grow: 1.6 + 1.4 * (w / (Math.PI / 2)),
          hold: 0.9,
          fade: 1.1,
        });
        return;
      }
    };

    const draw = (dt: number, live: boolean) => {
      t += dt;

      // camera
      if (tween) {
        const k = ease(Math.min(1, (t - tween.start) / TWEEN));
        const f = tween.from;
        const g = tween.to;
        view = {
          lon: f.lon + wrap180(g.lon - f.lon) * k,
          lat: f.lat + (g.lat - f.lat) * k,
          R: f.R * Math.pow(g.R / f.R, k),
          cx: f.cx + (g.cx - f.cx) * k,
          cy: f.cy + (g.cy - f.cy) * k,
        };
        if (k >= 1) tween = null;
      } else if (mode === "ambient" && live) {
        view = { ...view, lon: view.lon - SPIN * dt };
      }
      applyView();
      const goalMix = mode === "ambient" ? 1 : 0;
      ambientMix =
        dt > 0
          ? ambientMix + (goalMix - ambientMix) * Math.min(1, dt * 3)
          : goalMix;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // stars
      ctx.fillStyle = "#dcebff";
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.f + s.p));
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // atmosphere halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.17);
      halo.addColorStop(0, "rgba(80,170,255,0)");
      halo.addColorStop(0.18, "rgba(110,190,255,0.5)");
      halo.addColorStop(0.45, "rgba(70,150,255,0.16)");
      halo.addColorStop(1, "rgba(40,120,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.17, 0, Math.PI * 2);
      ctx.fill();

      // globe body
      const body = ctx.createRadialGradient(
        cx - R * 0.25,
        cy - R * 0.75,
        R * 0.05,
        cx,
        cy,
        R,
      );
      body.addColorStop(0, "#143e70");
      body.addColorStop(0.55, "#0b2546");
      body.addColorStop(1, "#071833");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // graticule
      ctx.beginPath();
      for (const line of graticule) {
        let pen = false;
        for (const v of line) {
          project(v[0], v[1], v[2]);
          if (pz <= 0) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          pen = true;
        }
      }
      ctx.strokeStyle = "rgba(150,200,255,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots, batched by brightness
      const { set, n, scale } = landFor(R);
      const ds = 1.5 * clamp(scale, 0.8, 1.6);
      let m = 0;
      for (let i = 0; i < n; i++) {
        const o = i * 3;
        project(set[o], set[o + 1], set[o + 2]);
        if (pz <= 0.02 || py > H + 2 || py < -2 || px < -2 || px > W + 2)
          continue;
        bx[m] = px - ds / 2;
        by[m] = py - ds / 2;
        bk[m] = Math.min(BUCKETS - 1, (pz * BUCKETS) | 0);
        m++;
      }
      for (let k = 0; k < BUCKETS; k++) {
        ctx.beginPath();
        for (let j = 0; j < m; j++)
          if (bk[j] === k) ctx.rect(bx[j], by[j], ds, ds);
        ctx.fillStyle = `rgba(${LAND},${(
          0.16 +
          (0.74 * (k + 0.5)) / BUCKETS
        ).toFixed(3)})`;
        ctx.fill();
      }

      // rim light + limb line
      const rim = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R);
      rim.addColorStop(0, "rgba(120,190,255,0)");
      rim.addColorStop(1, "rgba(140,200,255,0.22)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(170,215,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // dawn on the horizon
      const sa = -0.62 * Math.PI;
      const sx = cx + R * Math.cos(sa);
      const sy = cy + R * Math.sin(sa);
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.38);
      sun.addColorStop(0, "rgba(255,236,200,0.38)");
      sun.addColorStop(0.3, "rgba(255,200,120,0.1)");
      sun.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);

      // ambient city dots
      CITIES.forEach((_, i) => {
        const v = cityVecs[i] as Vec;
        const p = proj[i] as { x: number; y: number; z: number };
        project(v[0], v[1], v[2]);
        p.x = px;
        p.y = py;
        p.z = pz;
        if (pz < 0.05 || py > H) return;
        ctx.fillStyle = `rgba(255,255,255,${(
          (0.25 + 0.5 * pz) *
          (0.35 + 0.65 * ambientMix)
        ).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ambient routes
      if (live) {
        if (
          mode === "ambient" &&
          !tween &&
          t >= nextSpawn &&
          arcs.length < MAX_ARCS
        ) {
          spawn();
          nextSpawn = t + 0.8 + Math.random() * 0.9;
        }
        arcs = arcs.filter(
          (arc) => t - arc.born < arc.grow + arc.hold + arc.fade,
        );
      }
      for (const arc of arcs) drawArc(arc, ambientMix);

      // the visitor's route
      drawSelection();
    };

    /* ---------- lifecycle ---------- */

    const renderStill = () => {
      t = 0;
      arcs = [];
      if (sel) sel = { ...sel, at: -10, born: -10 };
      draw(0, false); // positions cities
      if (mode === "ambient") {
        spawn();
        spawn();
        for (const arc of arcs) arc.born = -arc.grow - 0.4;
      }
      draw(0, false);
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      draw(dt, true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf || reduce.matches || !visible) return;
      root.dataset.paused = "false";
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      root.dataset.paused = "true";
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) {
        if (reduce.matches) renderStill();
        else draw(0, false);
      }
    });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) start();
      else stop();
    });
    const onReduce = () => {
      if (reduce.matches) {
        stop();
        tween = null;
        if (target) view = target();
        renderStill();
      } else start();
    };

    resize();
    view = ambientView(START_LON);
    if (reduce.matches) {
      root.dataset.paused = "true";
      renderStill();
    } else start();
    ro.observe(root);
    if (cardRef.current) ro.observe(cardRef.current);
    io.observe(root);
    reduce.addEventListener("change", onReduce);

    return () => {
      stop();
      controllerRef.current = null;
      ro.disconnect();
      io.disconnect();
      reduce.removeEventListener("change", onReduce);
    };
  }, []);

  // tell the globe about the current selection
  useEffect(() => {
    controllerRef.current?.select(
      COUNTRY_INDEX.get(fromCode) ?? -1,
      COUNTRY_INDEX.get(toCode) ?? -1,
    );
  }, [fromCode, toCode]);

  const rootClass = ["ah-root", rounded ? "ah-arch" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const fromName = options.find((o) => o.code === fromCode)?.name;
  const toName = options.find((o) => o.code === toCode)?.name;

  return (
    <div ref={rootRef} className={rootClass} style={style} data-paused="false">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ah-aurora" aria-hidden="true">
        <div className="ah-band ah-b2" />
        <div className="ah-band ah-b1" />
        <div className="ah-band ah-b3" />
      </div>
      <canvas
        ref={canvasRef}
        className="ah-canvas"
        role="img"
        aria-label={ariaLabel}
      />

      {showPicker && (
        <div ref={cardRef} className="ah-card">
          <div className="ah-pick">
            <Field
              label={L.from}
              value={fromCode}
              placeholder={L.placeholder}
              options={options}
              disabledCode={toCode}
              onChange={(code) => update(code, toCode)}
            />
            <button
              type="button"
              className="ah-swap"
              aria-label={L.swap}
              title={L.swap}
              disabled={!fromCode && !toCode}
              onClick={() => update(toCode, fromCode)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5h11M10 2l3 3-3 3M14 11H3M6 8l-3 3 3 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Field
              label={L.to}
              value={toCode}
              placeholder={L.placeholder}
              options={options}
              disabledCode={fromCode}
              onChange={(code) => update(fromCode, code)}
            />
          </div>

          <div className="ah-result">
            {km != null && fromCountry && toCountry ? (
              <>
                <div className="ah-km" aria-hidden="true">
                  {numberFormat.format(shownKm ?? km)}
                  <small>km</small>
                </div>
                <div className="ah-sub" aria-hidden="true" title={L.note}>
                  {fromCountry.capital} → {toCountry.capital}
                </div>
              </>
            ) : (
              <div className="ah-hint">{L.hint}</div>
            )}
            <span className="ah-sr" aria-live="polite">
              {km != null
                ? `${fromName} → ${toName}: ${numberFormat.format(km)} km (${
                    L.note
                  })`
                : ""}
            </span>
            {(fromCode || toCode) && (
              <button
                type="button"
                className="ah-clear"
                aria-label={L.clear}
                title={L.clear}
                onClick={() => update("", "")}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l8 8M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
