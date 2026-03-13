/**
 * CarLoaderService
 *
 * loadCarModel(modelId, colorHex) → Promise<THREE.Group>
 *
 * Rules:
 *   - file: null  → synchronous buildCar() wrapped in Promise.resolve()
 *   - file: path  → async GLTFLoader, cached, fallback to buildCar on any error
 *   - NEVER throws — always resolves with a usable THREE.Group
 */

import * as THREE from "three";
import { buildCar } from "./SceneService";
import { CAR_MODELS, DEFAULT_CAR_ID } from "../constants/Index";

// ── GLTFLoader — lazy import so it's only loaded when actually needed ─────────
let _loaderPromise = null;
function getLoader() {
  if (!_loaderPromise) {
    _loaderPromise = import("three/examples/jsm/loaders/GLTFLoader.js")
      .then(mod => new mod.GLTFLoader())
      .catch(err => {
        console.warn("[CarLoader] GLTFLoader unavailable:", err);
        _loaderPromise = null; // allow retry
        return null;
      });
  }
  return _loaderPromise;
}

// ── GLB cache: modelId → THREE.Group (template, cloned per racer) ─────────────
const _cache = new Map();

// ── Main export ───────────────────────────────────────────────────────────────
export async function loadCarModel(modelId, colorHex = "#ffffff") {
  // Find definition; fall back to default if id is unknown
  const def = CAR_MODELS.find(m => m.id === modelId)
           ?? CAR_MODELS.find(m => m.id === DEFAULT_CAR_ID);

  // ── Procedural path (file: null) ──────────────────────────────────────────
  // buildCar is synchronous and always works
  if (!def || !def.file) {
    return buildCar(colorHex);
  }

  // ── GLB path ──────────────────────────────────────────────────────────────
  try {
    if (!_cache.has(def.id)) {
      const loader = await getLoader();
      if (!loader) throw new Error("GLTFLoader unavailable");

      const gltf = await new Promise((resolve, reject) =>
        loader.load(def.file, resolve, undefined, reject)
      );

      const root = gltf.scene;
      root.scale.setScalar(def.scale ?? 1);

      // Auto-centre + sit on ground
      const box  = new THREE.Box3().setFromObject(root);
      const cen  = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(cen);
      box.getSize(size);
      root.position.sub(cen);
      root.position.y += size.y / 2 + (def.offsetY ?? 0);

      root.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });

      _cache.set(def.id, root);
    }

    // Clone — each racer needs an independent instance
    const clone = _cache.get(def.id).clone(true);
    applyColor(clone, colorHex, def.colorMesh ?? null);
    return clone;

  } catch (err) {
    console.warn(`[CarLoader] Cannot load "${def.file}", using procedural fallback.`, err);
    return buildCar(colorHex);
  }
}

// ── Colour tinting ────────────────────────────────────────────────────────────
export function applyColor(group, colorHex, meshFilter = null) {
  const col = new THREE.Color(colorHex);
  const re  = meshFilter
    ? (typeof meshFilter === "string" ? new RegExp(meshFilter, "i") : meshFilter)
    : null;

  group.traverse(c => {
    if (!c.isMesh) return;
    if (re && !re.test(c.name)) return;
    if (Array.isArray(c.material)) {
      c.material = c.material.map(m => { const n = m.clone(); n.color.set(col); return n; });
    } else {
      c.material = c.material.clone();
      c.material.color.set(col);
    }
  });
}

export function clearCarCache() { _cache.clear(); }