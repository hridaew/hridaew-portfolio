"use client";

/**
 * Skeuomorphic mobile voice recorder prototype — ported from a Vite+Figma-Make
 * scratch project (recorder-test). Single-file component on purpose so the
 * waffling stays self-contained. See `/waffling/recorder` route.
 *
 * - Disc rotates at 1 turn per 3s (recording uses wall clock, playback uses
 *   audio.currentTime with re-anchored rotation so scrubbing is seamless).
 * - Center circle scales with mic RMS+peak while recording; doubles as
 *   play/pause when there's a recording.
 * - The big chunky slider is the record/stop toggle. Cassette-eject SFX is
 *   preloaded on mount so the first press isn't clipped by mobile autoplay.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

const CASSETTE_EJECT_SFX = "/assets/recorder/cassette-eject.mp3";

// Inline copy of the prototype's `imports/Back/Back.tsx` Figma export — kept
// 1:1 with the original recorder-test source (`<Back />`). Renders the white
// pill + arrow at the bottom-left of the phone frame. In the portfolio the
// outer element is a `next/link` to `/` so it actually navigates home; the
// prototype shipped it as a bare `<button>` with no `onClick` because it was
// a standalone Vite scratch app.
const BACK_ARROW_PATH =
  "M16.88 2.88C16.39 2.39 15.6 2.39 15.11 2.88L6.7 11.29C6.31 11.68 6.31 12.31 6.7 12.7L15.11 21.11C15.6 21.6 16.39 21.6 16.88 21.11C17.37 20.62 17.37 19.83 16.88 19.34L9.54 12L16.89 4.65C17.37 4.16 17.37 3.37 16.88 2.88Z";

function ArrowBackIosNew() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Arrow back ios new">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g clipPath="url(#clip0_1_50)">
          <path d={BACK_ARROW_PATH} fill="#525252" />
        </g>
        <defs>
          <clipPath id="clip0_1_50">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [, setRecordingDuration] = useState(0);
  const [title, setTitle] = useState("New Voice Note");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  // Show a phone-shaped device bezel when there's enough screen real estate
  // (desktop / tablet). On phones, the design fills the screen directly.
  const [isMockupView, setIsMockupView] = useState(false);

  const recordingTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTime = useRef<number>(0);

  const recordingDurationFloat = useRef(0);

  const rafRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const levelRef = useRef(0);
  // Playback anchors: rotation(t) = anchorRotation + ((audio.currentTime - anchorAudioTime) / 3) * 360
  const anchorRotationRef = useRef(0);
  const anchorAudioTimeRef = useRef(0);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const centerCircleRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cassette-eject SFX is preloaded once on mount so the first record-button
  // press plays the click without a mobile autoplay/decode hiccup.
  const clickSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(CASSETTE_EJECT_SFX);
    a.preload = "auto";
    a.volume = 0.425;
    a.load();
    clickSfxRef.current = a;
    return () => {
      a.pause();
      clickSfxRef.current = null;
    };
  }, []);

  const playClickSfx = () => {
    const a = clickSfxRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      // no-op
    }
  };

  // Render the device-bezel mockup on screens big enough to fit one.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 600px) and (min-height: 600px)");
    const update = () => setIsMockupView(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    (mq as unknown as { addListener: (cb: () => void) => void }).addListener(update);
    return () =>
      (mq as unknown as { removeListener: (cb: () => void) => void }).removeListener(update);
  }, []);

  // Scale the design (or bezel, in mockup view) to fit the device's safe-area
  // viewport while preserving aspect ratio. On desktop with mockup active this
  // constrains the design to a phone-shaped frame; on mobile it fills.
  useLayoutEffect(() => {
    const apply = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      const designW = isMockupView ? 414 : 390;
      const designH = isMockupView ? 868 : 844;
      const scale = Math.min(w / designW, h / designH);
      el.style.setProperty("--phone-scale", String(scale));
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.visualViewport?.addEventListener("resize", apply);
    const raf = requestAnimationFrame(apply);
    const t = window.setTimeout(apply, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, [isMockupView]);

  // One-second timer for the on-screen MM:SS readout while recording.
  // (Reset of `seconds` to 0 happens synchronously in `handleToggle` when
  // recording starts, so this effect only owns the interval lifecycle.)
  useEffect(() => {
    if (isRecording) {
      recordingTickRef.current = setInterval(() => setSeconds((p) => p + 1), 1000);
    } else if (recordingTickRef.current) {
      clearInterval(recordingTickRef.current);
      recordingTickRef.current = null;
    }
    return () => {
      if (recordingTickRef.current) clearInterval(recordingTickRef.current);
    };
  }, [isRecording]);

  // Single rAF loop driving disc rotation + audio-reactive center circle.
  useEffect(() => {
    if (!isRecording && !isPlaying) return;

    const recordStartRotation = rotationRef.current;
    const recordStartWall = performance.now();
    let lastSeconds = -1;
    const buf = analyserRef.current ? new Uint8Array(analyserRef.current.fftSize) : null;
    // Capture refs at effect-mount so the cleanup closure doesn't dereference
    // a potentially-stale `.current` after unmount (react-hooks/exhaustive-deps).
    const disc = discRef.current;
    const centerCircle = centerCircleRef.current;

    const tick = () => {
      let rot: number;
      if (isPlaying && audioElementRef.current) {
        const t = audioElementRef.current.currentTime;
        const delta = t - anchorAudioTimeRef.current;
        rot = (anchorRotationRef.current + (delta / 3) * 360) % 360;
        if (rot < 0) rot += 360;
        const s = Math.floor(t);
        if (s !== lastSeconds) {
          lastSeconds = s;
          setSeconds(s);
        }
      } else {
        const elapsed = (performance.now() - recordStartWall) / 1000;
        rot = (recordStartRotation + (elapsed / 3) * 360) % 360;
      }
      rotationRef.current = rot;
      if (disc) {
        disc.style.transform = `rotate(${rot}deg) translateZ(0)`;
      }

      // ---- audio reactivity (recording only) ----
      if (isRecording && buf && analyserRef.current && centerCircle) {
        analyserRef.current.getByteTimeDomainData(buf);
        let peak = 0;
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          const a = Math.abs(v);
          if (a > peak) peak = a;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buf.length);
        const raw = Math.min(1, (peak * 0.7 + rms * 0.3) * 2.5);
        const target = Math.pow(raw, 0.6);
        const prev = levelRef.current;
        levelRef.current =
          target > prev ? prev * 0.4 + target * 0.6 : prev * 0.85 + target * 0.15;
        const scale = 1 + levelRef.current * 0.55;
        centerCircle.style.transform = `translate(-50%, -50%) scale(${scale}) translateZ(0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      levelRef.current = 0;
      if (disc) {
        disc.style.transform = `rotate(${rotationRef.current}deg) translateZ(0)`;
      }
      if (centerCircle) {
        centerCircle.style.transform = "translate(-50%, -50%) scale(1) translateZ(0)";
      }
      setCurrentRotation(rotationRef.current);
    };
  }, [isRecording, isPlaying]);

  // Keep the disc DOM transform synced with React state when idle (e.g. post-scrub).
  useEffect(() => {
    if (!isRecording && !isPlaying && discRef.current) {
      discRef.current.style.transform = `rotate(${currentRotation}deg) translateZ(0)`;
      rotationRef.current = currentRotation;
    }
  }, [currentRotation, isRecording, isPlaying]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    // Unmount-only cleanup. Refs reach into shared resources (media stream,
    // audio context, blob URLs) that need to be released no matter what
    // `cleanupAudio` looks like at unmount time, so we inline the work here.
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.onended = null;
        audioElementRef.current.onloadedmetadata = null;
        audioElementRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      audioChunksRef.current = [];
    };
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleToggle = async () => {
    if (!isRecording) {
      // Fire SFX synchronously inside the gesture stack so mobile autoplay allows it.
      playClickSfx();

      setIsPlaying(false);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const AudioCtx: typeof AudioContext =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioCtx();
        audioContextRef.current = audioContext;
        if (audioContext.state === "suspended") {
          await audioContext.resume().catch(() => {});
        }
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.4;
        analyserRef.current = analyser;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const candidates = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4;codecs=mp4a.40.2",
          "audio/mp4",
          "audio/ogg;codecs=opus",
        ];
        const supportedType =
          typeof MediaRecorder !== "undefined" &&
          typeof MediaRecorder.isTypeSupported === "function"
            ? candidates.find((t) => MediaRecorder.isTypeSupported(t))
            : undefined;
        const mediaRecorder = supportedType
          ? new MediaRecorder(stream, { mimeType: supportedType })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        audioChunksRef.current = [];
        rotationRef.current = 0;
        setCurrentRotation(0);
        setSeconds(0);
        setRecordingDuration(0);
        recordingDurationFloat.current = 0;
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const chunkType = audioChunksRef.current[0]?.type;
          const blobType = mediaRecorder.mimeType || chunkType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
          }
          const audioUrl = URL.createObjectURL(audioBlob);
          audioUrlRef.current = audioUrl;

          const audio = new Audio(audioUrl);
          audio.preload = "auto";
          // iOS Safari uses the attribute form; assigning the property
          // isn't in the standard `HTMLAudioElement` type. Setting the
          // attribute is the cross-browser-safe path.
          audio.setAttribute("playsinline", "");
          audioElementRef.current = audio;
          audio.onloadedmetadata = () => {
            const d = audio.duration;
            if (Number.isFinite(d) && d > 0) {
              recordingDurationFloat.current = d;
              setRecordingDuration(Math.floor(d));
            }
          };
          audio.onended = () => {
            setIsPlaying(false);
            setSeconds(Math.floor(recordingDurationFloat.current));
          };
        };

        mediaRecorder.start();
        recordingStartTime.current = Date.now();
        setIsRecording(true);
        setHasRecording(false);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Unable to access microphone. Please grant microphone permissions.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;

      const preciseElapsed = (Date.now() - recordingStartTime.current) / 1000;
      recordingDurationFloat.current = preciseElapsed;
      setRecordingDuration(Math.floor(preciseElapsed));
      setSeconds(Math.floor(preciseElapsed));
      setIsRecording(false);
      setHasRecording(true);
    }
  };

  const resetRecorderState = () => {
    setHasRecording(false);
    setIsPlaying(false);
    setSeconds(0);
    setRecordingDuration(0);
    recordingDurationFloat.current = 0;
    setCurrentRotation(0);
    rotationRef.current = 0;
    setTitle("New Voice Note");
  };

  const extensionForMime = (mime: string | undefined) => {
    if (!mime) return "webm";
    if (mime.includes("mp4")) return "m4a";
    if (mime.includes("ogg")) return "ogg";
    if (mime.includes("wav")) return "wav";
    return "webm";
  };

  const sanitizeFilename = (name: string) =>
    name.replace(/[\\/:*?"<>|]+/g, "").trim() || "New Voice Note";

  const handleSave = () => {
    if (audioUrlRef.current && hasRecording) {
      const url = audioUrlRef.current;
      const ext = extensionForMime(mediaRecorderRef.current?.mimeType);
      const filename = `${sanitizeFilename(title)}.${ext}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      audioUrlRef.current = null;
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.onended = null;
        audioElementRef.current.onloadedmetadata = null;
        audioElementRef.current = null;
      }
      audioChunksRef.current = [];
    } else {
      cleanupAudio();
    }
    resetRecorderState();
  };

  const handleDelete = () => {
    cleanupAudio();
    resetRecorderState();
  };

  const cleanupAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.onended = null;
      audioElementRef.current.onloadedmetadata = null;
      audioElementRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioChunksRef.current = [];
  };

  const handlePlayPause = () => {
    if (!hasRecording || !audioElementRef.current) return;
    if (!isPlaying) {
      const dur = recordingDurationFloat.current;
      const current = audioElementRef.current.currentTime;
      const atEnd = dur > 0 && current >= dur - 0.05;
      const target = atEnd ? 0 : current;
      if (atEnd) {
        rotationRef.current = 0;
        setCurrentRotation(0);
      }
      audioElementRef.current.currentTime = target;
      anchorRotationRef.current = rotationRef.current;
      anchorAudioTimeRef.current = target;
      const playPromise = audioElementRef.current.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => console.error("Playback failed:", err));
      }
      setIsPlaying(true);
    } else {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  };

  // ---- Pointer-based scrubbing (record-player physics) ----
  // The disc does NOT snap to the finger. On pointer down we capture the
  // pointer's angle and the disc's current rotation. As the finger sweeps
  // around the center, the disc rotates by the same angular delta — exactly
  // like grabbing a real record. Audio time advances at the same 3 s per
  // rotation rate as playback so the mapping stays physically consistent.
  const handleDiscPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasRecording || isRecording) return;
    if (!discRef.current) return;

    const rect = discRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angleAt = (x: number, y: number) => {
      const a = Math.atan2(y - cy, x - cx);
      return ((a * 180) / Math.PI + 90 + 360) % 360;
    };

    const baseRotation = rotationRef.current;
    const baseAudioTime = audioElementRef.current?.currentTime ?? 0;
    let lastAngle = angleAt(e.clientX, e.clientY);
    let accumulated = 0;

    setIsScrubbing(true);

    const apply = () => {
      const dur = recordingDurationFloat.current;
      let rot = (baseRotation + accumulated) % 360;
      if (rot < 0) rot += 360;
      rotationRef.current = rot;
      setCurrentRotation(rot);
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rot}deg) translateZ(0)`;
      }
      if (dur > 0 && audioElementRef.current) {
        const tDelta = (accumulated / 360) * 3;
        const newT = Math.max(0, Math.min(dur, baseAudioTime + tDelta));
        setSeconds(Math.floor(newT));
        audioElementRef.current.currentTime = newT;
        anchorRotationRef.current = rot;
        anchorAudioTimeRef.current = newT;
      }
    };

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      const a = angleAt(ev.clientX, ev.clientY);
      let delta = a - lastAngle;
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      accumulated += delta;
      lastAngle = a;
      apply();
    };
    const onUp = () => {
      setIsScrubbing(false);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  };

  const handleTitleClick = () => setIsEditingTitle(true);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() === "") setTitle("New Voice Note");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const safeBottomPad = "calc(32px + env(safe-area-inset-bottom))";

  return (
    <div
      ref={wrapperRef}
      className="flex items-center justify-center bg-[#1a1a1a]"
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      {/* Outer scale target. Bezel in mockup view; passthrough on mobile. */}
      <div
        style={{
          transform: "scale(var(--phone-scale, 1)) translateZ(0)",
          transformOrigin: "center center",
          willChange: "transform",
          padding: isMockupView ? "12px" : "0",
          borderRadius: isMockupView ? "60px" : "0",
          background: isMockupView ? "#0b0b0b" : "transparent",
          boxShadow: isMockupView
            ? "0 0 0 1.5px #2a2a2a, 0 30px 60px -10px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.45)"
            : "none",
        }}
      >
        <div
          className="w-[390px] h-[844px] bg-black relative shrink-0"
          style={{
            borderRadius: isMockupView ? "48px" : "0",
            overflow: isMockupView ? "hidden" : "visible",
          }}
        >
          {/* Dynamic Island — only in mockup view */}
          {isMockupView && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "11px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120px",
                height: "34px",
                background: "#000",
                borderRadius: "17px",
                zIndex: 100,
                pointerEvents: "none",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            />
          )}

          {/* Back button — 1:1 with the prototype's `<Back />` element, just
              wrapped in `next/link` so it actually goes home. (`PostPill` at
              the bottom-center of the viewport is the portfolio's standard
              waffling chrome and is rendered by `RecorderShell`.) */}
          <Link
            href="/"
            aria-label="Back to home"
            className="absolute left-[24px] size-[56px] z-50 bg-white content-stretch flex items-center justify-center px-[8px] py-[4px] rounded-[32px]"
            style={{ bottom: safeBottomPad, WebkitTapHighlightColor: "transparent" }}
            data-name="Back"
          >
            <div
              aria-hidden="true"
              className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[32px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.15)]"
            />
            <ArrowBackIosNew />
          </Link>

          <div className="overflow-clip absolute bottom-0 rounded-[32px] w-[390px] h-[470px]">
            {/* Background */}
            <div className="absolute h-[470px] left-0 pointer-events-none rounded-[32px] top-0 w-[390px]">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[32px]"
                style={{
                  backgroundImage:
                    "linear-gradient(147.458deg, rgb(217, 217, 217) 0%, rgb(181, 181, 181) 100%)",
                }}
              />
              <div className="absolute inset-0 rounded-[inherit] shadow-[inset_-2px_-2px_2px_0px_rgba(0,0,0,0.5),inset_2px_1px_1px_0px_white,inset_0px_0px_0px_1px_rgba(0,0,0,0.5)]" />
            </div>

            {/* Header bar */}
            <div className="absolute bg-black h-[58px] left-[16px] rounded-[20px] shadow-[-0.5px_-0.5px_0.5px_0px_rgba(0,0,0,0.5),0.5px_0.5px_0.5px_0px_white] top-[16px] w-[358px]" />

            {/* Header title */}
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="absolute font-['Pixelify_Sans',sans-serif] font-normal leading-[normal] left-[24px] text-[#eef1f2] text-[24px] top-[45px] -translate-y-1/2 uppercase bg-transparent border-none outline-none w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
              />
            ) : (
              <p
                onClick={handleTitleClick}
                className="absolute font-['Pixelify_Sans',sans-serif] font-normal leading-[normal] left-[24px] text-[#eef1f2] text-[24px] top-[45px] -translate-y-1/2 uppercase cursor-text w-[250px] overflow-hidden text-ellipsis whitespace-nowrap select-none"
              >
                {title}
              </p>
            )}

            {/* Timer */}
            <div className="absolute bg-[#eef1f2] content-stretch flex h-[42px] items-center justify-center left-[294px] rounded-[16px] top-[24px] w-[72px] select-none">
              <div className="flex flex-col font-['Pixelify_Sans',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-black text-center whitespace-nowrap">
                <p className="leading-[normal]">{formatTime(seconds)}</p>
              </div>
            </div>

            {/* Vinyl Disc — static outer circle */}
            <div className="absolute left-[58px] size-[274px] top-[90px] pointer-events-none">
              <div className="absolute inset-[-0.73%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 278 278"
                >
                  <g filter="url(#filter0_diii_2_35)">
                    <circle cx="139" cy="139" fill="url(#paint0_linear_2_35)" r="137" />
                  </g>
                  <defs>
                    <filter
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                      height="278"
                      id="filter0_diii_2_35"
                      width="278"
                      x="0"
                      y="0"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
                      />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_35" />
                      <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_35" mode="normal" result="shape" />
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      />
                      <feMorphology
                        in="SourceAlpha"
                        operator="erode"
                        radius="1"
                        result="effect2_innerShadow_2_35"
                      />
                      <feOffset />
                      <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
                      />
                      <feBlend in2="shape" mode="normal" result="effect2_innerShadow_2_35" />
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      />
                      <feOffset dx="2" dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                      />
                      <feBlend in2="effect2_innerShadow_2_35" mode="normal" result="effect3_innerShadow_2_35" />
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      />
                      <feOffset dx="-2" dy="-2" />
                      <feGaussianBlur stdDeviation="0.5" />
                      <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
                      />
                      <feBlend in2="effect3_innerShadow_2_35" mode="normal" result="effect4_innerShadow_2_35" />
                    </filter>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="paint0_linear_2_35"
                      x1="2"
                      x2="175.309"
                      y1="2"
                      y2="329.315"
                    >
                      <stop stopColor="#D9D9D9" />
                      <stop offset="1" stopColor="#B5B5B5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Center button on disc — audio reactive during recording, play/pause when idle */}
            <button
              ref={centerCircleRef}
              onClick={hasRecording && !isRecording ? handlePlayPause : undefined}
              className="absolute z-10"
              style={{
                left: "195px",
                top: "227px",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                transform: "translate(-50%, -50%) scale(1) translateZ(0)",
                transformOrigin: "center center",
                willChange: "transform",
                backfaceVisibility: "hidden",
                cursor: hasRecording && !isRecording ? "pointer" : "default",
                pointerEvents: hasRecording && !isRecording ? "auto" : "none",
                border: "none",
                padding: 0,
                background: "transparent",
              }}
              disabled={!hasRecording || isRecording}
              aria-label={
                hasRecording && !isRecording ? (isPlaying ? "Pause playback" : "Play recording") : "Recorder indicator"
              }
            >
              <svg
                className="absolute block inset-0 size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 56 56"
              >
                <circle cx="28" cy="28" fill="#D9D9D9" r="28" />
              </svg>
              {hasRecording && !isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="#575757" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5v14l11-7L8 5z" fill="#575757" />
                    </svg>
                  )}
                </div>
              )}
            </button>

            {/* Rotating content inside the disc */}
            <div
              ref={discRef}
              onPointerDown={handleDiscPointerDown}
              className="absolute left-[58px] size-[274px] top-[90px] select-none"
              style={{
                willChange: "transform",
                backfaceVisibility: "hidden",
                transformOrigin: "center center",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                cursor:
                  hasRecording && !isRecording ? (isScrubbing ? "grabbing" : "grab") : "default",
                pointerEvents: hasRecording && !isRecording ? "auto" : "none",
              }}
            >
              {/* BLIPPY CORP label */}
              <div className="absolute content-stretch flex items-center justify-center left-[191px] p-[2px] rounded-[1px] top-[130px] w-[56px] pointer-events-none">
                <div
                  aria-hidden="true"
                  className="absolute border-[#575757] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]"
                />
                <div className="flex flex-col font-['Pixelify_Sans',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#575757] text-[8px] text-center whitespace-nowrap">
                  <p className="leading-[normal]">BLIPPY CORP</p>
                </div>
              </div>

              {/* Top horizontal line */}
              <div className="absolute flex h-[94px] items-center justify-center left-[136px] top-[7.5px] w-0 pointer-events-none">
                <div className="flex-none rotate-90">
                  <div className="h-0 relative w-[94px]">
                    <div className="absolute inset-[-0.5px_0_0_0]">
                      <svg
                        className="block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 94 0.5"
                      >
                        <line stroke="#575757" strokeWidth="0.5" x2="94" y1="0.25" y2="0.25" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom horizontal line */}
              <div className="absolute flex h-[94px] items-center justify-center left-[136px] top-[173px] w-0 pointer-events-none">
                <div className="flex-none rotate-90">
                  <div className="h-0 relative w-[94px]">
                    <div className="absolute inset-[-0.5px_0_0_0]">
                      <svg
                        className="block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 94 0.5"
                      >
                        <line stroke="#575757" strokeWidth="0.5" x2="94" y1="0.25" y2="0.25" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider shadows */}
            <div className="absolute flex h-[2px] items-center justify-center left-[319px] top-[378px] w-[72px] pointer-events-none">
              <div className="flex-none rotate-90">
                <div className="bg-[rgba(0,0,0,0.5)] blur-[0.5px] h-[72px] w-[2px]" />
              </div>
            </div>
            <div className="absolute bg-[rgba(0,0,0,0.5)] blur-[0.5px] h-[91px] left-[318px] top-[379px] w-[2px] pointer-events-none" />
            <div className="absolute bg-[rgba(255,255,255,0.3)] blur-[0.5px] h-[92px] left-[317px] rounded-[82px] top-[378px] w-px pointer-events-none" />
            <div className="absolute flex h-px items-center justify-center left-[317px] top-[377px] w-[73px] pointer-events-none">
              <div className="flex-none rotate-90">
                <div className="bg-[rgba(255,255,255,0.3)] blur-[0.5px] h-[73px] rounded-[82px] w-px" />
              </div>
            </div>

            {/* Slider handle (record / stop toggle) */}
            <button
              onClick={handleToggle}
              className="absolute h-[91px] left-[319px] rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px] top-[379px] w-[71px] cursor-pointer select-none"
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              aria-pressed={isRecording}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {/* Released layer — fades out when recording */}
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-opacity duration-150 ease-out"
                style={{ opacity: isRecording ? 0 : 1, willChange: "opacity" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(145.838deg, rgb(217, 217, 217) 0%, rgb(181, 181, 181) 100%)",
                  }}
                />
                <div className="absolute inset-0 rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.8),inset_-2px_-2px_2px_0px_rgba(0,0,0,0.5),inset_3px_5px_1px_0px_white,inset_0px_0px_0px_1px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Pressed layer — fades in when recording */}
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-opacity duration-150 ease-out"
                style={{ opacity: isRecording ? 1 : 0, willChange: "opacity" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 w-[71px] h-[84px] rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px]"
                  style={{
                    backgroundImage: "linear-gradient(147.935deg, rgb(0,0,0) 0%, rgb(49,49,49) 100%)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-[3px] w-[71px] h-[88px] rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(146.724deg, rgb(255,255,255) 0%, rgb(181,181,181) 100%)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-[3px] w-[71px] h-[88px] rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.8),inset_-2px_-2px_2px_0px_rgba(0,0,0,0.5),inset_3px_5px_1px_0px_white,inset_0px_0px_0px_1px_rgba(0,0,0,0.5)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-[3px] w-[70px] h-[88px] rounded-bl-[2px] rounded-br-[32px] rounded-tl-[2px] rounded-tr-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(180.334deg, rgba(255,255,255,0) 0.23%, rgba(0,0,0,0.308) 98.64%)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-[4px] w-[3px] h-[87px] blur-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(0,0,0,0) 5.68%, rgba(0,0,0,0.5) 36.36%)",
                  }}
                />
              </div>

              {/* Record (circle) indicator — released, fades out + drops 3px when pressed */}
              <div
                className="absolute right-[24.5px] size-[22px] top-[20px] flex items-center justify-center pointer-events-none transition-[opacity,transform] duration-150 ease-out"
                style={{
                  opacity: isRecording ? 0 : 1,
                  transform: isRecording ? "translateY(3px)" : "translateY(0)",
                  willChange: "opacity, transform",
                }}
              >
                <svg
                  className="absolute block inset-0 size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 22 22"
                >
                  <circle cx="11" cy="11" fill="#FF5757" r="11" />
                </svg>
              </div>
              {/* Stop (square) indicator — pressed surface, fades in + drops in from 3px above */}
              <div
                className="absolute right-[24.5px] size-[22px] top-[23px] flex items-center justify-center pointer-events-none transition-[opacity,transform] duration-150 ease-out"
                style={{
                  opacity: isRecording ? 1 : 0,
                  transform: isRecording ? "translateY(0)" : "translateY(-3px)",
                  willChange: "opacity, transform",
                }}
              >
                <div className="w-[22px] h-[22px] bg-[#FF5757] rounded-[4px]" />
              </div>
            </button>

            {/* Delete and Save buttons — appear after recording */}
            {hasRecording && (
              <>
                <button
                  onClick={handleDelete}
                  className="absolute left-[96px] size-[56px] z-50 animate-popIn"
                  style={{
                    bottom: safeBottomPad,
                    animationDelay: "0ms",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  aria-label="Delete recording"
                >
                  <div className="bg-white content-stretch cursor-pointer flex items-center justify-center relative rounded-[32px] size-full">
                    <div
                      aria-hidden="true"
                      className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[32px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.15)]"
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        fill="#525252"
                      />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={handleSave}
                  className="absolute left-[168px] size-[56px] z-50 animate-popIn"
                  style={{
                    bottom: safeBottomPad,
                    animationDelay: "75ms",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  aria-label="Save recording"
                >
                  <div className="bg-white content-stretch cursor-pointer flex items-center justify-center relative rounded-[32px] size-full">
                    <div
                      aria-hidden="true"
                      className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[32px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.15)]"
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
                        fill="#525252"
                      />
                    </svg>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
