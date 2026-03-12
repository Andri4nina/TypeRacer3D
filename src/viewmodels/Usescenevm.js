import { useEffect } from "react";
import * as THREE from "three";
import { buildWorld, ExhaustSystem, lerp, getLaneX } from "../services/SceneService";

import { BOT_DEFS, TRACK_LENGTH, GAME_MODES, DEFAULT_CAR_ID } from "../constants";
import { loadCarModel } from "../views/lobby/CarSelector";

/**
 * ViewModel — 3-D scene.
 * Loads player car via CarLoaderService (supports GLB + procedural fallback).
 * Bots always use the procedural fallback with their own colour.
 */
export function useSceneVM({
  mountRef, mode, players, playerName, playerCarModelId,
  progressRef, finishedRef,
  botCarMapRef, playerCarMapRef,
}) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isSolo     = mode === GAME_MODES.SOLO;
    const botCount   = isSolo ? 0 : BOT_DEFS.length;
    const totalLanes = Math.max(players.length + botCount, 1);

    const { scene } = buildWorld(totalLanes);

    const camera = new THREE.PerspectiveCamera(58, mount.clientWidth / mount.clientHeight, 0.1, 350);
    camera.position.set(0, 3.2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const allLX = Array.from({ length: totalLanes }, (_, i) => getLaneX(i, totalLanes));

    // ── Load all cars async, then start the loop ─────────────────────────────
    const loadPromises = [];

    // Human players — use their chosen model
    players.forEach((p, i) => {
      const modelId = (p.name === playerName && !p.isBot)
        ? (playerCarModelId ?? DEFAULT_CAR_ID)
        : DEFAULT_CAR_ID;

      const prom = loadCarModel(modelId, p.color).then(car => {
        car.position.set(allLX[i] ?? 0, 0, 6);
        scene.add(car);
        playerCarMapRef.current[p.id] = { car, smoothZ: 6, smoothX: allLX[i] ?? 0, progress: 0 };
      });
      loadPromises.push(prom);
    });

    // Bots — always procedural (default)
    if (!isSolo) {
      BOT_DEFS.forEach((b, i) => {
        const lx   = allLX[players.length + i] ?? getLaneX(players.length + i, totalLanes);
        const prom = loadCarModel(DEFAULT_CAR_ID, b.color).then(car => {
          car.position.set(lx, 0, 6);
          scene.add(car);
          botCarMapRef.current[b.id] = { car, smoothZ: 6, smoothX: lx, progress: 0 };
        });
        loadPromises.push(prom);
      });
    }

    // Start render loop immediately (cars appear as they load)
    const myP     = players.find(p => p.name === playerName && !p.isBot) || players[0];
    const myLaneX = allLX[players.indexOf(myP)] ?? 0;

    const sm = {
      pZ: 6, pX: myLaneX, rY: 0, rZ: 0,
      camX: myLaneX, camZ: myLaneX !== 0 ? 16.5 : 17, camY: 3.2, wSpd: 0,
    };
    const exhaust = new ExhaustSystem(scene);
    let t = 0, lastProg = 0, vel = 0, rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.016;

      const prog = progressRef.current ?? 0;
      vel = lerp(vel, (prog - lastProg) * 60, 0.08);
      lastProg = prog;

      // Non-player human cars
      Object.entries(playerCarMapRef.current).forEach(([id, cm]) => {
        if (myP && id === myP.id) return;
        cm.smoothZ = lerp(cm.smoothZ, 6 - cm.progress * TRACK_LENGTH, 0.055);
        cm.car.position.z = cm.smoothZ;
        spinWheels(cm.car);
      });

      // Bot cars
      Object.values(botCarMapRef.current).forEach(cm => {
        cm.smoothZ = lerp(cm.smoothZ, 6 - cm.progress * TRACK_LENGTH, 0.055);
        cm.car.position.z = cm.smoothZ;
        spinWheels(cm.car);
      });

      // Player car
      const myCM = myP ? playerCarMapRef.current[myP.id] : null;
      if (myCM) {
        const tPZ     = 6 - prog * TRACK_LENGTH;
        const swayAmt = Math.sin(t * 1.3) * 0.018 * Math.min(vel * 20, 1);

        sm.pZ   = lerp(sm.pZ,  tPZ,           0.07);
        sm.pX   = myLaneX;
        sm.rY   = lerp(sm.rY,  swayAmt * 0.55, 0.06);
        sm.rZ   = lerp(sm.rZ, -swayAmt * 0.80, 0.06);
        sm.wSpd = lerp(sm.wSpd, lerp(0.02, 0.24, Math.min(vel * 22, 1)), 0.05);

        myCM.car.position.set(sm.pX, 0, sm.pZ);
        myCM.car.rotation.y = sm.rY;
        myCM.car.rotation.z = sm.rZ;
        myCM.car.rotation.x = lerp(myCM.car.rotation.x, Math.min(vel * 7, 0.05), 0.05);
        spinWheels(myCM.car, sm.wSpd);

        sm.camX = lerp(sm.camX, myLaneX,       0.06);
        sm.camZ = lerp(sm.camZ, sm.pZ + 10.5,  0.06);
        sm.camY = lerp(sm.camY, 3.2 + Math.sin(t * 0.4) * 0.02 + Math.min(vel * 1.2, 0.35), 0.04);
        camera.position.set(sm.camX, sm.camY, sm.camZ);
        camera.lookAt(myLaneX, 0.4, lerp(sm.pZ - 17, sm.pZ - 22, Math.min(vel * 8, 1)));

        if (!finishedRef.current && vel > 0.001 && t % 0.1 < 0.016) exhaust.emit(myCM.car.position);
      }

      exhaust.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      exhaust.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      botCarMapRef.current    = {};
      playerCarMapRef.current = {};
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

function spinWheels(car, speed = 0.13) {
  car.children.forEach((c, i) => { if (i >= 8 && i <= 11) c.rotation.x += speed; });
}