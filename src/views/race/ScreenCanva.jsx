import { useRef } from "react";
import { useSceneVM } from "../../viewmodels/Usescenevm";

export function SceneCanvas({ mode, players, playerName, playerColor, playerCarModelId, progressRef, finishedRef, botCarMapRef, playerCarMapRef }) {
  const mountRef = useRef(null);

  useSceneVM({ mountRef, mode, players, playerName, playerColor, playerCarModelId, progressRef, finishedRef, botCarMapRef, playerCarMapRef });

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}