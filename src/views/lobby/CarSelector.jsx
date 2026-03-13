/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from "react";
import { CAR_MODELS } from "../../constants/Index";
import * as THREE from "three";
import { loadCarModel } from "../../services/CarLoaderService";



/**
 * CarPreview3D — tiny Three.js canvas showing a rotating car.
 * Always mounted (no conditional), re-mounts cleanly when modelId/color changes.
 */
function CarPreview3D({ modelId, color, size = 72 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const sun = new THREE.DirectionalLight(0xfff4e0, 3.5);
    sun.position.set(5, 8, 5); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xb0d0ff, 1.0);
    fill.position.set(-4, 2, -4); scene.add(fill);

    let carGroup = null;
    let rafId;
    let t = 0;
    let alive = true;

    loadCarModel(modelId, color).then(g => {
      if (!alive) return; // component unmounted while loading
      // Centre the car for the preview camera
      const box = new THREE.Box3().setFromObject(g);
      const cen = new THREE.Vector3(); box.getCenter(cen);
      g.position.sub(cen);
      g.position.y += 0.3;
      carGroup = g;
      scene.add(g);
    }).catch(() => {}); // silent fail — fallback handled in loadCarModel

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.018;
      if (carGroup) carGroup.rotation.y = t * 0.7;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [modelId, color, size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, flexShrink: 0, pointerEvents: "none" }}
    />
  );
}

/**
 * ModelCard — one car option in the grid.
 * Shows 3D preview always (not just when selected).
 */
function ModelCard({ def, color, selected, onClick }) {
  const ac = def.preview;
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        border:     `1.5px solid ${selected ? ac : "rgba(255,255,255,0.08)"}`,
        borderRadius: 6,
        background: selected ? `${ac}14` : "rgba(255,255,255,0.02)",
        padding: "8px 8px 6px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transition: "border-color 0.15s, background 0.15s",
        position: "relative", overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Top accent bar when selected */}
      {selected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${ac}, transparent)`,
          pointerEvents: "none",
        }} />
      )}

      {/* 3D preview — always shown */}
      <CarPreview3D modelId={def.id} color={color} size={72} />

      {/* Car name */}
      <div style={{
        fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
        color: selected ? ac : "rgba(255,255,255,0.45)",
        textAlign: "center", lineHeight: 1.3, textTransform: "uppercase",
      }}>
        {def.name}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div style={{ fontSize: 7, letterSpacing: "0.12em", color: ac }}>✓ SELECTED</div>
      )}
    </div>
  );
}

/**
 * CarSelector — grid of all CAR_MODELS.
 * Props:
 *   selectedId  string — currently selected model id
 *   color       string — hex livery colour to apply to preview
 *   onChange    (id) => void
 */
export function CarSelector({ selectedId, color, onChange }) {
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 6,
      }}>
        {CAR_MODELS.map(def => (
          <ModelCard
            key={def.id}
            def={def}
            color={color}
            selected={selectedId === def.id}
            onClick={() => onChange(def.id)}
          />
        ))}
      </div>

      <div style={{
        marginTop: 8, fontSize: 8, color: "rgba(255,255,255,0.18)",
        letterSpacing: "0.06em", lineHeight: 1.6,
      }}>
        💡 Glisse un <code style={{ color: "rgba(255,255,255,0.3)" }}>.glb</code> dans{" "}
        <code style={{ color: "rgba(255,255,255,0.3)" }}>/public/cars/</code> et
        enregistre-le dans <code style={{ color: "rgba(255,255,255,0.3)" }}>constants/index.js</code>
      </div>
    </div>
  );
}