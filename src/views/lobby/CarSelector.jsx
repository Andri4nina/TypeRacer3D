/* eslint-disable react-refresh/only-export-components */
import { CAR_MODELS, DEFAULT_CAR_ID } from "../../constants/Index";
import { buildCar } from "../../services/SceneService";
import * as THREE from "three";

// ── Lazy-load GLTFLoader only when needed (avoids bundle bloat if unused) ──
let _GLTFLoader = null;
async function getGLTFLoader() {
  if (_GLTFLoader) return _GLTFLoader;
  // three/examples is always available alongside three
  const mod = await import("three/examples/jsm/loaders/GLTFLoader.js");
  _GLTFLoader = new mod.GLTFLoader();
  return _GLTFLoader;
}

// ── In-memory cache: modelId → THREE.Group (cloned per use) ─────────────────
const _cache = new Map();

/**
 * loadCarModel(modelId, colorHex) → Promise<THREE.Group>
 *
 * Returns a ready-to-add scene object.
 * - If modelId is "default" or file is null → returns the procedural mesh.
 * - If the GLB fails to load → logs a warning and falls back to procedural.
 * - Applies colorHex to meshes matching colorMesh regex (or all if null).
 */
export async function loadCarModel(modelId, colorHex = "#ffffff") {
  const def = CAR_MODELS.find(m => m.id === modelId) ?? CAR_MODELS.find(m => m.id === DEFAULT_CAR_ID);

  // ── Procedural fallback (default or no file defined) ────────────────────────
  if (!def.file) {
    const g = buildCar(colorHex);
    return g;
  }

  // ── Try GLB load (with cache) ───────────────────────────────────────────────
  try {
    if (!_cache.has(def.id)) {
      const loader = await getGLTFLoader();
      const gltf   = await new Promise((resolve, reject) => {
        loader.load(def.file, resolve, undefined, reject);
      });

      // Normalise: centre + scale
      const root = gltf.scene;
      root.scale.setScalar(def.scale);

      // Auto-centre bounding box
      const box = new THREE.Box3().setFromObject(root);
      const cen = new THREE.Vector3();
      box.getCenter(cen);
      root.position.sub(cen);
      // Sit on ground
      const sz = new THREE.Vector3();
      box.getSize(sz);
      root.position.y += sz.y / 2 + (def.offsetY ?? 0);

      root.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      _cache.set(def.id, root);
    }

    // Clone so each racer has its own instance
    const clone = _cache.get(def.id).clone(true);
    applyColor(clone, colorHex, def.colorMesh);
    return clone;

  } catch (err) {
    console.warn(`[CarLoader] Failed to load "${def.file}", using fallback.`, err);
    return buildCar(colorHex);
  }
}

/**
 * applyColor(group, colorHex, meshFilter)
 * Tints meshes whose names match meshFilter (string/RegExp), or all if null.
 */
export function applyColor(group, colorHex, meshFilter = null) {
  const col = new THREE.Color(colorHex);
  const re  = meshFilter
    ? (typeof meshFilter === "string" ? new RegExp(meshFilter, "i") : meshFilter)
    : null;

  group.traverse(c => {
    if (!c.isMesh) return;
    if (re && !re.test(c.name)) return;
    if (Array.isArray(c.material)) {
      c.material = c.material.map(m => {
        const n = m.clone();
        n.color.set(col);
        return n;
      });
    } else {
      c.material = c.material.clone();
      c.material.color.set(col);
    }
  });
}

/**
 * clearCache() — call when hot-reloading or swapping assets in dev.
 */
export function clearCarCache() { _cache.clear(); }

/**
 * Synchronous preview colour for the selector card (no 3D needed).
 * Returns the catalogue entry's preview hex.
 */
export function getModelPreviewColor(modelId) {
  return CAR_MODELS.find(m => m.id === modelId)?.preview ?? "#f59e0b";
}

// At the bottom of CarSelector.jsx
export function CarSelector() {
    return (
      <div className="car-selector">
        {/* Your UI logic here */}
        <h2>Select Your Ride</h2>
      </div>
    );
  }