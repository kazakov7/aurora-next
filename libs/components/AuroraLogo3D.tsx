"use client";

/**
 * AURORA 3D logotipi (Next.js / React komponenti).
 *
 * O‘rnatish:  npm install three@0.160.0 && npm install -D @types/three@0.160.0
 * Ishlatish:  <div style={{ height: 320 }}><AuroraLogo3D /></div>
 * Komponent ota-elementning to‘liq o‘lchamini egallaydi, foni shaffof.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Props = {
  className?: string;
  /** Tungi (to‘q) fon uchun shisha globus va soya ranglari */
  night?: boolean;
  /** Bu raqam o‘zgarsa, animatsiya boshidan ijro etiladi */
  replayKey?: number;
  /** Barmoq yoki sichqoncha bilan aylantirish (standart: yoqilgan) */
  interactive?: boolean;
  /** Logotip joylashuvi: markazda yoki chap chetga yopishgan */
  align?: "center" | "left";
  /** Logotip ostidagi soya (standart: o‘chirilgan) */
  shadow?: boolean;
};

type Glyph = { adv: number; d: string };
const GLYPHS: Record<"A" | "U" | "R", Glyph> = {
  A: {
    adv: 1.0823,
    d: "M0.1376 -0.0128Q0.0936 -0.0128 0.0638 0.0078Q0.034 0.0284 0.027 0.0645Q0.0199 0.1007 0.0397 0.1461L0.3929 0.9064Q0.4184 0.9617 0.456 0.9872Q0.4936 1.0128 0.5418 1.0128Q0.5901 1.0128 0.6262 0.9872Q0.6624 0.9617 0.6894 0.9064L1.0426 0.1461Q1.0652 0.1007 1.0589 0.0638Q1.0525 0.027 1.0234 0.0071Q0.9943 -0.0128 0.9518 -0.0128Q0.895 -0.0128 0.8645 0.0128Q0.834 0.0383 0.8099 0.095L0.7645 0.2028L0.3177 0.2028L0.2723 0.095Q0.2468 0.0383 0.2199 0.0128Q0.1929 -0.0128 0.1376 -0.0128ZM0.539 0.7277L0.4028 0.4028L0.6794 0.4028L0.5418 0.7277Z",
  },
  U: {
    adv: 1.061,
    d: "M0.5333 -0.0156Q0.4241 -0.0156 0.3404 0.0121Q0.2567 0.0397 0.1993 0.095Q0.1418 0.1504 0.1128 0.2333Q0.0837 0.3163 0.0837 0.4255L0.0837 0.8809Q0.0837 0.9461 0.1177 0.9794Q0.1518 1.0128 0.2142 1.0128Q0.278 1.0128 0.3113 0.9794Q0.3447 0.9461 0.3447 0.8809L0.3447 0.4227Q0.3447 0.3135 0.3929 0.2582Q0.4411 0.2028 0.5333 0.2028Q0.6241 0.2028 0.6723 0.2582Q0.7206 0.3135 0.7206 0.4227L0.7206 0.8809Q0.7206 0.9461 0.7539 0.9794Q0.7872 1.0128 0.8496 1.0128Q0.9121 1.0128 0.9447 0.9794Q0.9773 0.9461 0.9773 0.8809L0.9773 0.4255Q0.9773 0.2794 0.927 0.1809Q0.8766 0.0823 0.7773 0.0333Q0.678 -0.0156 0.5333 -0.0156Z",
  },
  R: {
    adv: 1.0014,
    d: "M0.2213 -0.0128Q0.1589 -0.0128 0.1248 0.022Q0.0908 0.0567 0.0908 0.1191L0.0908 0.8681Q0.0908 0.9319 0.1255 0.966Q0.1603 1 0.2227 1L0.5716 1Q0.7418 1 0.8348 0.917Q0.9277 0.834 0.9277 0.6865Q0.9277 0.5915 0.8858 0.5213Q0.844 0.4511 0.766 0.4142Q0.7404 0.4014 0.7121 0.3929Q0.7362 0.3858 0.7589 0.373Q0.8057 0.3433 0.8369 0.2837L0.9078 0.156Q0.9305 0.1149 0.9291 0.0759Q0.9277 0.0369 0.8986 0.0121Q0.8695 -0.0128 0.8142 -0.0128Q0.7589 -0.0128 0.7241 0.0099Q0.6894 0.0326 0.6624 0.0809L0.5333 0.3177Q0.5163 0.3489 0.4901 0.361Q0.4638 0.373 0.4298 0.373L0.3518 0.373L0.3518 0.1191Q0.3518 0.0567 0.3191 0.022Q0.2865 -0.0128 0.2213 -0.0128ZM0.3518 0.5574L0.5248 0.5574Q0.6 0.5574 0.6397 0.5872Q0.6794 0.617 0.6794 0.6794Q0.6794 0.739 0.6397 0.7695Q0.6 0.8 0.5248 0.8L0.3518 0.8Z",
  },
};

