import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Hands, type Results, type NormalizedLandmark } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

type Ctx = { enable(): void; disable(): void; };
const GestureContext = createContext<Ctx>({ enable: () => {}, disable: () => {} });

type Props = {
  children: React.ReactNode;
  framesConfirm?: number;   // consecutive frames needed (default 3–4)
  cooldownMs?: number;      // ignore further gestures for N ms after a trigger
  onOpenHand?: () => void;  // 🖐 show 4–5 fingers
  onFist?: () => void;      // ✊ 0–1 fingers
};

export function GestureProvider({
  children,
  framesConfirm = 3,
  cooldownMs = 2500,
  onOpenHand,
  onFist,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const enabledRef = useRef(false);

  const pendingRef = useRef<"open" | "fist" | "none">("none");
  const confirmCountRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  const waitForLoadedMeta = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (video.readyState >= 1) return resolve();
      const onLoaded = () => { video.removeEventListener("loadedmetadata", onLoaded); resolve(); };
      video.addEventListener("loadedmetadata", onLoaded);
    });

  // --- helpers ---
  function dist(a: NormalizedLandmark, b: NormalizedLandmark) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  // Is a finger extended? (tip farther from wrist than PIP by a margin)
  function isExtended(lm: NormalizedLandmark[], tipIdx: number, pipIdx: number, wrist: NormalizedLandmark, scale: number) {
    const tipW = dist(lm[tipIdx], wrist);
    const pipW = dist(lm[pipIdx], wrist);
    return (tipW - pipW) > 0.06 * scale; // raise to 0.07–0.08 if too sensitive
  }

  // Count extended fingers (thumb, index, middle, ring, pinky)
  function countExtended(lm: NormalizedLandmark[]) {
    const wrist = lm[0];
    const midMCP = lm[9]; // scale reference
    const scale = Math.max(0.0001, dist(wrist, midMCP));

    const thumb  = isExtended(lm, 4, 2, wrist, scale);
    const index  = isExtended(lm, 8, 6, wrist, scale);
    const middle = isExtended(lm, 12,10, wrist, scale);
    const ring   = isExtended(lm, 16,14, wrist, scale);
    const pinky  = isExtended(lm, 20,18, wrist, scale);

    return (thumb?1:0) + (index?1:0) + (middle?1:0) + (ring?1:0) + (pinky?1:0);
  }

  function classify(lm: NormalizedLandmark[]): "open" | "fist" | "none" {
    const n = countExtended(lm);
    if (n >= 4) return "open";
    if (n <= 1) return "fist";
    return "none";
  }

  const ctx = useMemo<Ctx>(
    () => ({
      enable: async () => {
        if (enabledRef.current) return;
        enabledRef.current = true;

        // Hidden <video>
        if (!videoRef.current) {
          const v = document.createElement("video");
          v.style.position = "fixed";
          v.style.opacity = "0";
          v.style.pointerEvents = "none";
          v.style.width = "1px";
          v.style.height = "1px";
          v.autoplay = true;
          v.muted = true;
          v.setAttribute("playsinline", "true");
          document.body.appendChild(v);
          videoRef.current = v;
        }

        // MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          selfieMode: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((res: Results) => {
          const now = performance.now();
          if (now < cooldownUntilRef.current) return; // in cooldown

          const lm = res.multiHandLandmarks?.[0];
          if (!lm) {
            pendingRef.current = "none";
            confirmCountRef.current = 0;
            return;
          }

          const g = classify(lm); // "open" | "fist" | "none"

          if (g === "none") {
            confirmCountRef.current = Math.max(0, confirmCountRef.current - 1);
            return;
          }

          if (pendingRef.current === g) {
            confirmCountRef.current += 1;
          } else {
            pendingRef.current = g;
            confirmCountRef.current = 1;
          }

          if (confirmCountRef.current >= framesConfirm) {
            confirmCountRef.current = 0;
            pendingRef.current = "none";
            cooldownUntilRef.current = now + cooldownMs;

            if (g === "open") onOpenHand?.();
            else if (g === "fist") onFist?.();
          }
        });

        handsRef.current = hands;

        // Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        const video = videoRef.current!;
        video.srcObject = stream;

        await waitForLoadedMeta(video);
        try { await video.play(); } catch (err: any) { if (err?.name !== "AbortError") console.warn("[Gesture] play()", err); }

        cameraRef.current = new Camera(video, {
          onFrame: async () => {
            const v = videoRef.current, h = handsRef.current;
            if (!v || !h) return;
            await h.send({ image: v });
          },
          width: 640,
          height: 480,
        });
        cameraRef.current.start();
      },
      disable: () => {
        enabledRef.current = false;
        cameraRef.current?.stop();
        cameraRef.current = null;
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
          videoRef.current.srcObject = null;
        }
        videoRef.current?.remove();
        videoRef.current = null;
        handsRef.current?.close();
        handsRef.current = null;
        pendingRef.current = "none";
        confirmCountRef.current = 0;
        cooldownUntilRef.current = 0;
      },
    }),
    [framesConfirm, cooldownMs, onOpenHand, onFist]
  );

  useEffect(() => {
    ctx.enable();
    return () => ctx.disable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GestureContext.Provider value={ctx}>{children}</GestureContext.Provider>;
}

export function useGestures() {
  return useContext(GestureContext);
}
