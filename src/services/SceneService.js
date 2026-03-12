import * as THREE from "three";
import { TRACK_LENGTH , LANE_WIDTH } from "../constants/Index";


// ── Math helpers ─────────────────────────────────────────────
export const lerp     = (a, b, t) => a + (b - a) * t;
export const getLaneX = (i, total) => {
  const w = total * LANE_WIDTH, sp = w / total;
  return -w / 2 + sp * i + sp / 2;
};

// ── Build world (track + environment) ───────────────────────
export function buildWorld(totalLanes) {
  const RW = Math.max(totalLanes, 1) * LANE_WIDTH;
  const RH = RW / 2;
  const BX = RH + 0.35;

  const scene = new THREE.Scene();
  // ── Daytime sky gradient (horizon haze → deep blue zenith) ──
  scene.fog        = new THREE.Fog(0xd4eaf7, 80, 320);
  scene.background = new THREE.Color(0x87ceeb);

  // ── Lights ───────────────────────────────────────────────────
  // Warm hemisphere: sky blue top, green-brown ground
  scene.add(new THREE.HemisphereLight(0x9ecfe8, 0x6b8c42, 1.4));
  // Main sun — warm white, high angle, sharp shadows
  const sun = new THREE.DirectionalLight(0xfff4e0, 5.0);
  sun.position.set(40, 80, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -100, right: 100, top: 100, bottom: -100, far: 500 });
  sun.shadow.bias = -0.001;
  scene.add(sun);
  // Soft sky fill from opposite side
  const fill = new THREE.DirectionalLight(0xb8d4f0, 1.6);
  fill.position.set(-30, 25, -20); scene.add(fill);

  // ── Sun disc in sky ──────────────────────────────────────────
  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfffbe0 })
  );
  sunDisc.position.set(120, 140, -300); scene.add(sunDisc);

  // ── Clouds ───────────────────────────────────────────────────
  const clouds = [];
  const cloudData = [
    [-30, 32, -90, 1.1], [40, 38, -150, 1.4], [-55, 28, -200, 0.85],
    [20, 35, -260, 1.2], [-10, 42, -60, 0.95], [70, 30, -120, 1.0],
    [-80, 36, -180, 1.3], [55, 44, -240, 0.9],
  ];
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
  cloudData.forEach(([x, y, z, s]) => {
    const g = new THREE.Group();
    [[0,0,0,2.8,1.3,1.8],[2.5,0.4,0,2.2,1.1,1.3],[-2.5,0.3,0,2.2,1.1,1.3],[0.9,1.2,0,1.8,1.0,1.1],[-0.9,1.1,0,1.5,0.9,1.0]]
      .forEach(([cx,cy,cz,sw,sh,sd]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1,8,8), cloudMat.clone());
        m.scale.set(sw*s, sh*s, sd*s); m.position.set(cx*s, cy*s, cz*s); g.add(m);
      });
    g.position.set(x, y, z); scene.add(g); clouds.push(g);
  });

  // ── Road surface — warm grey asphalt ────────────────────────
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(RW, 500),
    new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.88, metalness: 0.05 })
  );
  road.rotation.x = -Math.PI / 2; road.position.z = -240; road.receiveShadow = true; scene.add(road);

  // Edge lines — bright white
  [-RH, RH].forEach(sx => {
    const e = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 500), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    e.rotation.x = -Math.PI / 2; e.position.set(sx, 0.02, -240); scene.add(e);
  });

  // Lane dashes — white
  for (let lane = 1; lane < totalLanes; lane++) {
    const lx = -RH + (RW / totalLanes) * lane;
    for (let i = 0; i < 90; i++) {
      const d = new THREE.Mesh(
        new THREE.PlaneGeometry(0.09, 2.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      d.rotation.x = -Math.PI / 2; d.position.set(lx, 0.02, -i * 5 + 12); scene.add(d);
    }
  }

  // Kerbs — red & white
  [-RH - 0.35, RH + 0.35].forEach(bx => {
    for (let i = 0; i < 70; i++) {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.28, 0.9),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xdc2626 : 0xfafafa })
      );
      b.position.set(bx, 0.14, -i * 7 + 16); b.castShadow = true; scene.add(b);
    }
  });

  // Grass runoff — bright green
  [-1, 1].forEach(s => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(120, 500), new THREE.MeshStandardMaterial({ color: 0x4a9e3f, roughness: 0.95 }));
    g.rotation.x = -Math.PI / 2; g.position.set(s * (RH + 60), -0.01, -240); scene.add(g);
    // Lighter strip right at kerb edge
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 500), new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 0.95 }));
    strip.rotation.x = -Math.PI / 2; strip.position.set(s * (RH + 1.75), 0.005, -240); scene.add(strip);
  });

  // ── Grandstands — colourful day look ────────────────────────
  const standColors = [0xef4444, 0x3b82f6, 0xfbbf24, 0x22c55e, 0xa855f7, 0xf97316];
  [-1, 1].forEach(s => {
    for (let i = 0; i < 6; i++) {
      const h = 9 + Math.random() * 5;
      // Main stand body
      const gs = new THREE.Mesh(
        new THREE.BoxGeometry(20, h, 5),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 })
      );
      gs.position.set(s * (RH + 24 + Math.random() * 6), h / 2, -30 - i * 48 + Math.random() * 8);
      gs.castShadow = true; gs.receiveShadow = true; scene.add(gs);

      // Coloured roof stripe
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(20.2, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: standColors[i % standColors.length] })
      );
      roof.position.set(s * (RH + 24 + Math.random() * 6), h + 0.25, -30 - i * 48 + Math.random() * 8);
      scene.add(roof);

      // Seat rows (coloured strips)
      for (let row = 0; row < 4; row++) {
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(19.5, 0.2, 0.8),
          new THREE.MeshStandardMaterial({ color: standColors[(i + row) % standColors.length] })
        );
        seat.position.set(gs.position.x, 1.2 + row * 1.8, gs.position.z - 1.5);
        scene.add(seat);
      }
    }
  });

  // ── Sponsor boards — bright colours ─────────────────────────
  const boardColors = [0xef4444, 0x3b82f6, 0xfbbf24, 0x22c55e];
  for (let i = 0; i < 14; i++) {
    [-1, 1].forEach((s, si) => {
      const brd = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 2.8, 6.5),
        new THREE.MeshStandardMaterial({ color: boardColors[(i + si) % boardColors.length] })
      );
      brd.position.set(s * (RH + 1.1), 1.4, -i * 22 - 10);
      scene.add(brd);
    });
  }

  // ── Trees ────────────────────────────────────────────────────
  for (let i = 0; i < 40; i++) {
    [-1, 1].forEach(s => {
      const tg = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.28, 2.2, 7),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 })
      );
      trunk.position.y = 1.1; trunk.castShadow = true; tg.add(trunk);
      // 3 cone layers for a pine look
      [[3.8, 1.6, 3.2],[5.6, 1.2, 2.6],[7.1, 0.9, 2.0]].forEach(([py, r, h]) => {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(r, h, 7),
          new THREE.MeshStandardMaterial({ color: py < 5 ? 0x2d6a27 : 0x3a8a34 })
        );
        cone.position.y = py; cone.castShadow = true; tg.add(cone);
      });
      tg.position.set(s * (RH + 2.2 + Math.random() * 6), 0, -i * 12 + 10 + Math.random() * 5);
      scene.add(tg);
    });
  }

  // ── Mountains in distance ────────────────────────────────────
  for (let i = 0; i < 14; i++) {
    const h = Math.random() * 35 + 20;
    const mt = new THREE.Mesh(
      new THREE.ConeGeometry(Math.random() * 16 + 10, h, 5),
      new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x6b7b8c : 0x7a9060 })
    );
    mt.position.set((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 60 + 45), h / 2 - 2, -(Math.random() * 220 + 100));
    scene.add(mt);
  }

  // ── Finish line + arch ───────────────────────────────────────
  const finG = new THREE.Group();
  const fb = new THREE.Mesh(new THREE.PlaneGeometry(RW, 2.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  fb.rotation.x = -Math.PI / 2; fb.position.y = 0.02; finG.add(fb);
  const sq = Math.round(RW);
  for (let c = 0; c < sq; c++) for (let r = 0; r < 2; r++) if ((c + r) % 2 === 0) {
    const ck = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    ck.rotation.x = -Math.PI / 2; ck.position.set(c - sq / 2 + 0.5, 0.03, r - 0.5); finG.add(ck);
  }
  [-RH - 0.15, RH + 0.15].forEach(px => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 9, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    pole.position.set(px, 4.5, 0); finG.add(pole);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(RW + 1.4, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
  beam.position.set(0, 9, 0); finG.add(beam);
  // Red "FINISH" banner
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(RW + 0.8, 1.4), new THREE.MeshStandardMaterial({ color: 0xdc2626, side: THREE.DoubleSide }));
  banner.position.set(0, 8.2, 0.1); finG.add(banner);

  finG.position.set(0, 0, -TRACK_LENGTH);
  scene.add(finG);

  return { scene, clouds };
}

// ── Build car mesh ────────────────────────────────────────────
export function buildCar(colorHex) {
  const color = typeof colorHex === "string" ? parseInt(colorHex.replace("#", ""), 16) : colorHex;

  // Inner group holds all parts — rotated 180° so the nose faces DOWN the track (away from camera)
  const inner = new THREE.Group();
  const g     = new THREE.Group();
  g.add(inner);
  inner.rotation.y = Math.PI;   // ← THIS is the fix: nose now points toward finish line

  const mat = c => new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.25 });
  const win  = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, transparent: true, opacity: 0.72 });
  const wm   = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const rim  = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.05 });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.4, 2.7), mat(color));
  body.position.y = 0.4; body.castShadow = true; inner.add(body);

  // Nose (points toward +Z in inner space = away from cam after rotation)
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.9), mat(color));
  nose.position.set(0, 0.3, 1.75); nose.castShadow = true; inner.add(nose);

  // Cockpit (slightly behind centre)
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.38, 1.1), win);
  cockpit.position.set(0, 0.72, -0.1); inner.add(cockpit);

  // Sidepods
  [-0.7, 0.7].forEach(sx => {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 1.4), mat(color));
    pod.position.set(sx, 0.32, 0.1); pod.castShadow = true; inner.add(pod);
  });

  // Rear wing (at -Z in inner = near camera = correct rear)
  const rw = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.38), mat(color));
  rw.position.set(0, 0.82, -1.28); inner.add(rw);
  [-0.65, 0.65].forEach(sx => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.38), mat(color));
    ep.position.set(sx, 0.62, -1.28); inner.add(ep);
  });

  // Front wing (at +Z in inner = away from cam = correct front)
  const fw = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 0.25), mat(color));
  fw.position.set(0, 0.14, 2.15); inner.add(fw);

  // Wheels — children indices on inner: 8,9 = front; 10,11 = rear (each wheel = tyre + rim = 2 children)
  // front-left, front-right, rear-left, rear-right
  const wg = new THREE.CylinderGeometry(0.29, 0.29, 0.24, 16);
  [
    [-0.8, 0.29,  1.0],   // front-left
    [ 0.8, 0.29,  1.0],   // front-right
    [-0.8, 0.29, -0.95],  // rear-left
    [ 0.8, 0.29, -0.95],  // rear-right
  ].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wg, wm);
    w.rotation.z = Math.PI / 2; w.position.set(x, y, z); inner.add(w);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.25, 8), rim);
    r.rotation.z = Math.PI / 2; r.position.set(x, y, z); inner.add(r);
  });

  // Headlights (at front = +Z in inner)
  const hlM = new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfef9c3, emissiveIntensity: 2.5 });
  [-0.38, 0.38].forEach(x => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.05), hlM);
    hl.position.set(x, 0.38, 2.18); inner.add(hl);
  });

  // Tail lights (at rear = -Z in inner = facing camera = correct)
  const tlM = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5 });
  [-0.48, 0.48].forEach(x => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), tlM);
    tl.position.set(x, 0.4, -1.38); inner.add(tl);
  });

  return g;
}

// ── Exhaust glow particle system ─────────────────────────────
export class ExhaustSystem {
  constructor(scene) { this.scene = scene; this.particles = []; }

  emit(pos) {
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.45 })
      );
      // After inner.rotation.y = PI, the rear of the car is at +Z world
      // so exhaust spawns slightly behind (+Z) the car position
      p.position.copy(pos);
      p.position.y += 0.25;
      p.position.z += 1.5;  // ← +Z = behind car (toward camera) = correct rear
      p.userData = { life: 1, vx: (Math.random() - 0.5) * 0.06, vy: Math.random() * 0.03 + 0.01, vz: 0.06 };
      this.scene.add(p); this.particles.push(p);
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.life -= 0.035;
      p.position.x += p.userData.vx; p.position.y += p.userData.vy; p.position.z += p.userData.vz;
      p.material.opacity = p.userData.life * 0.4;
      p.scale.setScalar(p.userData.life * 0.6 + 0.4);
      if (p.userData.life <= 0) { this.scene.remove(p); this.particles.splice(i, 1); }
    }
  }

  dispose() { this.particles.forEach(p => this.scene.remove(p)); this.particles = []; }
}