const BLUE = 0x1987da;
const BLUE_SIDE = 0x0b5fa8;
const R = 0.78; // globus radiusi (harf balandligi = 1)
const TRACK = 0.03;
const GAP = 0.05;
const DEPTH = 0.3;

type Api = { setNight: (on: boolean) => void; replay: () => void };

function shapesFrom(d: string): THREE.Shape[] {
  const sp = new THREE.ShapePath();
  const tok = d.match(/[MLQCZ]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let cmd = "";
  const n = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[MLQCZ]/.test(tok[i])) {
      cmd = tok[i++];
      if (cmd === "Z") continue;
    }
    if (cmd === "M") sp.moveTo(n(), n());
    else if (cmd === "L") sp.lineTo(n(), n());
    else if (cmd === "Q") {
      const a = n(),
        b = n(),
        c = n(),
        e = n();
      sp.quadraticCurveTo(a, b, c, e);
    } else if (cmd === "C") {
      const a = n(),
        b = n(),
        c = n(),
        e = n(),
        f = n(),
        g = n();
      sp.bezierCurveTo(a, b, c, e, f, g);
    } else i++;
  }
  return sp.toShapes(false);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const prog = (t: number, s: number, d: number) => clamp01((t - s) / d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const inOutCubic = (k: number) =>
  k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const outBack = (k: number) => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

export default function AuroraLogo3D({
  className,
  night = false,
  replayKey = 0,
  interactive = true,
  align = "center",
  shadow = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<Api | null>(null);
  const nightRef = useRef(night);
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;
  const alignRef = useRef(align);
  alignRef.current = align;
  const shadowRef = useRef(shadow);
  shadowRef.current = shadow;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL yo‘q: komponent bo‘sh qoladi
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const TARGET = new THREE.Vector3(0, 0.12, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9d6f2, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(2.5, 5, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -5,
      right: 5,
      top: 4,
      bottom: -3,
      near: 1,
      far: 20,
    });
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fd6ff, 1.1);
    rim.position.set(-4, 3, -5);
    scene.add(rim);

    const matFront = new THREE.MeshPhysicalMaterial({
      color: BLUE,
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.55,
    });
    const matSide = new THREE.MeshPhysicalMaterial({
      color: BLUE_SIDE,
      roughness: 0.4,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.5,
    });
    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xe6f3ff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      envMapIntensity: 0.6,
    });

    const root = new THREE.Group();
    scene.add(root);

    /* harflar */
    type GG = {
      geo: THREE.ExtrudeGeometry;
      c: THREE.Vector3;
      min: number;
      max: number;
      adv: number;
    };
    const glyphGeo = {} as Record<"A" | "U" | "R", GG>;
    (["A", "U", "R"] as const).forEach((ch) => {
      const geo = new THREE.ExtrudeGeometry(shapesFrom(GLYPHS[ch].d), {
        depth: DEPTH,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.028,
        bevelSegments: 4,
      });
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const c = new THREE.Vector3();
      bb.getCenter(c);
      const min = bb.min.x,
        max = bb.max.x; // translate() qutini qayta hisoblaydi, oldin o‘qib olamiz
      geo.translate(-c.x, -c.y, -c.z);
      glyphGeo[ch] = { geo, c, min, max, adv: GLYPHS[ch].adv };
    });
    const layout: { ch: "A" | "U" | "R"; x: number }[] = [];
    let x = 0;
    (["A", "U", "R"] as const).forEach((ch) => {
      layout.push({ ch, x });
      x += glyphGeo[ch].adv + TRACK;
    });
    const globeX = layout[2].x + glyphGeo.R.max + GAP + R;
    let x2 = globeX + R + GAP - glyphGeo.R.min;
    layout.push({ ch: "R", x: x2 });
    x2 += glyphGeo.R.adv + TRACK;
    layout.push({ ch: "A", x: x2 });
    const inkL = layout[0].x + glyphGeo.A.min;
    const inkR = layout[4].x + glyphGeo.A.max;
    const SHIFT = -(inkL + inkR) / 2;
    const LOGO_W = inkR - inkL;

    const delays = [0.95, 0.8, 0.62, 0.62, 0.8];
    const letters = layout.map((it, i) => {
      const g = glyphGeo[it.ch];
      const m = new THREE.Mesh(g.geo, [matFront, matSide]);
      m.castShadow = true;
      const base = new THREE.Vector3(it.x + g.c.x + SHIFT, -0.5 + g.c.y, 0);
      m.position.copy(base);
      root.add(m);
      return { m, base, delay: delays[i] };
    });

    /* globus */
    const globe = new THREE.Group();
    globe.position.set(globeX + SHIFT, 0, 0);
    root.add(globe);
    const rimRing = new THREE.Mesh(
      new THREE.TorusGeometry(R - 0.07, 0.07, 18, 120),
      matFront,
    );
    rimRing.castShadow = true;
    globe.add(rimRing);
    const spin = new THREE.Group();
    globe.add(spin);
    const LINE = 0.04;
    [0, 50, -50].forEach((deg) => {
      const t = new THREE.Mesh(
        new THREE.TorusGeometry(R - 0.1, LINE, 12, 100),
        matFront,
      );
      t.rotation.y = THREE.MathUtils.degToRad(90 + deg);
      t.castShadow = true;
      spin.add(t);
    });
    [-0.48, 0, 0.48].forEach((f) => {
      const y = f * (R - 0.1);
      const rr = Math.sqrt((R - 0.1) ** 2 - y * y);
      const t = new THREE.Mesh(
        new THREE.TorusGeometry(rr, LINE, 12, 100),
        matFront,
      );
      t.rotation.x = Math.PI / 2;
      t.position.y = y;
      spin.add(t);
    });
    globe.add(
      new THREE.Mesh(new THREE.SphereGeometry(R - 0.12, 48, 32), matGlass),
    );

    /* orbita, samolyot va iz */
    const orbit = new THREE.Group();
    globe.add(orbit);
    const OC = new THREE.Vector3(0.1 * R, 0.35 * R, 0);
    const ANG = THREE.MathUtils.degToRad(42);
    const U = new THREE.Vector3(Math.cos(ANG), Math.sin(ANG), 0);
    const W = new THREE.Vector3(-Math.sin(ANG), Math.cos(ANG), 0);
    const AX = 1.7 * R,
      BX = 0.34 * R,
      CZ = 0.95 * R;
    const deg = (d: number) => THREE.MathUtils.degToRad(d);
    const TH_START = deg(118),
      TH_END = deg(312),
      TR_START = deg(192);
    const orbitPt = (th: number, out: THREE.Vector3) =>
      out
        .copy(OC)
        .addScaledVector(U, AX * Math.cos(th))
        .addScaledVector(W, BX * Math.sin(th))
        .setZ(-CZ * Math.sin(th));

    const ps = new THREE.Shape();
    ps.moveTo(0.5, 0);
    ps.quadraticCurveTo(0.5, 0.06, 0.38, 0.065);
    [
      [0.08, 0.065],
      [-0.12, 0.44],
      [-0.23, 0.44],
      [-0.13, 0.065],
      [-0.36, 0.06],
      [-0.46, 0.21],
      [-0.54, 0.21],
      [-0.49, 0.04],
    ].forEach((p) => ps.lineTo(p[0], p[1]));
    ps.quadraticCurveTo(-0.52, 0, -0.49, -0.04);
    [
      [-0.54, -0.21],
      [-0.46, -0.21],
      [-0.36, -0.06],
      [-0.13, -0.065],
      [-0.23, -0.44],
      [-0.12, -0.44],
      [0.08, -0.065],
      [0.38, -0.065],
    ].forEach((p) => ps.lineTo(p[0], p[1]));
    ps.quadraticCurveTo(0.5, -0.06, 0.5, 0);
    const planeGeo = new THREE.ExtrudeGeometry(ps, {
      depth: 0.07,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.018,
      bevelSegments: 3,
    });
    planeGeo.center();
    const plane = new THREE.Mesh(planeGeo, [matFront, matSide]);
    plane.castShadow = true;
    const planeWrap = new THREE.Group();
    planeWrap.add(plane);
    orbit.add(planeWrap);

    const SEG = 150,
      RAD = 12,
      TRAIL_R = 0.058;
    const trailPos = new Float32Array((SEG + 1) * (RAD + 1) * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    const idx: number[] = [];
    for (let i = 0; i < SEG; i++)
      for (let j = 0; j < RAD; j++) {
        const a = i * (RAD + 1) + j,
          b = (i + 1) * (RAD + 1) + j;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    trailGeo.setIndex(idx);
    trailGeo.setDrawRange(0, 0);
    const trail = new THREE.Mesh(trailGeo, matFront);
    trail.castShadow = true;
    trail.frustumCulled = false;
    orbit.add(trail);

    const _p = new THREE.Vector3(),
      _a = new THREE.Vector3(),
      _b = new THREE.Vector3();
    const _t = new THREE.Vector3(),
      _n = new THREE.Vector3(),
      _bn = new THREE.Vector3();
    const _cam = new THREE.Vector3(),
      _f = new THREE.Vector3(),
      _z = new THREE.Vector3(),
      _y = new THREE.Vector3();
    const _m = new THREE.Matrix4(),
      _q = new THREE.Quaternion(),
      _q2 = new THREE.Quaternion();
    const ZV = new THREE.Vector3(0, 0, 1);

    const updateTrail = (thHead: number) => {
      const end = thHead - 0.1;
      if (end <= TR_START) {
        trailGeo.setDrawRange(0, 0);
        return;
      }
      for (let i = 0; i <= SEG; i++) {
        const th = TR_START + (end - TR_START) * (i / SEG);
        const s = (th - TR_START) / (TH_END - 0.1 - TR_START);
        const rad = Math.max(
          0.003,
          TRAIL_R * Math.pow(Math.sin(Math.PI * Math.min(1, s)), 0.8),
        );
        orbitPt(th, _p);
        orbitPt(th + 0.002, _a);
        orbitPt(th - 0.002, _b);
        _t.subVectors(_a, _b).normalize();
        _n.crossVectors(_t, ZV);
        if (_n.lengthSq() < 1e-6) _n.set(1, 0, 0);
        _n.normalize();
        _bn.crossVectors(_t, _n).normalize();
        for (let j = 0; j <= RAD; j++) {
          const phi = (j / RAD) * Math.PI * 2,
            k = (i * (RAD + 1) + j) * 3;
          const cs = Math.cos(phi) * rad,
            sn = Math.sin(phi) * rad;
          trailPos[k] = _p.x + cs * _n.x + sn * _bn.x;
          trailPos[k + 1] = _p.y + cs * _n.y + sn * _bn.y;
          trailPos[k + 2] = _p.z + cs * _n.z + sn * _bn.z;
        }
      }
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.computeVertexNormals();
      trailGeo.setDrawRange(0, SEG * RAD * 6);
    };
    const placePlane = (th: number, bob: number) => {
      orbitPt(th, _p);
      orbitPt(th + 0.003, _a);
      orbitPt(th - 0.003, _b);
      _f.subVectors(_a, _b).normalize();
      _p.y += bob;
      planeWrap.position.copy(_p);
      _cam.copy(camera.position);
      orbit.worldToLocal(_cam);
      _z.subVectors(_cam, _p);
      _z.addScaledVector(_f, -_z.dot(_f)).normalize();
      _y.crossVectors(_z, _f).normalize();
      _m.makeBasis(_f, _y, _z);
      planeWrap.quaternion.setFromRotationMatrix(_m);
    };

    /* yulduzchalar */
    const star = new THREE.Shape();
    star.moveTo(0, 1);
    star.quadraticCurveTo(0.12, 0.12, 1, 0);
    star.quadraticCurveTo(0.12, -0.12, 0, -1);
    star.quadraticCurveTo(-0.12, -0.12, -1, 0);
    star.quadraticCurveTo(-0.12, 0.12, 0, 1);
    const starGeo = new THREE.ExtrudeGeometry(star, {
      depth: 0.18,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 2,
    });
    starGeo.center();
    const dotGeo = new THREE.SphereGeometry(1, 20, 14);
    const sparkleDefs: [
      THREE.BufferGeometry,
      number,
      number,
      number,
      number,
    ][] = [
      [starGeo, -1.12, 0.78, 0.25, 0.085],
      [starGeo, 0.36, 1.28, 0.1, 0.045],
      [starGeo, 0.6, 1.12, 0.15, 0.04],
      [starGeo, 1.58, 1.05, 0.2, 0.075],
      [dotGeo, -1.22, -0.72, 0.2, 0.022],
      [dotGeo, 0.05, -1.08, 0.3, 0.017],
    ];
    const sparkles = sparkleDefs.map((s, i) => {
      const m = new THREE.Mesh(s[0], matFront);
      m.position.set(s[1] * R, s[2] * R, s[3]);
      m.userData = { size: s[4], phase: i * 1.7 };
      m.scale.setScalar(0.0001);
      globe.add(m);
      return m;
    });

    /* yerdagi soya */
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const setNight = (on: boolean) => {
      matGlass.color.set(on ? 0x2a7cc4 : 0xe6f3ff);
      matGlass.opacity = on ? 0.22 : 0.32;
      shadowMat.opacity = on ? 0.3 : 0.12;
      rim.intensity = on ? 1.8 : 1.1;
    };
    setNight(nightRef.current);

    /* o‘lcham */
    const FOV_T = Math.tan(THREE.MathUtils.degToRad(15));
    let fitDist = 10;
    let viewW = 1,
      viewH = 1;
    const resize = () => {
      viewW = Math.max(1, host.clientWidth);
      viewH = Math.max(1, host.clientHeight);
      renderer.setSize(viewW, viewH, false);
      const aspect = viewW / viewH;
      fitDist = Math.max(
        (LOGO_W * 1.16) / 2 / (FOV_T * aspect),
        (2.0 * 1.45) / 2 / FOV_T,
      );
    };
    // align="left": kamera logotip markaziga qarab turaveradi, faqat kadr chapga suriladi (lens shift).
    // Shunda tebranish va perspektiva chap chetni kesib qo‘ymaydi.
    const applyView = (dist: number, extra: number) => {
      const aspect = viewW / viewH;
      if (alignRef.current === "left") {
        const hw = dist * FOV_T * aspect; // logotip tekisligida ko‘rinadigan yarim kenglik
        const p = Math.min(
          viewW / 2,
          ((LOGO_W * 0.53 + 0.1 + extra) / hw) * (viewW / 2),
        );
        const s = viewW / 2 - p;
        camera.aspect = (viewW + 2 * s) / viewH;
        camera.setViewOffset(viewW + 2 * s, viewH, 2 * s, 0, viewW, viewH);
      } else {
        camera.aspect = aspect;
        if (camera.view) camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    /* aylantirish */
    let dragging = false,
      lastX = 0,
      targetRot = 0;
    const onDown = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRot = THREE.MathUtils.clamp(
        targetRot + (e.clientX - lastX) * 0.006,
        -0.95,
        0.95,
      );
      lastX = e.clientX;
    };
    const onUp = () => {
      dragging = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    /* vaqt chizig‘i */
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let t0 = performance.now();
    let raf = 0;
    let isInView = true;
    let isPageVisible = typeof document !== "undefined" ? !document.hidden : true;
    let hasRenderedInitialFrame = false;

    const frame = (now: number) => {
      raf = 0;
      const time = now / 1000;
      const t = reduce ? 99 : (now - t0) / 1000;

      const c = inOutCubic(prog(t, 0, 3.6));
      const idle = reduce ? 0 : prog(t, 3.6, 1.5);
      const az = lerp(-0.55, 0, c) + Math.sin(time * 0.35) * 0.07 * idle;
      const el = lerp(0.28, 0.07, c) + Math.sin(time * 0.27) * 0.025 * idle;
      const dist = fitDist * lerp(1.4, 1, c);
      applyView(dist, (1 - c) * 0.4); // intro paytida chetdan ko‘proq joy
      ground.visible = shadowRef.current;
      camera.position.set(
        TARGET.x + dist * Math.sin(az) * Math.cos(el),
        TARGET.y + dist * Math.sin(el),
        TARGET.z + dist * Math.cos(az) * Math.cos(el),
      );
      camera.lookAt(TARGET);

      if (!dragging) targetRot *= 0.94;
      root.rotation.y += (targetRot - root.rotation.y) * 0.14;
      root.position.y = reduce ? 0 : Math.sin(time * 0.9) * 0.025 * idle;

      const g = prog(t, 0, 1.15);
      globe.scale.setScalar(Math.max(0.0001, outBack(g)));
      spin.rotation.y =
        -Math.PI * 1.4 * (1 - outCubic(g)) + time * (reduce ? 0 : 0.4);
      rimRing.quaternion.copy(camera.quaternion);
      rimRing.quaternion.premultiply(
        _q.copy(globe.getWorldQuaternion(_q2)).invert(),
      );

      for (const L of letters) {
        const p = prog(t, L.delay, 0.95),
          e = outCubic(p),
          b = outBack(p);
        L.m.scale.setScalar(Math.max(0.0001, e));
        L.m.rotation.x = (1 - b) * -1.35;
        L.m.position.set(
          L.base.x,
          L.base.y + (1 - e) * 1.1,
          L.base.z - (1 - e) * 1.6,
        );
      }

      const fp = prog(t, 1.45, 2.15);
      const th = lerp(TH_START, TH_END, inOutCubic(fp));
      planeWrap.visible = t >= 1.45;
      planeWrap.scale.setScalar(
        0.62 * Math.max(0.0001, outCubic(prog(t, 1.45, 0.4))),
      );
      placePlane(th, Math.sin(time * 1.6) * 0.02 * prog(t, 3.6, 0.8));
      updateTrail(th);

      sparkles.forEach((s, i) => {
        const p = prog(t, 3.0 + i * 0.11, 0.6);
        const tw = reduce
          ? 1
          : 0.8 + 0.2 * Math.sin(time * 2.4 + s.userData.phase);
        s.scale.setScalar(Math.max(0.0001, outBack(p) * s.userData.size * tw));
        s.rotation.z = reduce ? 0 : time * 0.4 + s.userData.phase;
      });

      renderer.render(scene, camera);
      hasRenderedInitialFrame = true;
      if (isInView && isPageVisible) {
        raf = requestAnimationFrame(frame);
      }
    };

    const syncLoop = () => {
      if (isInView && isPageVisible) {
        if (!raf) {
          raf = requestAnimationFrame(frame);
        }
      } else if (raf && hasRenderedInitialFrame) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              isInView = entry.isIntersecting;
              syncLoop();
            },
            { threshold: 0.01 },
          )
        : null;
    io?.observe(canvas);

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    apiRef.current = {
      setNight: (n: boolean) => {
        setNight(n);
        if (!raf) {
          renderer.render(scene, camera);
        }
      },
      replay: () => {
        t0 = performance.now();
        targetRot = 0;
        syncLoop();
      },
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      apiRef.current = null;
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      [matFront, matSide, matGlass, shadowMat].forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    nightRef.current = night;
    apiRef.current?.setNight(night);
  }, [night]);

  const firstReplay = useRef(true);
  useEffect(() => {
    if (firstReplay.current) {
      firstReplay.current = false;
      return;
    }
    apiRef.current?.replay();
  }, [replayKey]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="AURORA"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        touchAction: interactive ? "pan-y" : "auto",
        cursor: interactive ? "grab" : "default",
      }}
    />
  );
}
